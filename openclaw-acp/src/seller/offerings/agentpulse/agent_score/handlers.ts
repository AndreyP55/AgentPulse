/**
 * AgentPulse - Agent Score Offering
 * Price: 0.05 USDC
 *
 * Instant composite score (0-100) for any AI agent.
 * Designed for automated pipelines: fast, cheap, machine-readable.
 * Score = weighted mix of success rate, activity, volume, diversity.
 */

import type { ExecuteJobResult, ValidationResult } from "../../../runtime/offeringTypes.js";
import { fetchAgentMetrics, resolveAgentId } from "../shared/agdp-client.js";
import { sendResultToWebhook } from "../shared/webhook.js";

function computeScore(metrics: {
  successRate: number;
  jobsCompleted: number;
  uniqueBuyers: number;
  revenue: number;
  lastJobTimestamp: number | null;
  rank: number | null;
}): { score: number; breakdown: Record<string, number> } {
  // Success rate (0-35 points)
  const successPts = Math.min(35, (metrics.successRate / 100) * 35);

  // Volume (0-25 points)
  let volumePts = 0;
  if (metrics.jobsCompleted >= 500) volumePts = 25;
  else if (metrics.jobsCompleted >= 200) volumePts = 20;
  else if (metrics.jobsCompleted >= 100) volumePts = 17;
  else if (metrics.jobsCompleted >= 50) volumePts = 13;
  else if (metrics.jobsCompleted >= 20) volumePts = 9;
  else if (metrics.jobsCompleted >= 5) volumePts = 5;
  else if (metrics.jobsCompleted >= 1) volumePts = 2;

  // Activity recency (0-20 points)
  let activityPts = 0;
  if (metrics.lastJobTimestamp) {
    const hoursAgo = (Date.now() - metrics.lastJobTimestamp) / (1000 * 60 * 60);
    if (hoursAgo < 1) activityPts = 20;
    else if (hoursAgo < 6) activityPts = 17;
    else if (hoursAgo < 24) activityPts = 14;
    else if (hoursAgo < 72) activityPts = 9;
    else if (hoursAgo < 168) activityPts = 4;
  }

  // Buyer diversity (0-10 points)
  let diversityPts = 0;
  if (metrics.uniqueBuyers >= 30) diversityPts = 10;
  else if (metrics.uniqueBuyers >= 15) diversityPts = 8;
  else if (metrics.uniqueBuyers >= 5) diversityPts = 5;
  else if (metrics.uniqueBuyers >= 1) diversityPts = 2;

  // Rank bonus (0-10 points)
  let rankPts = 0;
  if (metrics.rank !== null) {
    if (metrics.rank <= 10) rankPts = 10;
    else if (metrics.rank <= 25) rankPts = 8;
    else if (metrics.rank <= 50) rankPts = 6;
    else if (metrics.rank <= 100) rankPts = 4;
    else if (metrics.rank <= 200) rankPts = 2;
  }

  const score = Math.min(100, Math.max(0, Math.round(
    successPts + volumePts + activityPts + diversityPts + rankPts
  )));

  return {
    score,
    breakdown: {
      success_rate: Math.round(successPts),
      volume: volumePts,
      activity: activityPts,
      diversity: diversityPts,
      rank: rankPts,
    },
  };
}

function getGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

export function validateRequirements(requirements: any): ValidationResult {
  const agentId = requirements.agent_id || requirements.agentId || requirements.target_agent_id || requirements.target || requirements.agent;
  if (agentId !== undefined && agentId !== null && agentId !== "") {
    if (typeof agentId !== "string" && typeof agentId !== "number") {
      return { valid: false, reason: "agent_id must be a string or number" };
    }
  }
  return { valid: true };
}

export function requestPayment(requirements: any): string {
  const agentId = requirements.agent_id || requirements.agentId || requirements.target_agent_id || requirements.target || requirements.agent;
  return `Agent score for ${agentId || "self"} - 0.05 USDC`;
}

export async function executeJob(requirements: any, context?: any): Promise<ExecuteJobResult> {
  console.log("[Agent Score] Starting...");
  console.log("[Agent Score] Requirements:", requirements);

  const agentIdOrName = requirements.agent_id || requirements.agentId || requirements.target_agent_id || requirements.target || requirements.agent;
  const clientWallet = context?.clientAddress;
  const jobId = context?.jobId;

  console.log(`[Agent Score] Resolving agent: input="${agentIdOrName}", clientWallet="${clientWallet}"`);
  const agentId = await resolveAgentId(agentIdOrName, clientWallet);
  console.log(`[Agent Score] Resolved agent ID: ${agentId}`);

  if (!agentId) {
    throw new Error(
      'agent_id required. Accepted formats:\n' +
      '  - Numeric ID: 3212\n' +
      '  - Agent name: "AgentPulse"\n' +
      '  - URL: https://agdp.io/agent/3212'
    );
  }

  const metrics = await fetchAgentMetrics(agentId);
  const { score, breakdown } = computeScore(metrics);
  const grade = getGrade(score);

  const deliverable = {
    score,
    grade,
    agent_id: agentId,
    agent_name: metrics.agentName,
    breakdown,
    human_summary: `⚡ AGENT SCORE - ${metrics.agentName}\n📊 Score: ${score}/100 (${grade})\n📈 Success: ${metrics.successRate.toFixed(1)}% | Jobs: ${metrics.jobsCompleted} | Revenue: $${metrics.revenue.toFixed(2)}\n🏅 Rank: #${metrics.rank || "N/A"} | Buyers: ${metrics.uniqueBuyers}`,
  };

  sendResultToWebhook({
    jobId: jobId?.toString(),
    agentId,
    agentName: metrics.agentName,
    service: "Agent Score",
    price: 0.05,
    score,
    status: grade,
    metrics: {
      successRate: metrics.successRate,
      jobsCompleted: metrics.jobsCompleted,
      revenue: metrics.revenue,
      rank: metrics.rank ?? undefined,
      uniqueBuyers: metrics.uniqueBuyers,
    },
    recommendations: [],
  }).catch((err) => console.log("[Agent Score] Webhook error:", err.message));

  console.log(`[Agent Score] Done. Score: ${score} Grade: ${grade}`);

  return { deliverable: JSON.stringify(deliverable) };
}
