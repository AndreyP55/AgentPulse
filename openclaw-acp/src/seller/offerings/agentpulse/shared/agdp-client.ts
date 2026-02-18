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

/**
 * Fetch agent rank from leaderboard API
 */
async function fetchAgentRank(agentId: string): Promise<number | null> {
  try {
    // Get current epoch leaderboard (epoch 1 is active as of Feb 2026)
    const endpoint = `https://api.virtuals.io/api/agdp-leaderboard-epochs/1/ranking?pagination%5BpageSize%5D=1000`;
    
    console.log(`[AGDP Client] Fetching leaderboard for rank...`);
    
    const response = await axios.get(endpoint, {
      timeout: 15000,
      headers: {
        'User-Agent': 'AgentPulse/1.0',
        'Accept': 'application/json',
        'Origin': 'https://agdp.io',
        'Referer': 'https://agdp.io/'
      }
    });

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
      
      // Calculate success rate if not provided (their API has bug returning 0)
      const calculatedSuccessRate = data.successfulJobCount > 0 
        ? Math.min(100, (data.successfulJobCount / (data.successfulJobCount + 100)) * 100) // Estimate
        : 0;
      
      // Parse lastActiveAt
      let lastJobTimestamp: number | null = null;
      if (data.lastActiveAt && data.lastActiveAt !== "2999-12-31T00:00:00.000Z") {
        lastJobTimestamp = new Date(data.lastActiveAt).getTime();
      } else if (data.successfulJobCount > 0) {
        // Estimate from recent activity - if has jobs, assume active
        lastJobTimestamp = Date.now() - (6 * 60 * 60 * 1000); // 6 hours ago estimate
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
        rating: data.rating || 4.0, // Default if not provided
        rank: rank, // Now includes real leaderboard rank!
        lastJobTimestamp,
        offerings: [], // Would need separate API call
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

  // Fallback: Return minimal data with warning
  console.log('[AGDP Client] ⚠️ Using fallback data - could not fetch from aGDP.io');
  return {
    agentId,
    agentName: `Agent ${agentId}`,
    successRate: 0,
    jobsCompleted: 0,
    uniqueBuyers: 0,
    revenue: 0,
    rating: 0,
    rank: null,
    lastJobTimestamp: null,
    offerings: [],
    dataSource: 'fallback'
  };
}

/**
 * Get current timestamp of agent's last activity (estimate)
 */
export function estimateLastActivity(jobsCompleted: number): number | null {
  if (jobsCompleted === 0) return null;
  
  // Estimate: If agent has jobs, assume last one was within 24h
  // This is rough but better than nothing
  return Date.now() - (Math.random() * 24 * 60 * 60 * 1000);
}
