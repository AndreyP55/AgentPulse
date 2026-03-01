/**
 * AgentPulse - aGDP.io Data Client
 * 
 * Smart client that tries multiple methods to fetch agent data:
 * 1. Try unofficial API endpoints
 * 2. Try web scraping with multiple selector strategies
 * 3. Fallback to estimated data based on available info
 */

import axios from "axios";
import * as cheerio from "cheerio";

export interface AgentMetrics {
  agentId: string;
  agentName: string;
  successRate: number;
  jobsCompleted: number;
  uniqueBuyers: number;
  revenue: number;
  rating: number;
  rank: number | null; // Position in leaderboard
  lastJobTimestamp: number | null;
  offerings: Array<{
    name: string;
    price: number;
    description?: string;
  }>;
  dataSource: 'api' | 'scraping' | 'fallback';
}

const AXIOS_OPTS = {
  timeout: 15000,
  headers: {
    'User-Agent': 'AgentPulse/1.0',
    'Accept': 'application/json',
    'Origin': 'https://agdp.io',
    'Referer': 'https://agdp.io/'
  }
};

/**
 * Get active epoch ID (Epoch 2, 3, etc.)
 */
async function getActiveEpochId(): Promise<number> {
  try {
    const res = await axios.get(
      'https://api.virtuals.io/api/agdp-leaderboard-epochs?sort=epochNumber:desc',
      { ...AXIOS_OPTS, timeout: 8000 }
    );
    const epochs = res.data?.data || [];
    const active = epochs.find((e: any) => e.status === 'ACTIVE');
    return active ? (active.id ?? active.epochNumber ?? 2) : 2;
  } catch {
    return 2; // Fallback to epoch 2
  }
}

/**
 * Extract agent ID from URLs like:
 *   agdp.io/agent/3212
 *   https://agdp.io/agent/3212
 *   app.virtuals.io/acp/agent-details/3212
 *   https://app.virtuals.io/acp/agent-details/3212
 */
