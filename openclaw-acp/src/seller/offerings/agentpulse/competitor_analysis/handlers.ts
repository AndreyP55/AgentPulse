/**
 * AgentPulse - Competitor Analysis (Premium)
 * Price: 200 USDC
 *
 * Deep competitive intelligence:
 * - Market position (percentiles across all metrics)
 * - Pricing analysis (offerings & prices vs competitors)
 * - Efficiency metrics (revenue/job, revenue/buyer)
 * - Service overlap & market gaps
 * - Threat assessment per competitor
 * - Actionable recommendations with numbers
 */

import type { ExecuteJobResult, ValidationResult } from "../../../runtime/offeringTypes.js";
import {
  fetchAgentMetrics,
  fetchLeaderboard,
  fetchAgentOfferings,
  resolveAgentId,
  type LeaderboardEntry,
  type AgentOffering,
} from "../shared/agdp-client.js";
import { sendResultToWebhook } from "../shared/webhook.js";

interface CompetitorProfile {
  agentId: string;
  name: string;
  rank: number;
  revenue: number;
  jobs: number;
  successRate: number;
  uniqueBuyers: number;
  revenuePerJob: number;
  revenuePerBuyer: number;
  offerings: AgentOffering[];
  avgPrice: number;
  threatLevel: "low" | "medium" | "high";
  threatReason: string;
}

function percentile(value: number, allValues: number[]): number {
  if (allValues.length === 0) return 0;
  const below = allValues.filter((v) => v < value).length;
  return Math.round((below / allValues.length) * 100);
}

function safeDiv(a: number, b: number): number {
  return b > 0 ? a / b : 0;
}

function findCompetitors(
  target: { agentId: string; rank: number; revenue: number; jobs: number },
  leaderboard: LeaderboardEntry[],
  count: number
): LeaderboardEntry[] {
  const others = leaderboard.filter((a) => a.agentId !== target.agentId);

  const scored = others.map((a) => {
    const revDiff = Math.abs(a.revenue - target.revenue) / Math.max(target.revenue, 1);
    const jobDiff = Math.abs(a.successfulJobCount - target.jobs) / Math.max(target.jobs, 1);
    const rankDiff = Math.abs(a.rank - target.rank) / 1000;
    const similarity = 1 / (1 + revDiff + jobDiff + rankDiff);
    return { entry: a, similarity };
  });

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, count).map((s) => s.entry);
}

function assessThreat(
  target: { revenue: number; jobs: number; successRate: number; rank: number },
  comp: { revenue: number; jobs: number; successRate: number; rank: number; name: string }
): { level: "low" | "medium" | "high"; reason: string } {
  let score = 0;
  const reasons: string[] = [];

  if (comp.rank < target.rank) {
    score += 2;
    reasons.push(`ranked higher (#${comp.rank} vs #${target.rank})`);
  }
  if (comp.revenue > target.revenue * 1.2) {
    score += 2;
    reasons.push(`${Math.round(((comp.revenue - target.revenue) / Math.max(target.revenue, 1)) * 100)}% more revenue`);
  }
  if (comp.jobs > target.jobs * 1.5) {
    score += 1;
    reasons.push(`${Math.round(((comp.jobs - target.jobs) / Math.max(target.jobs, 1)) * 100)}% more jobs`);
  }
  if (comp.successRate > target.successRate + 3) {
    score += 1;
    reasons.push(`higher success rate (${comp.successRate.toFixed(1)}% vs ${target.successRate.toFixed(1)}%)`);
  }

  const level = score >= 4 ? "high" : score >= 2 ? "medium" : "low";
  const reason = reasons.length > 0 ? reasons.join(", ") : "no significant advantages";
  return { level, reason };
}

