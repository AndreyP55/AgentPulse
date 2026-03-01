/**
 * AgentPulse - Multi Agent Report
 * Price: 100 USDC
 *
 * Full analysis of up to 10 agents: health + risk + scoring for each,
 * plus portfolio summary with rankings and recommendations.
 */

import type { ExecuteJobResult, ValidationResult } from "../../../runtime/offeringTypes.js";
import { fetchAgentMetrics, resolveAgentId } from "../shared/agdp-client.js";
import { sendResultToWebhook } from "../shared/webhook.js";

const MAX_AGENTS = 10;

interface AgentAnalysis {
  agentId: string;
  agentName: string;
  healthScore: number;
  healthStatus: string;
  riskScore: number;
  riskVerdict: string;
  riskFlags: string[];
  successRate: number;
  jobsCompleted: number;
  revenue: number;
  rank: number | null;
  uniqueBuyers: number;
  lastActive: string;
  revenuePerJob: number;
  revenuePerBuyer: number;
}

function computeHealthScore(metrics: any): { score: number; status: string } {
  let score = 0;

  if (metrics.successRate >= 95) score += 40;
  else if (metrics.successRate >= 90) score += 35;
  else if (metrics.successRate >= 80) score += 25;
  else if (metrics.successRate >= 70) score += 20;
  else if (metrics.successRate >= 50) score += 10;
  else score += 5;

  if (metrics.lastJobTimestamp) {
    const hours = (Date.now() - metrics.lastJobTimestamp) / (1000 * 60 * 60);
    if (hours < 1) score += 30;
    else if (hours < 6) score += 25;
    else if (hours < 24) score += 20;
    else if (hours < 72) score += 10;
    else if (hours < 168) score += 5;
  }

  if (metrics.jobsCompleted > 500) score += 30;
  else if (metrics.jobsCompleted > 200) score += 25;
  else if (metrics.jobsCompleted > 100) score += 20;
  else if (metrics.jobsCompleted > 50) score += 15;
  else if (metrics.jobsCompleted > 20) score += 10;
  else if (metrics.jobsCompleted > 5) score += 5;

  score = Math.min(100, Math.max(0, score));
  const status = score >= 80 ? "healthy" : score >= 60 ? "warning" : "critical";
  return { score, status };
}

function computeRiskFlags(metrics: any): { flags: string[]; riskScore: number; verdict: string } {
  const flags: string[] = [];

  if (metrics.uniqueBuyers < 10) flags.push("low_buyer_diversity");
  if (metrics.uniqueBuyers < 5 && metrics.jobsCompleted > 20) flags.push("high_concentration");
  if (metrics.lastJobTimestamp) {
    const hours = (Date.now() - metrics.lastJobTimestamp) / (1000 * 60 * 60);
    if (hours > 168) flags.push("declining_activity");
  } else if (metrics.jobsCompleted > 0) {
    flags.push("no_recent_activity");
  }
  if (metrics.successRate < 85) flags.push("low_success_rate");
  if (metrics.jobsCompleted < 20) flags.push("new_agent");
  if (metrics.revenue < 10 && metrics.jobsCompleted > 5) flags.push("low_revenue");

  let riskScore = 50;
  if (flags.includes("low_success_rate")) riskScore += 20;
  if (flags.includes("low_buyer_diversity")) riskScore += 15;
  if (flags.includes("declining_activity") || flags.includes("no_recent_activity")) riskScore += 15;
  if (flags.includes("high_concentration")) riskScore += 10;
  if (flags.includes("new_agent")) riskScore += 5;
  if (metrics.uniqueBuyers >= 30 && metrics.successRate >= 90 && metrics.jobsCompleted >= 100) {
    riskScore -= 30;
  }
  riskScore = Math.min(100, Math.max(0, riskScore));

  const verdict = riskScore < 30 ? "low_risk" : riskScore < 60 ? "medium_risk" : "high_risk";
  return { flags, riskScore, verdict };
}