function extractIdFromUrl(input: string): string | null {
  const patterns = [
    /agdp\.io\/agent\/(\d+)/,
    /app\.virtuals\.io\/acp\/agent-details\/(\d+)/,
    /virtuals\.io\/.*?\/(\d+)/,
  ];
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Resolve agent ID from: numeric ID, URL, agent name, or client wallet (fallback)
 */
export async function resolveAgentId(
  agentIdOrName: string | number | undefined | null,
  clientWallet?: string | null
): Promise<string | null> {
  if (agentIdOrName !== undefined && agentIdOrName !== null && agentIdOrName !== '') {
    const s = String(agentIdOrName).trim();

    // 1. Numeric ID
    if (/^\d+$/.test(s)) return s;

    // 2. URL containing agent ID
    const fromUrl = extractIdFromUrl(s);
    if (fromUrl) return fromUrl;
    // 3. Agent name -> search by name
    try {
      const enc = encodeURIComponent(s);
      const res = await axios.get(
        `https://acpx.virtuals.io/api/agents?filters[name][$eq]=${enc}&pagination[pageSize]=10`,
        AXIOS_OPTS
      );
      const agents = res.data?.data || [];
      if (agents.length === 1) {
        if (agents[0].id) return String(agents[0].id);
      } else if (agents.length > 1) {
        console.log(`[resolveAgentId] WARNING: ${agents.length} agents found with name "${s}": ${agents.map((a: any) => `${a.name}(id:${a.id})`).join(', ')}`);
        console.log(`[resolveAgentId] Returning all matches — caller should use numeric ID for precision`);
        const best = agents.reduce((a: any, b: any) => {
          const aJobs = a.successfulJobCount ?? a.metrics?.successfulJobCount ?? 0;
          const bJobs = b.successfulJobCount ?? b.metrics?.successfulJobCount ?? 0;
          const aRev = a.revenue ?? a.grossAgenticAmount ?? a.metrics?.revenue ?? 0;
          const bRev = b.revenue ?? b.grossAgenticAmount ?? b.metrics?.revenue ?? 0;
          return (bJobs || bRev) > (aJobs || aRev) ? b : a;
        });
        if (best.id) return String(best.id);
      }
    } catch {
      /* ignore */
    }

    // 3b. Fuzzy name search (contains) as fallback
    try {
      const enc = encodeURIComponent(s);
      const res = await axios.get(
        `https://acpx.virtuals.io/api/agents?filters[name][$containsi]=${enc}&pagination[pageSize]=5`,
        AXIOS_OPTS
      );
      const agents = res.data?.data || [];
      if (agents.length > 0) {
        const exact = agents.find((a: any) => String(a.name).toLowerCase() === s.toLowerCase());
        if (exact?.id) return String(exact.id);
        if (agents[0].id) return String(agents[0].id);
      }
    } catch {
      /* ignore */
    }
  }
  // 4. Fallback: find agent by client wallet
  if (clientWallet && /^0x[a-fA-F0-9]{40}$/.test(clientWallet)) {
    try {
      const enc = encodeURIComponent(clientWallet);
      const res = await axios.get(
        `https://acpx.virtuals.io/api/agents?filters[walletAddress][$eq]=${enc}&pagination[pageSize]=1`,
        AXIOS_OPTS
      );
      let agents = res.data?.data || [];
      if (agents.length === 0) {
        const res2 = await axios.get(
          `https://acpx.virtuals.io/api/agents?filters[ownerAddress][$eq]=${enc}&pagination[pageSize]=1`,
          AXIOS_OPTS
        );
        agents = res2.data?.data || [];
      }
      if (agents.length > 0 && agents[0].id) return String(agents[0].id);
    } catch {
      /* ignore */
    }
  }
  return null;
}

/**
 * Fetch agent rank from leaderboard API (uses active epoch)
 */
async function fetchAgentRank(agentId: string): Promise<number | null> {
  try {
    const epochId = await getActiveEpochId();
    const endpoint = `https://api.virtuals.io/api/agdp-leaderboard-epochs/${epochId}/ranking?pagination%5BpageSize%5D=1000`;
    
    console.log(`[AGDP Client] Fetching leaderboard for rank (epoch ${epochId})...`);
    
    const response = await axios.get(endpoint, AXIOS_OPTS);

    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      // Find agent in leaderboard
      const agentData = response.data.data.find((agent: any) => 
        agent.agentId && agent.agentId.toString() === agentId.toString()
      );
      
      if (agentData && agentData.rank) {
        console.log(`[AGDP Client] ✅ Found rank ${agentData.rank} for agent ${agentId}`);
        return agentData.rank;
      }
    }
    
    console.log(`[AGDP Client] ⚠️ Agent ${agentId} not found in leaderboard`);
    return null;
    
  } catch (error: any) {
    console.log(`[AGDP Client] Leaderboard request failed: ${error.message}`);
    return null;
  }
}

/**
 * Try Method 1: Official Virtuals API endpoint
 */
async function tryApiMethod(agentId: string): Promise<AgentMetrics | null> {
  try {
    // REAL API ENDPOINT found via DevTools!
    const endpoint = `https://acpx.virtuals.io/api/metrics/agent/${agentId}`;
    
    console.log(`[AGDP Client] Fetching from: ${endpoint}`);
    
    const response = await axios.get(endpoint, {
      timeout: 10000,
      headers: {
        'User-Agent': 'AgentPulse/1.0',
        'Accept': 'application/json',
        'Origin': 'https://agdp.io',
        'Referer': 'https://agdp.io/'
      }
    });

    if (response.data && response.data.data) {
      const data = response.data.data;
      
      console.log('[AGDP Client] ✅ API data retrieved successfully!');
      console.log(`[AGDP Client] Agent: ${data.name}, Jobs: ${data.successfulJobCount}, Revenue: $${data.revenue}`);
      
      // Use API success rate if available, otherwise estimate from total jobs
      const totalJobs = (data.totalJobCount ?? data.successfulJobCount ?? 0);
      const calculatedSuccessRate = data.successfulJobCount > 0 && totalJobs > 0
        ? Math.min(100, (data.successfulJobCount / totalJobs) * 100)
        : 0;
      
      let lastJobTimestamp: number | null = null;
      if (data.lastActiveAt && data.lastActiveAt !== "2999-12-31T00:00:00.000Z") {
        lastJobTimestamp = new Date(data.lastActiveAt).getTime();
      }
      
      // Fetch rank from leaderboard
      const rank = await fetchAgentRank(agentId);
      
      return {
        agentId: agentId,
        agentName: data.name || `Agent ${agentId}`,
        successRate: data.successRate > 0 ? data.successRate : calculatedSuccessRate,
        jobsCompleted: data.successfulJobCount || 0,
        uniqueBuyers: data.uniqueBuyerCount || 0,
        revenue: data.revenue || 0,
        rating: data.rating ?? 0,
        rank: rank, // Now includes real leaderboard rank!
        lastJobTimestamp,
        offerings: [],
        dataSource: 'api'
      };
    }
    
    return null;
    
  } catch (error: any) {
    console.log(`[AGDP Client] API request failed: ${error.message}`);
    return null;
  }
}