function findServiceOverlap(
  targetOfferings: AgentOffering[],
  competitorOfferings: AgentOffering[][]
): { commonServices: string[]; uniqueToTarget: string[]; uniqueToCompetitors: string[] } {
  const targetNames = new Set(targetOfferings.map((o) => o.name.toLowerCase()));
  const allCompNames = new Set<string>();
  for (const offerings of competitorOfferings) {
    for (const o of offerings) allCompNames.add(o.name.toLowerCase());
  }

  const common = [...targetNames].filter((n) => allCompNames.has(n));
  const uniqueTarget = [...targetNames].filter((n) => !allCompNames.has(n));
  const uniqueComp = [...allCompNames].filter((n) => !targetNames.has(n));

  return {
    commonServices: common,
    uniqueToTarget: uniqueTarget,
    uniqueToCompetitors: uniqueComp.slice(0, 15),
  };
}

function findMarketGaps(
  targetOfferings: AgentOffering[],
  competitorOfferings: AgentOffering[][]
): string[] {
  const allNames = new Set<string>();
  for (const offerings of competitorOfferings) {
    for (const o of offerings) allNames.add(o.name.toLowerCase());
  }
  const targetNames = new Set(targetOfferings.map((o) => o.name.toLowerCase()));

  const gaps: string[] = [];
  const popular = new Map<string, number>();
  for (const offerings of competitorOfferings) {
    for (const o of offerings) {
      const n = o.name.toLowerCase();
      popular.set(n, (popular.get(n) ?? 0) + 1);
    }
  }

  for (const [name, count] of popular) {
    if (!targetNames.has(name) && count >= 2) {
      gaps.push(`"${name}" offered by ${count} competitors but not by you`);
    }
  }

  if (gaps.length === 0) {
    const compOnly = [...allNames].filter((n) => !targetNames.has(n));
    if (compOnly.length > 0) {
      gaps.push(`Competitors offer services you don't: ${compOnly.slice(0, 5).join(", ")}`);
    }
  }

  return gaps.slice(0, 5);
}

export function validateRequirements(requirements: any): ValidationResult {
  const agentId = requirements.agent_id || requirements.agentId || requirements.target_agent_id || requirements.target || requirements.agent;
  if (!agentId) {
    return { valid: false, reason: "agent_id is required for competitor analysis" };
  }
  return { valid: true };
}

export function requestPayment(requirements: any): string {
  const agentId = requirements.agent_id || requirements.agentId || requirements.target_agent_id || requirements.target || requirements.agent;
  return `Competitor analysis for agent ${agentId} — 200 USDC`;
}

