/**
 * AgentPulse - Competitor Analysis
 * Price: 200 USDC
 *
 * Deep competitive intelligence: finds competitors on leaderboard,
 * compares metrics, determines market position, generates recommendations.
 */

import type { ExecuteJobResult, ValidationResult } from "../../../runtime/offeringTypes.js";
import { fetchAgentMetrics, fetchLeaderboard, resolveAgentId } from "../shared/agdp-client.js";
import { sendResultToWebhook } from "../shared/webhook.js";

interface CompetitorProfile {
  agentId: string;
  name: string;
  rank: number;
  revenue: number;
  jobs: number;
  successRate: number;
  uniqueBuyers: number;
}

function percentile(value: number, allValues: number[]): number {
  if (allValues.length === 0) return 0;
  const below = allValues.filter((v) => v < value).length;
  return Math.round((below / allValues.length) * 100);
}

function findCompetitors(
  target: CompetitorProfile,
  leaderboard: CompetitorProfile[],
  count: number
): CompetitorProfile[] {
  const others = leaderboard.filter((a) => a.agentId !== target.agentId);

  const scored = others.map((a) => {
    const revDiff = Math.abs(a.revenue - target.revenue) / (Math.max(target.revenue, 1));
    const jobDiff = Math.abs(a.jobs - target.jobs) / (Math.max(target.jobs, 1));
    const rankDiff = Math.abs(a.rank - target.rank) / 1000;
    const similarity = 1 / (1 + revDiff + jobDiff + rankDiff);
    return { ...a, similarity };
  });

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, count).map(({ similarity, ...rest }) => rest);
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
  console.log("[Competitor Analysis] Requirements:", requirements);

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

  console.log(`[Competitor Analysis] Fetching target agent ${agentId}...`);
  const targetMetrics = await fetchAgentMetrics(agentId);

  console.log("[Competitor Analysis] Fetching leaderboard...");
  const leaderboard = await fetchLeaderboard();

  if (leaderboard.length === 0) {
    throw new Error("Could not fetch leaderboard data. Try again later.");
  }

  console.log(`[Competitor Analysis] Leaderboard: ${leaderboard.length} agents`);

  const target: CompetitorProfile = {
    agentId,
    name: targetMetrics.agentName,
    rank: targetMetrics.rank ?? 9999,
    revenue: targetMetrics.revenue,
    jobs: targetMetrics.jobsCompleted,
    successRate: targetMetrics.successRate,
    uniqueBuyers: targetMetrics.uniqueBuyers,
  };

  const lbProfiles: CompetitorProfile[] = leaderboard.map((a) => ({
    agentId: a.agentId,
    name: a.name,
    rank: a.rank,
    revenue: a.revenue,
    jobs: a.successfulJobCount,
    successRate: a.successRate,
    uniqueBuyers: a.uniqueBuyerCount,
  }));

  const competitors = findCompetitors(target, lbProfiles, 10);

  const allRevenues = lbProfiles.map((a) => a.revenue);
  const allJobs = lbProfiles.map((a) => a.jobs);
  const allRates = lbProfiles.map((a) => a.successRate);
  const allBuyers = lbProfiles.map((a) => a.uniqueBuyers);

  const position = {
    revenue_percentile: percentile(target.revenue, allRevenues),
    jobs_percentile: percentile(target.jobs, allJobs),
    success_rate_percentile: percentile(target.successRate, allRates),
    buyers_percentile: percentile(target.uniqueBuyers, allBuyers),
    rank: target.rank,
    total_agents: leaderboard.length,
  };

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (position.revenue_percentile >= 75) strengths.push(`Top ${100 - position.revenue_percentile}% in revenue ($${target.revenue.toFixed(2)})`);
  else if (position.revenue_percentile < 40) weaknesses.push(`Revenue below average (percentile: ${position.revenue_percentile}%)`);

  if (position.jobs_percentile >= 75) strengths.push(`Top ${100 - position.jobs_percentile}% in job volume (${target.jobs} jobs)`);
  else if (position.jobs_percentile < 40) weaknesses.push(`Job volume below average (percentile: ${position.jobs_percentile}%)`);

  if (target.successRate >= 95) strengths.push(`Excellent success rate: ${target.successRate.toFixed(1)}%`);
  else if (target.successRate < 85) weaknesses.push(`Success rate needs improvement: ${target.successRate.toFixed(1)}%`);

  if (position.buyers_percentile >= 75) strengths.push(`Strong buyer diversity: ${target.uniqueBuyers} unique buyers`);
  else if (position.buyers_percentile < 40) weaknesses.push(`Low buyer diversity: ${target.uniqueBuyers} unique buyers`);

  if (target.rank && target.rank <= 25) strengths.push(`Elite ranking: #${target.rank}`);
  else if (target.rank && target.rank <= 100) strengths.push(`Strong ranking: #${target.rank}`);

  const avgCompRevenue = competitors.length > 0 ? competitors.reduce((s, c) => s + c.revenue, 0) / competitors.length : 0;
  const avgCompJobs = competitors.length > 0 ? competitors.reduce((s, c) => s + c.jobs, 0) / competitors.length : 0;
  const avgCompRate = competitors.length > 0 ? competitors.reduce((s, c) => s + c.successRate, 0) / competitors.length : 0;

  const vsCompetitors = {
    revenue: target.revenue > avgCompRevenue ? "above" : target.revenue < avgCompRevenue * 0.8 ? "below" : "on_par",
    jobs: target.jobs > avgCompJobs ? "above" : target.jobs < avgCompJobs * 0.8 ? "below" : "on_par",
    success_rate: target.successRate > avgCompRate ? "above" : target.successRate < avgCompRate - 5 ? "below" : "on_par",
  };

  const recommendations: string[] = [];

  if (vsCompetitors.revenue === "below") {
    recommendations.push(`Revenue is ${Math.round(((avgCompRevenue - target.revenue) / Math.max(avgCompRevenue, 1)) * 100)}% below competitors. Consider lowering prices to attract more volume, or adding premium offerings.`);
  }
  if (vsCompetitors.jobs === "below") {
    recommendations.push(`Job volume is below competitors. Improve discoverability: update description with more triggers, ensure fast SLA.`);
  }
  if (vsCompetitors.success_rate === "below") {
    recommendations.push(`Success rate (${target.successRate.toFixed(1)}%) is below competitor average (${avgCompRate.toFixed(1)}%). Fix error handling in offerings.`);
  }
  if (target.uniqueBuyers < 10) {
    recommendations.push("Diversify buyer base. Currently relying on few buyers — high concentration risk.");
  }
  if (strengths.length === 0) {
    recommendations.push("No clear competitive advantages found. Focus on one metric (speed, price, or quality) to differentiate.");
  }
  if (vsCompetitors.revenue === "above" && vsCompetitors.jobs === "above") {
    recommendations.push("Outperforming competitors on revenue and volume. Consider raising prices to maximize margin.");
  }

  const compLines = competitors.map((c, i) =>
    `${i + 1}. ${c.name} (#${c.rank}) — Revenue: $${c.revenue.toFixed(2)}, Jobs: ${c.jobs}, Rate: ${c.successRate.toFixed(1)}%, Buyers: ${c.uniqueBuyers}`
  );

  const humanSummary =
    `🔍 COMPETITOR ANALYSIS - ${target.name}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `\n📊 Market Position (out of ${leaderboard.length} agents):\n` +
    `  Rank: #${target.rank} | Revenue: top ${100 - position.revenue_percentile}% | Jobs: top ${100 - position.jobs_percentile}% | Buyers: top ${100 - position.buyers_percentile}%\n` +
    `\n📈 Your Metrics:\n` +
    `  Revenue: $${target.revenue.toFixed(2)} | Jobs: ${target.jobs} | Rate: ${target.successRate.toFixed(1)}% | Buyers: ${target.uniqueBuyers}\n` +
    `\n⚔️ vs Competitors (avg):\n` +
    `  Revenue: ${vsCompetitors.revenue} ($${avgCompRevenue.toFixed(2)} avg) | Jobs: ${vsCompetitors.jobs} (${Math.round(avgCompJobs)} avg) | Rate: ${vsCompetitors.success_rate} (${avgCompRate.toFixed(1)}% avg)\n` +
    `\n🏆 Top ${competitors.length} Closest Competitors:\n${compLines.join("\n")}\n` +
    `${strengths.length > 0 ? `\n✅ Strengths:\n${strengths.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n` : ""}` +
    `${weaknesses.length > 0 ? `\n⚠️ Weaknesses:\n${weaknesses.map((w, i) => `${i + 1}. ${w}`).join("\n")}\n` : ""}` +
    `\n💡 Recommendations:\n${recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}`;

  const deliverable = {
    agent_id: agentId,
    agent_name: target.name,
    market_position: position,
    vs_competitors: vsCompetitors,
    competitors: competitors.map((c) => ({
      agent_id: c.agentId,
      name: c.name,
      rank: c.rank,
      revenue: c.revenue,
      jobs: c.jobs,
      success_rate: c.successRate,
      unique_buyers: c.uniqueBuyers,
    })),
    strengths,
    weaknesses,
    recommendations,
    human_summary: humanSummary,
  };

  sendResultToWebhook({
    jobId: context?.jobId?.toString(),
    agentId,
    agentName: target.name,
    service: "Competitor Analysis",
    price: 200,
    score: Math.round((position.revenue_percentile + position.jobs_percentile + position.success_rate_percentile) / 3),
    status: position.revenue_percentile >= 75 ? "strong" : position.revenue_percentile >= 40 ? "average" : "weak",
    metrics: {
      rank: target.rank,
      revenue: target.revenue,
      jobsCompleted: target.jobs,
      successRate: target.successRate,
      uniqueBuyers: target.uniqueBuyers,
    },
    recommendations,
  }).catch((err) => console.log("[Competitor Analysis] Webhook error:", err.message));

  console.log(`[Competitor Analysis] Done. Position: rank #${target.rank}, ${competitors.length} competitors found.`);

  return { deliverable: JSON.stringify(deliverable) };
}