function parseAgentIds(input: string): string[] {
  return input
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function validateRequirements(requirements: any): ValidationResult {
  const raw = requirements.agent_ids || requirements.agentIds || requirements.agents;
  if (!raw) {
    return { valid: false, reason: "agent_ids is required. Pass comma-separated IDs, e.g. '3212,4029,2651'" };
  }
  const ids = parseAgentIds(String(raw));
  if (ids.length === 0) {
    return { valid: false, reason: "agent_ids must contain at least 1 agent ID" };
  }
  if (ids.length > MAX_AGENTS) {
    return { valid: false, reason: `Maximum ${MAX_AGENTS} agents per report. Got ${ids.length}.` };
  }
  return { valid: true };
}

export function requestPayment(requirements: any): string {
  const raw = requirements.agent_ids || requirements.agentIds || requirements.agents || "";
  const count = parseAgentIds(String(raw)).length;
  return `Multi-agent report for ${count} agents — 100 USDC`;
}

export async function executeJob(requirements: any, context?: any): Promise<ExecuteJobResult> {
  console.log("[Multi Agent Report] Starting...");
  console.log("[Multi Agent Report] Requirements:", requirements);

  const raw = requirements.agent_ids || requirements.agentIds || requirements.agents;
  if (!raw) throw new Error("agent_ids required. Pass comma-separated IDs, e.g. '3212,4029,2651'");

  const rawIds = parseAgentIds(String(raw));
  if (rawIds.length > MAX_AGENTS) throw new Error(`Maximum ${MAX_AGENTS} agents. Got ${rawIds.length}.`);

  const resolvedIds: string[] = [];
  for (const rawId of rawIds) {
    const resolved = await resolveAgentId(rawId);
    if (resolved) resolvedIds.push(resolved);
    else console.log(`[Multi Agent Report] Skipping unresolvable: ${rawId}`);
  }

  if (resolvedIds.length === 0) throw new Error("None of the provided agent_ids could be resolved.");

  console.log(`[Multi Agent Report] Analyzing ${resolvedIds.length} agents...`);

  const analyses: AgentAnalysis[] = [];
  const errors: string[] = [];

  for (const agentId of resolvedIds) {
    try {
      console.log(`[Multi Agent Report] Fetching agent ${agentId}...`);
      const metrics = await fetchAgentMetrics(agentId);
      const { score: healthScore, status: healthStatus } = computeHealthScore(metrics);
      const { flags, riskScore, verdict } = computeRiskFlags(metrics);

      let lastActive = "unknown";
      if (metrics.lastJobTimestamp) {
        const hours = (Date.now() - metrics.lastJobTimestamp) / (1000 * 60 * 60);
        if (hours < 1) lastActive = "< 1 hour ago";
        else if (hours < 24) lastActive = `${Math.round(hours)}h ago`;
        else lastActive = `${Math.round(hours / 24)}d ago`;
      }

      const rpj = metrics.jobsCompleted > 0 ? metrics.revenue / metrics.jobsCompleted : 0;
      const rpb = metrics.uniqueBuyers > 0 ? metrics.revenue / metrics.uniqueBuyers : 0;

      analyses.push({
        agentId,
        agentName: metrics.agentName,
        healthScore,
        healthStatus,
        riskScore,
        riskVerdict: verdict,
        riskFlags: flags,
        successRate: metrics.successRate,
        jobsCompleted: metrics.jobsCompleted,
        revenue: metrics.revenue,
        rank: metrics.rank,
        uniqueBuyers: metrics.uniqueBuyers,
        lastActive,
        revenuePerJob: rpj,
        revenuePerBuyer: rpb,
      });
    } catch (err: any) {
      errors.push(`Agent ${agentId}: ${err.message}`);
      console.log(`[Multi Agent Report] Error for agent ${agentId}: ${err.message}`);
    }
  }

  if (analyses.length === 0) throw new Error("Could not fetch data for any agent. Errors: " + errors.join("; "));

  const sorted = [...analyses].sort((a, b) => b.healthScore - a.healthScore);
  const avgHealth = Math.round(analyses.reduce((s, a) => s + a.healthScore, 0) / analyses.length);
  const avgRisk = Math.round(analyses.reduce((s, a) => s + a.riskScore, 0) / analyses.length);
  const criticalAgents = analyses.filter((a) => a.healthStatus === "critical");
  const highRiskAgents = analyses.filter((a) => a.riskVerdict === "high_risk");
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const totalRevenue = analyses.reduce((s, a) => s + a.revenue, 0);
  const totalJobs = analyses.reduce((s, a) => s + a.jobsCompleted, 0);

  const recommendations: string[] = [];
  if (criticalAgents.length > 0) {
    recommendations.push(`${criticalAgents.length} agent(s) in CRITICAL state: ${criticalAgents.map((a) => a.agentName).join(", ")}. Immediate attention required.`);
  }
  if (highRiskAgents.length > 0) {
    recommendations.push(`${highRiskAgents.length} agent(s) flagged HIGH RISK: ${highRiskAgents.map((a) => a.agentName).join(", ")}. Review risk flags.`);
  }
  if (avgHealth >= 80) {
    recommendations.push("Portfolio is in good overall health. Continue monitoring.");
  } else if (avgHealth >= 60) {
    recommendations.push("Portfolio health is moderate. Focus on improving underperforming agents.");
  } else {
    recommendations.push("Portfolio health is poor. Consider replacing low-performing agents.");
  }
  if (worst.healthScore < 40) {
    recommendations.push(`Consider replacing ${worst.agentName} (score: ${worst.healthScore}) — lowest performer.`);
  }

  // Status grouping
  const healthyAgents = analyses.filter((a) => a.healthStatus === "healthy");
  const warningAgents = analyses.filter((a) => a.healthStatus === "warning");
  const lowRiskAgents = analyses.filter((a) => a.riskVerdict === "low_risk");
  const medRiskAgents = analyses.filter((a) => a.riskVerdict === "medium_risk");

  // Top/Bottom highlights
  const topByRevenue = [...analyses].sort((a, b) => b.revenue - a.revenue).slice(0, 3);
  const topByJobs = [...analyses].sort((a, b) => b.jobsCompleted - a.jobsCompleted).slice(0, 3);
  const topByEfficiency = [...analyses].sort((a, b) => b.revenuePerJob - a.revenuePerJob).slice(0, 3);
  const bottomByHealth = [...analyses].sort((a, b) => a.healthScore - b.healthScore).slice(0, 3);

  const agentLines = sorted.map((a, i) => {
    const icon = a.healthStatus === "healthy" ? "🟢" : a.healthStatus === "warning" ? "🟡" : "🔴";
    return `${i + 1}. ${icon} ${a.agentName} (ID:${a.agentId}) — Health: ${a.healthScore}/100, Risk: ${a.riskScore}/100 (${a.riskVerdict}), Jobs: ${a.jobsCompleted}, Rev: $${a.revenue.toFixed(2)}, $/job: $${a.revenuePerJob.toFixed(2)}`;
  });

  const humanSummary =
    `📋 MULTI-AGENT REPORT (${analyses.length} agents)\n` +
    `——————————\n` +
    `📊 Portfolio Health: ${avgHealth}/100 | Avg Risk: ${avgRisk}/100\n` +
    `💼 Total Jobs: ${totalJobs.toLocaleString()} | Total Revenue: $${totalRevenue.toFixed(2)}\n` +
    `🏆 Best: ${best.agentName} (${best.healthScore}/100)\n` +
    `⚠️ Worst: ${worst.agentName} (${worst.healthScore}/100)\n` +
    `\n📊 Status Breakdown:\n` +
    `  Health: 🟢 ${healthyAgents.length} healthy | 🟡 ${warningAgents.length} warning | 🔴 ${criticalAgents.length} critical\n` +
    `  Risk: 🟢 ${lowRiskAgents.length} low | 🟡 ${medRiskAgents.length} medium | 🔴 ${highRiskAgents.length} high\n` +
    `\n⚡ Efficiency:\n` +
    `  Avg $/job: $${analyses.length > 0 ? (analyses.reduce((s, a) => s + a.revenuePerJob, 0) / analyses.length).toFixed(2) : "0"}\n` +
    `  Avg $/buyer: $${analyses.length > 0 ? (analyses.reduce((s, a) => s + a.revenuePerBuyer, 0) / analyses.length).toFixed(2) : "0"}\n` +
    `\n🏅 Top 3 by Revenue: ${topByRevenue.map((a) => `${a.agentName} ($${a.revenue.toFixed(2)})`).join(", ")}\n` +
    `🏅 Top 3 by Jobs: ${topByJobs.map((a) => `${a.agentName} (${a.jobsCompleted})`).join(", ")}\n` +
    `🏅 Top 3 by Efficiency: ${topByEfficiency.map((a) => `${a.agentName} ($${a.revenuePerJob.toFixed(2)}/job)`).join(", ")}\n` +
    `🔻 Bottom 3 by Health: ${bottomByHealth.map((a) => `${a.agentName} (${a.healthScore}/100)`).join(", ")}\n` +
    `\n📈 Full Rankings:\n${agentLines.join("\n")}\n` +
    `\n💡 Recommendations:\n${recommendations.map((r, i) => `  ${i + 1}. ${r}`).join("\n")}` +
    `${errors.length > 0 ? `\n\n⚠️ Errors (${errors.length}): ${errors.join("; ")}` : ""}`;

  const deliverable = {
    portfolio_health: avgHealth,
    portfolio_risk: avgRisk,
    agents_analyzed: analyses.length,
    total_jobs: totalJobs,
    total_revenue: totalRevenue,
    best_agent: { name: best.agentName, id: best.agentId, score: best.healthScore },
    worst_agent: { name: worst.agentName, id: worst.agentId, score: worst.healthScore },
    critical_count: criticalAgents.length,
    high_risk_count: highRiskAgents.length,
    status_breakdown: {
      healthy: healthyAgents.length,
      warning: warningAgents.length,
      critical: criticalAgents.length,
      low_risk: lowRiskAgents.length,
      medium_risk: medRiskAgents.length,
      high_risk: highRiskAgents.length,
    },
    efficiency: {
      avg_revenue_per_job: analyses.length > 0 ? analyses.reduce((s, a) => s + a.revenuePerJob, 0) / analyses.length : 0,
      avg_revenue_per_buyer: analyses.length > 0 ? analyses.reduce((s, a) => s + a.revenuePerBuyer, 0) / analyses.length : 0,
    },
    highlights: {
      top_by_revenue: topByRevenue.map((a) => ({ name: a.agentName, id: a.agentId, revenue: a.revenue })),
      top_by_jobs: topByJobs.map((a) => ({ name: a.agentName, id: a.agentId, jobs: a.jobsCompleted })),
      top_by_efficiency: topByEfficiency.map((a) => ({ name: a.agentName, id: a.agentId, rpj: a.revenuePerJob })),
      bottom_by_health: bottomByHealth.map((a) => ({ name: a.agentName, id: a.agentId, score: a.healthScore })),
    },
    rankings: sorted.map((a) => ({
      agent_id: a.agentId,
      agent_name: a.agentName,
      health_score: a.healthScore,
      health_status: a.healthStatus,
      risk_score: a.riskScore,
      risk_verdict: a.riskVerdict,
      risk_flags: a.riskFlags,
      success_rate: a.successRate,
      jobs: a.jobsCompleted,
      revenue: a.revenue,
      rank: a.rank,
      unique_buyers: a.uniqueBuyers,
      last_active: a.lastActive,
      revenue_per_job: a.revenuePerJob,
      revenue_per_buyer: a.revenuePerBuyer,
    })),
    recommendations,
    errors: errors.length > 0 ? errors : undefined,
    human_summary: humanSummary,
  };

  sendResultToWebhook({
    jobId: context?.jobId?.toString(),
    agentId: "portfolio",
    agentName: `Portfolio (${analyses.length} agents)`,
    service: "Multi Agent Report",
    price: 100,
    score: avgHealth,
    status: avgHealth >= 80 ? "healthy" : avgHealth >= 60 ? "warning" : "critical",
    metrics: { totalJobs, totalRevenue, agentsAnalyzed: analyses.length },
    recommendations,
  }).catch((err) => console.log("[Multi Agent Report] Webhook error:", err.message));

  console.log(`[Multi Agent Report] Done. ${analyses.length} agents analyzed. Avg health: ${avgHealth}`);

  return { deliverable: JSON.stringify(deliverable) };
}