export async function executeJob(requirements: any, context?: any): Promise<ExecuteJobResult> {
  console.log("[Competitor Analysis] Starting...");

  const agentIdOrName = requirements.agent_id || requirements.agentId || requirements.target_agent_id || requirements.target || requirements.agent;
  const clientWallet = context?.clientAddress;

  console.log(`[Competitor Analysis] Resolving agent: input="${agentIdOrName}"`);
  const agentId = await resolveAgentId(agentIdOrName, clientWallet);
  if (!agentId) {
    throw new Error(
      'agent_id required. Accepted formats:\n' +
      '  - Numeric ID: 3212\n' +
      '  - Agent name: "AgentPulse"\n' +
      '  - URL: https://agdp.io/agent/3212'
    );
  }

  // Fetch target agent data + offerings + leaderboard in parallel
  console.log(`[Competitor Analysis] Fetching target agent ${agentId} + leaderboard...`);
  const [targetMetrics, targetOfferings, leaderboard] = await Promise.all([
    fetchAgentMetrics(agentId),
    fetchAgentOfferings(agentId),
    fetchLeaderboard(),
  ]);

  if (leaderboard.length === 0) {
    throw new Error("Could not fetch leaderboard data. Try again later.");
  }

  console.log(`[Competitor Analysis] Leaderboard: ${leaderboard.length} agents, target offerings: ${targetOfferings.length}`);

  const targetRank = targetMetrics.rank ?? 9999;
  const targetRpj = safeDiv(targetMetrics.revenue, targetMetrics.jobsCompleted);
  const targetRpb = safeDiv(targetMetrics.revenue, targetMetrics.uniqueBuyers);
  const targetAvgPrice = targetOfferings.length > 0
    ? targetOfferings.reduce((s, o) => s + o.price, 0) / targetOfferings.length
    : 0;

  // Find closest competitors on leaderboard
  const closestEntries = findCompetitors(
    { agentId, rank: targetRank, revenue: targetMetrics.revenue, jobs: targetMetrics.jobsCompleted },
    leaderboard,
    10
  );

  // Fetch full metrics + offerings for each competitor (parallel)
  console.log(`[Competitor Analysis] Fetching full metrics + offerings for ${closestEntries.length} competitors...`);
  const compDataArr = await Promise.all(
    closestEntries.map(async (e) => {
      const [metrics, offerings] = await Promise.all([
        fetchAgentMetrics(e.agentId).catch(() => null),
        fetchAgentOfferings(e.agentId).catch(() => [] as AgentOffering[]),
      ]);
      return { entry: e, metrics, offerings };
    })
  );

  // Build full competitor profiles using real metrics when available
  const competitors: CompetitorProfile[] = compDataArr.map(({ entry, metrics, offerings }) => {
    const rev = metrics?.revenue ?? entry.revenue;
    const jobs = metrics?.jobsCompleted ?? entry.successfulJobCount;
    const buyers = metrics?.uniqueBuyers ?? entry.uniqueBuyerCount;
    const rate = metrics?.successRate ?? entry.successRate;
    const rpj = safeDiv(rev, jobs);
    const rpb = safeDiv(rev, buyers);
    const avgPrice = offerings.length > 0
      ? offerings.reduce((s, o) => s + o.price, 0) / offerings.length
      : 0;
    const { level, reason } = assessThreat(
      { revenue: targetMetrics.revenue, jobs: targetMetrics.jobsCompleted, successRate: targetMetrics.successRate, rank: targetRank },
      { revenue: rev, jobs, successRate: rate, rank: entry.rank, name: entry.name }
    );

    return {
      agentId: entry.agentId,
      name: metrics?.agentName ?? entry.name,
      rank: entry.rank,
      revenue: rev,
      jobs,
      successRate: rate,
      uniqueBuyers: buyers,
      revenuePerJob: rpj,
      revenuePerBuyer: rpb,
      offerings,
      avgPrice,
      threatLevel: level,
      threatReason: reason,
    };
  });

  // Market position percentiles
  const allRevenues = leaderboard.map((a) => a.revenue);
  const allJobs = leaderboard.map((a) => a.successfulJobCount);
  const allRates = leaderboard.map((a) => a.successRate);
  const allBuyers = leaderboard.map((a) => a.uniqueBuyerCount);
  const allRpj = leaderboard.map((a) => safeDiv(a.revenue, a.successfulJobCount));
  const allRpb = leaderboard.map((a) => safeDiv(a.revenue, a.uniqueBuyerCount));

  const position = {
    revenue_percentile: percentile(targetMetrics.revenue, allRevenues),
    jobs_percentile: percentile(targetMetrics.jobsCompleted, allJobs),
    success_rate_percentile: percentile(targetMetrics.successRate, allRates),
    buyers_percentile: percentile(targetMetrics.uniqueBuyers, allBuyers),
    efficiency_percentile: percentile(targetRpj, allRpj),
    rank: targetRank,
    total_agents: leaderboard.length,
  };

  // Pricing analysis
  const compAvgPrices = competitors.filter((c) => c.avgPrice > 0).map((c) => c.avgPrice);
  const marketAvgPrice = compAvgPrices.length > 0
    ? compAvgPrices.reduce((s, p) => s + p, 0) / compAvgPrices.length
    : 0;
  const pricingPosition = targetAvgPrice === 0
    ? "unknown"
    : targetAvgPrice < marketAvgPrice * 0.7
      ? "budget"
      : targetAvgPrice > marketAvgPrice * 1.3
        ? "premium"
        : "competitive";

  // Efficiency analysis
  const compAvgRpj = competitors.length > 0
    ? competitors.reduce((s, c) => s + c.revenuePerJob, 0) / competitors.length
    : 0;
  const compAvgRpb = competitors.length > 0
    ? competitors.reduce((s, c) => s + c.revenuePerBuyer, 0) / competitors.length
    : 0;

  // Service overlap & market gaps
  const serviceOverlap = findServiceOverlap(targetOfferings, compOfferingsArr);
  const marketGaps = findMarketGaps(targetOfferings, compOfferingsArr);

  // Strengths & weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (position.revenue_percentile >= 75) strengths.push(`Top ${100 - position.revenue_percentile}% in revenue ($${targetMetrics.revenue.toFixed(2)})`);
  else if (position.revenue_percentile < 40) weaknesses.push(`Revenue below average (percentile: ${position.revenue_percentile}%)`);

  if (position.jobs_percentile >= 75) strengths.push(`Top ${100 - position.jobs_percentile}% in job volume (${targetMetrics.jobsCompleted} jobs)`);
  else if (position.jobs_percentile < 40) weaknesses.push(`Job volume below average (percentile: ${position.jobs_percentile}%)`);

  if (targetMetrics.successRate >= 95) strengths.push(`Excellent success rate: ${targetMetrics.successRate.toFixed(1)}%`);
  else if (targetMetrics.successRate < 85) weaknesses.push(`Success rate needs improvement: ${targetMetrics.successRate.toFixed(1)}%`);

  if (position.buyers_percentile >= 75) strengths.push(`Strong buyer diversity: ${targetMetrics.uniqueBuyers} unique buyers`);
  else if (position.buyers_percentile < 40) weaknesses.push(`Low buyer diversity: ${targetMetrics.uniqueBuyers} unique buyers`);

  if (targetRank <= 25) strengths.push(`Elite ranking: #${targetRank}`);
  else if (targetRank <= 100) strengths.push(`Strong ranking: #${targetRank}`);

  if (targetRpj > compAvgRpj * 1.2 && compAvgRpj > 0) strengths.push(`High efficiency: $${targetRpj.toFixed(2)}/job vs $${compAvgRpj.toFixed(2)} competitor avg`);
  else if (targetRpj < compAvgRpj * 0.7 && compAvgRpj > 0) weaknesses.push(`Low efficiency: $${targetRpj.toFixed(2)}/job vs $${compAvgRpj.toFixed(2)} competitor avg`);

  if (serviceOverlap.uniqueToTarget.length > 0) strengths.push(`Unique services not offered by competitors: ${serviceOverlap.uniqueToTarget.join(", ")}`);

  // Threat summary
  const highThreats = competitors.filter((c) => c.threatLevel === "high");
  const medThreats = competitors.filter((c) => c.threatLevel === "medium");

  // Recommendations
  const recommendations: string[] = [];
  const avgCompRevenue = competitors.length > 0 ? competitors.reduce((s, c) => s + c.revenue, 0) / competitors.length : 0;
  const avgCompJobs = competitors.length > 0 ? competitors.reduce((s, c) => s + c.jobs, 0) / competitors.length : 0;
  const avgCompRate = competitors.length > 0 ? competitors.reduce((s, c) => s + c.successRate, 0) / competitors.length : 0;

  if (targetMetrics.revenue < avgCompRevenue * 0.8 && avgCompRevenue > 0) {
    const gap = avgCompRevenue - targetMetrics.revenue;
    recommendations.push(`Revenue gap: $${gap.toFixed(2)} below competitor average. ${pricingPosition === "budget" ? "Consider raising prices — you may be undervaluing services." : "Increase job volume through better discoverability and triggers."}`);
  }
  if (targetMetrics.jobsCompleted < avgCompJobs * 0.8 && avgCompJobs > 0) {
    recommendations.push(`Job volume ${Math.round(((avgCompJobs - targetMetrics.jobsCompleted) / Math.max(avgCompJobs, 1)) * 100)}% below competitors. Update description with more trigger words, ensure fast SLA (<5 min).`);
  }
  if (targetMetrics.successRate < avgCompRate - 3) {
    recommendations.push(`Success rate ${(avgCompRate - targetMetrics.successRate).toFixed(1)}pp below competitor avg (${avgCompRate.toFixed(1)}%). Debug error handlers and test edge cases.`);
  }
  if (targetRpj < compAvgRpj * 0.7 && compAvgRpj > 0) {
    recommendations.push(`Revenue per job ($${targetRpj.toFixed(2)}) is ${Math.round(((compAvgRpj - targetRpj) / compAvgRpj) * 100)}% below competitors ($${compAvgRpj.toFixed(2)}). Consider adding premium tiers or raising base prices.`);
  }
  if (pricingPosition === "budget" && targetAvgPrice > 0) {
    recommendations.push(`Your avg price ($${targetAvgPrice.toFixed(2)}) is significantly below market ($${marketAvgPrice.toFixed(2)}). Test a 20-30% price increase — your volume may sustain it.`);
  }
  if (pricingPosition === "premium" && targetMetrics.jobsCompleted < avgCompJobs * 0.5) {
    recommendations.push(`Premium pricing ($${targetAvgPrice.toFixed(2)} avg) with low volume. Consider a budget offering to attract more buyers, then upsell.`);
  }
  if (marketGaps.length > 0) {
    recommendations.push(`Market opportunities: ${marketGaps[0]}`);
  }
  if (highThreats.length > 0) {
    recommendations.push(`${highThreats.length} high-threat competitor(s): ${highThreats.map((c) => c.name).join(", ")}. Differentiate on speed, quality, or niche services.`);
  }
  if (targetMetrics.uniqueBuyers < 10) {
    recommendations.push("Critical: only " + targetMetrics.uniqueBuyers + " unique buyers. Diversify through partnerships, social media, and cross-agent referrals.");
  }
  if (targetMetrics.revenue > avgCompRevenue && targetMetrics.jobsCompleted > avgCompJobs) {
    recommendations.push("You're outperforming competitors. Consider raising prices 10-20% to maximize margin while demand is strong.");
  }

  // Build human summary
  const compLines = competitors.map((c, i) => {
    const threat = c.threatLevel === "high" ? "🔴" : c.threatLevel === "medium" ? "🟡" : "🟢";
    return `${i + 1}. ${threat} ${c.name} (#${c.rank}) — Rev: $${c.revenue.toFixed(2)}, Jobs: ${c.jobs}, Rate: ${c.successRate.toFixed(1)}%, $/job: $${c.revenuePerJob.toFixed(2)}${c.offerings.length > 0 ? `, ${c.offerings.length} offerings (avg $${c.avgPrice.toFixed(2)})` : ""}`;
  });

  const threatLines = competitors
    .filter((c) => c.threatLevel !== "low")
    .map((c) => `  ${c.threatLevel === "high" ? "🔴" : "🟡"} ${c.name}: ${c.threatReason}`);

  const humanSummary =
    `🔍 COMPETITOR ANALYSIS — ${targetMetrics.agentName}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `\n📊 Market Position (out of ${leaderboard.length} agents):\n` +
    `  Rank: #${targetRank}\n` +
    `  Revenue: top ${100 - position.revenue_percentile}% | Jobs: top ${100 - position.jobs_percentile}%\n` +
    `  Buyers: top ${100 - position.buyers_percentile}% | Efficiency: top ${100 - position.efficiency_percentile}%\n` +
    `\n📈 Your Metrics:\n` +
    `  Revenue: $${targetMetrics.revenue.toFixed(2)} | Jobs: ${targetMetrics.jobsCompleted} | Rate: ${targetMetrics.successRate.toFixed(1)}%\n` +
    `  Buyers: ${targetMetrics.uniqueBuyers} | $/job: $${targetRpj.toFixed(2)} | $/buyer: $${targetRpb.toFixed(2)}\n` +
    `${targetOfferings.length > 0 ? `  Offerings: ${targetOfferings.map((o) => `${o.name} ($${o.price})`).join(", ")}\n` : ""}` +
    `\n💰 Pricing Analysis:\n` +
    `  Your avg price: $${targetAvgPrice.toFixed(2)} | Market avg: $${marketAvgPrice.toFixed(2)} | Position: ${pricingPosition}\n` +
    `\n⚡ Efficiency vs Competitors:\n` +
    `  $/job: $${targetRpj.toFixed(2)} (you) vs $${compAvgRpj.toFixed(2)} (competitors)\n` +
    `  $/buyer: $${targetRpb.toFixed(2)} (you) vs $${compAvgRpb.toFixed(2)} (competitors)\n` +
    `\n⚔️ Top ${competitors.length} Closest Competitors:\n${compLines.join("\n")}\n` +
    `${threatLines.length > 0 ? `\n🎯 Threat Assessment:\n${threatLines.join("\n")}\n` : ""}` +
    `${serviceOverlap.commonServices.length > 0 ? `\n🔄 Service Overlap: ${serviceOverlap.commonServices.join(", ")}\n` : ""}` +
    `${serviceOverlap.uniqueToTarget.length > 0 ? `✨ Your Unique Services: ${serviceOverlap.uniqueToTarget.join(", ")}\n` : ""}` +
    `${marketGaps.length > 0 ? `\n🕳️ Market Gaps:\n${marketGaps.map((g, i) => `  ${i + 1}. ${g}`).join("\n")}\n` : ""}` +
    `${strengths.length > 0 ? `\n✅ Strengths:\n${strengths.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}\n` : ""}` +
    `${weaknesses.length > 0 ? `\n⚠️ Weaknesses:\n${weaknesses.map((w, i) => `  ${i + 1}. ${w}`).join("\n")}\n` : ""}` +
    `\n💡 Recommendations:\n${recommendations.map((r, i) => `  ${i + 1}. ${r}`).join("\n")}`;

  const deliverable = {
    agent_id: agentId,
    agent_name: targetMetrics.agentName,
    market_position: position,
    pricing: {
      your_avg_price: targetAvgPrice,
      market_avg_price: marketAvgPrice,
      position: pricingPosition,
      your_offerings: targetOfferings.map((o) => ({ name: o.name, price: o.price })),
    },
    efficiency: {
      revenue_per_job: targetRpj,
      revenue_per_buyer: targetRpb,
      competitor_avg_rpj: compAvgRpj,
      competitor_avg_rpb: compAvgRpb,
    },
    competitors: competitors.map((c) => ({
      agent_id: c.agentId,
      name: c.name,
      rank: c.rank,
      revenue: c.revenue,
      jobs: c.jobs,
      success_rate: c.successRate,
      unique_buyers: c.uniqueBuyers,
      revenue_per_job: c.revenuePerJob,
      avg_price: c.avgPrice,
      offerings_count: c.offerings.length,
      threat_level: c.threatLevel,
      threat_reason: c.threatReason,
    })),
    service_overlap: serviceOverlap,
    market_gaps: marketGaps,
    strengths,
    weaknesses,
    recommendations,
    human_summary: humanSummary,
  };

  sendResultToWebhook({
    jobId: context?.jobId?.toString(),
    agentId,
    agentName: targetMetrics.agentName,
    service: "Competitor Analysis",
    price: 200,
    score: Math.round((position.revenue_percentile + position.jobs_percentile + position.success_rate_percentile + position.efficiency_percentile) / 4),
    status: position.revenue_percentile >= 75 ? "strong" : position.revenue_percentile >= 40 ? "average" : "weak",
    metrics: {
      rank: targetRank,
      revenue: targetMetrics.revenue,
      jobsCompleted: targetMetrics.jobsCompleted,
      successRate: targetMetrics.successRate,
      uniqueBuyers: targetMetrics.uniqueBuyers,
      revenuePerJob: targetRpj,
    },
    recommendations,
  }).catch((err) => console.log("[Competitor Analysis] Webhook error:", err.message));

  console.log(`[Competitor Analysis] Done. Rank #${targetRank}, ${competitors.length} competitors, ${highThreats.length} high threats.`);

  return { deliverable: JSON.stringify(deliverable) };
}