/**
 * Try Method 2: Web Scraping with multiple selector strategies
 */
async function tryScrapingMethod(agentId: string): Promise<AgentMetrics | null> {
  try {
    console.log(`[AGDP Client] Trying web scraping for agent ${agentId}`);
    
    const response = await axios.get(`https://agdp.io/agent/${agentId}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Strategy 1: Try common selectors
    const selectors = {
      successRate: [
        '.success-rate',
        '[data-testid="success-rate"]',
        'div:contains("Success Rate") + div',
        'div:contains("Success Rate")',
      ],
      jobsCompleted: [
        '.jobs-completed',
        '[data-testid="jobs-completed"]',
        'div:contains("Jobs Completed") + div',
        'div:contains("Jobs Completed")',
      ],
      uniqueBuyers: [
        '.unique-buyers',
        '[data-testid="unique-buyers"]',
        'div:contains("Unique Buyers") + div',
      ],
      revenue: [
        '.revenue',
        '[data-testid="revenue"]',
        'div:contains("Revenue") + div',
        'div:contains("Revenue")',
      ],
      rating: [
        '.rating',
        '[data-testid="rating"]',
        'div:contains("Rating") + div',
      ]
    };

    // Extract data using multiple strategies
    let successRate = 0;
    let jobsCompleted = 0;
    let uniqueBuyers = 0;
    let revenue = 0;
    let rating = 0;

    // Try to extract success rate
    for (const selector of selectors.successRate) {
      const text = $(selector).text().trim();
      const match = text.match(/[\d.]+/);
      if (match) {
        successRate = parseFloat(match[0]);
        break;
      }
    }

    // Try to extract jobs completed
    for (const selector of selectors.jobsCompleted) {
      const text = $(selector).text().trim();
      const match = text.match(/[\d,]+/);
      if (match) {
        jobsCompleted = parseInt(match[0].replace(/,/g, ''));
        break;
      }
    }

    // Similar for other metrics...
    for (const selector of selectors.revenue) {
      const text = $(selector).text().trim();
      const match = text.match(/[\d,.]+/);
      if (match) {
        revenue = parseFloat(match[0].replace(/,/g, ''));
        break;
      }
    }

    // If we got at least some data, return it
    if (jobsCompleted > 0 || revenue > 0) {
      console.log('[AGDP Client] ✅ Scraping partially successful');
      return {
        agentId,
        agentName: $('h1, .agent-name, [data-testid="agent-name"]').first().text().trim() || `Agent ${agentId}`,
        successRate,
        jobsCompleted,
        uniqueBuyers,
        revenue,
        rating,
        rank: null, // Rank not available from scraping
        lastJobTimestamp: null, // Hard to scrape
        offerings: [], // Would need separate scraping
        dataSource: 'scraping'
      };
    }

    return null;

  } catch (error) {
    console.log('[AGDP Client] Scraping failed:', error);
    return null;
  }
}

/**
 * Try Method 3: Extract from page text (last resort)
 */
async function tryTextExtractionMethod(agentId: string): Promise<AgentMetrics | null> {
  try {
    const response = await axios.get(`https://agdp.io/agent/${agentId}`);
    const html = response.data;

    // Look for numbers in the HTML
    const jobsMatch = html.match(/Jobs Completed[^\d]*(\d+)/i);
    const revenueMatch = html.match(/Revenue[^\d]*\$?([\d,]+\.?\d*)/i);
    const buyersMatch = html.match(/Unique Buyers[^\d]*(\d+)/i);
    const ratingMatch = html.match(/Rating[^\d]*([\d.]+)/i);

    if (jobsMatch || revenueMatch) {
      console.log('[AGDP Client] ✅ Text extraction found some data');
      return {
        agentId,
        agentName: `Agent ${agentId}`,
        successRate: 0,
        jobsCompleted: jobsMatch ? parseInt(jobsMatch[1]) : 0,
        uniqueBuyers: buyersMatch ? parseInt(buyersMatch[1]) : 0,
        revenue: revenueMatch ? parseFloat(revenueMatch[1].replace(/,/g, '')) : 0,
        rating: ratingMatch ? parseFloat(ratingMatch[1]) : 0,
        rank: null, // Rank not available from text extraction
        lastJobTimestamp: null,
        offerings: [],
        dataSource: 'scraping'
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Main function: Try all methods in sequence
 */
export async function fetchAgentMetrics(agentId: string): Promise<AgentMetrics> {
  console.log(`[AGDP Client] Fetching metrics for agent ${agentId}...`);

  // Method 1: Try API
  const apiData = await tryApiMethod(agentId);
  if (apiData) {
    console.log('[AGDP Client] ✅ Got data from API');
    return apiData;
  }

  // Method 2: Try web scraping
  const scrapedData = await tryScrapingMethod(agentId);
  if (scrapedData && scrapedData.jobsCompleted > 0) {
    console.log('[AGDP Client] ✅ Got data from scraping');
    return scrapedData;
  }

  // Method 3: Try text extraction
  const textData = await tryTextExtractionMethod(agentId);
  if (textData && textData.jobsCompleted > 0) {
    console.log('[AGDP Client] ✅ Got data from text extraction');
    return textData;
  }

  // No data found — agent likely doesn't exist or has no ACP activity
  console.log(`[AGDP Client] ❌ Agent ${agentId} not found in any data source`);
  throw new Error(
    `Agent with ID ${agentId} not found. ` +
    `Verify the ID at https://agdp.io/agent/${agentId} or https://app.virtuals.io/acp/agent-details/${agentId}`
  );
}

/**
 * Returns null — we don't fabricate activity timestamps.
 * Only real data from the API should be used.
 */
export function estimateLastActivity(_jobsCompleted: number): number | null {
  return null;
}

export interface LeaderboardEntry {
  agentId: string;
  name: string;
  rank: number;
  revenue: number;
  successfulJobCount: number;
  uniqueBuyerCount: number;
  successRate: number;
}

/**
 * Fetch full leaderboard data for competitive analysis.
 * Returns array of all agents with their metrics.
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const epochId = await getActiveEpochId();
    const endpoint = `https://api.virtuals.io/api/agdp-leaderboard-epochs/${epochId}/ranking?pagination%5BpageSize%5D=1000`;
    console.log(`[AGDP Client] Fetching full leaderboard (epoch ${epochId})...`);

    const response = await axios.get(endpoint, AXIOS_OPTS);
    const data = response.data?.data;
    if (!Array.isArray(data)) return [];

    return data.map((a: any) => ({
      agentId: String(a.agentId ?? ""),
      name: a.name ?? `Agent ${a.agentId}`,
      rank: a.rank ?? 9999,
      revenue: a.revenue ?? a.grossAgenticAmount ?? 0,
      successfulJobCount: a.successfulJobCount ?? 0,
      uniqueBuyerCount: a.uniqueBuyerCount ?? 0,
      successRate: a.successRate ?? 0,
    }));
  } catch (err: any) {
    console.log(`[AGDP Client] Leaderboard fetch failed: ${err.message}`);
    return [];
  }
}

export interface AgentOffering {
  name: string;
  price: number;
  description: string;
  slaMinutes: number;
}

/**
 * Fetch an agent's registered offerings (name, price, description).
 * Uses the agents API which returns jobs[] array.
 */
export async function fetchAgentOfferings(agentId: string): Promise<AgentOffering[]> {
  try {
    const res = await axios.get(
      `https://acpx.virtuals.io/api/agents/${agentId}`,
      { ...AXIOS_OPTS, timeout: 10000 }
    );
    const jobs = res.data?.data?.jobs ?? res.data?.jobs ?? [];
    if (!Array.isArray(jobs)) return [];

    return jobs
      .filter((j: any) => j.type === "JOB" || j.name)
      .map((j: any) => ({
        name: j.name ?? "unknown",
        price: j.price ?? j.priceV2?.value ?? 0,
        description: j.description ?? "",
        slaMinutes: j.slaMinutes ?? 0,
      }));
  } catch (err: any) {
    console.log(`[AGDP Client] fetchAgentOfferings(${agentId}) failed: ${err.message}`);
    return [];
  }
}
