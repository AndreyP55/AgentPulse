/**
 * AgentPulse - Agent Risk Flags Offering
 * Price: 0.1 USDC
 *
 * Returns structural risk flags for AI agents. Machine-readable JSON.
 * For agent pipelines, monitoring, risk engines. Also human_summary for Butler.
 */

import type { ExecuteJobResult, ValidationResult } from "../../../runtime/offeringTypes.js";
import { fetchAgentMetrics, estimateLastActivity, resolveAgentId } from "../shared/agdp-client.js";
import { sendResultToWebhook } from "../shared/webhook.js";

interface AgentData {
  agentId: string;
  agentName: string;
  successRate: number;
  jobsCompleted: number;
  lastJobTimestamp: number | null;
  revenue: number;
  uniqueBuyers: number;
}

async function fetchAgentData(agentId: string): Promise<AgentData> {
  const metrics = await fetchAgentMetrics(agentId);
  return {
    agentId: metrics.agentId,
    agentName: metrics.agentName,
    successRate: metrics.successRate,
    jobsCompleted: metrics.jobsCompleted,
    lastJobTimestamp: metrics.lastJobTimestamp || estimateLastActivity(metrics.jobsCompleted),
    revenue: metrics.revenue,
    uniqueBuyers: metrics.uniqueBuyers
  };
}

function computeRiskFlags(data: AgentData): { flags: string[]; riskScore: number } {
  const flags: string[] = [];

  if (data.uniqueBuyers < 10) {
    flags.push("low_buyer_diversity");
  }
  if (data.uniqueBuyers < 5 && data.jobsCompleted > 20) {
    flags.push("high_concentration");
  }
  if (data.lastJobTimestamp) {
    const hoursSince = (Date.now() - data.lastJobTimestamp) / (1000 * 60 * 60);
    if (hoursSince > 168) flags.push("declining_activity");
  } else if (data.jobsCompleted > 0) {
    flags.push("no_recent_activity");
  }
  if (data.successRate < 85) {
    flags.push("low_success_rate");
  }
  if (data.jobsCompleted < 20) {
    flags.push("new_agent");
  }
  if (data.revenue < 10 && data.jobsCompleted > 5) {
    flags.push("low_revenue");
  }
  // Risk score 0-100 (higher = more risk)
  let riskScore = 50;
  if (flags.includes("low_success_rate")) riskScore += 20;
  if (flags.includes("low_buyer_diversity")) riskScore += 15;
  if (flags.includes("declining_activity") || flags.includes("no_recent_activity")) riskScore += 15;
  if (flags.includes("high_concentration")) riskScore += 10;
  if (flags.includes("new_agent")) riskScore += 5;
  if (data.uniqueBuyers >= 30 && data.successRate >= 90 && data.jobsCompleted >= 100) {
    riskScore -= 30;
  }
  riskScore = Math.min(100, Math.max(0, riskScore));

  return { flags, riskScore };
}

function getVerdict(riskScore: number): string {
  if (riskScore < 30) return "low_risk";
  if (riskScore < 60) return "medium_risk";
  return "high_risk";
}

export function validateRequirements(requirements: any): ValidationResult {
  return { valid: true };
}

export function requestPayment(requirements: any): string {
  const agentId = requirements.agent_id || requirements.agentId;
  return `Risk flags check for agent ${agentId || "self"} - 0.1 USDC`;
}

export async function executeJob(requirements: any, context?: any): Promise<ExecuteJobResult> {
  console.log("[Agent Risk Flags] Starting...");
  const agentIdOrName = requirements.agent_id || requirements.agentId;
  const clientWallet = context?.clientAddress;

  const agentId = await resolveAgentId(agentIdOrName, clientWallet);
  if (!agentId) {
    throw new Error("agent_id required. Pass ID or agent name. Omit to check yourself.");
  }

  const agentData = await fetchAgentData(agentId);
  const { flags, riskScore } = computeRiskFlags(agentData);
  const verdict = getVerdict(riskScore);

  const humanSummary = `🔍 RISK FLAGS - ${agentData.agentName}\nRisk Score: ${riskScore}/100\nVerdict: ${verdict}\nFlags: ${flags.length ? flags.join(", ") : "none"}`;

  const deliverable = {
    risk_score: riskScore,
    flags,
    verdict,
    human_summary: humanSummary
  };

  sendResultToWebhook({
    jobId: context?.jobId?.toString(),
    agentId,
    agentName: agentData.agentName,
    service: "Agent Risk Flags",
    price: 0.1,
    score: 100 - riskScore,
    status: verdict,
    metrics: {
      successRate: agentData.successRate,
      jobsCompleted: agentData.jobsCompleted,
      revenue: agentData.revenue,
      uniqueBuyers: agentData.uniqueBuyers
    },
    recommendations: []
  }).catch((err) => console.log("[Agent Risk Flags] Webhook error:", err.message));

  console.log("[Agent Risk Flags] Done. Risk score:", riskScore, "Verdict:", verdict);

  return { deliverable: JSON.stringify(deliverable) };
}
