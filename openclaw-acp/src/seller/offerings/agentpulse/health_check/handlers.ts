/**
 * AgentPulse - Health Check Offering
 * Price: 0.25 USDC
 * 
 * Quick health check for AI agents on Virtuals Protocol.
 * Analyzes success rate, activity, jobs completed, and provides health score.
 */

import type { ExecuteJobResult, ValidationResult } from "../../../runtime/offeringTypes.js";
import { fetchAgentMetrics, estimateLastActivity } from "../shared/agdp-client.js";

interface AgentData {
  agentId: string;
  successRate: number;
  jobsCompleted: number;
  lastJobTimestamp: number | null;
  revenue: number;
  offerings: number;
  rank: number | null;
}

/**
 * Fetch agent data using improved client
 */
async function fetchAgentData(agentId: string): Promise<AgentData> {
  const metrics = await fetchAgentMetrics(agentId);
  
  return {
    agentId: metrics.agentId,
    successRate: metrics.successRate,
    jobsCompleted: metrics.jobsCompleted,
    lastJobTimestamp: metrics.lastJobTimestamp || estimateLastActivity(metrics.jobsCompleted),
    revenue: metrics.revenue,
    offerings: metrics.offerings.length,
    rank: metrics.rank
  };
}

/**
 * Calculate health score (0-100)
 */
function calculateHealthScore(data: AgentData): number {
  let score = 0;
  
  // Success Rate (40 points max)
  if (data.successRate >= 95) score += 40;
  else if (data.successRate >= 90) score += 35;
  else if (data.successRate >= 85) score += 30;
  else if (data.successRate >= 80) score += 25;
  else if (data.successRate >= 70) score += 20;
  else if (data.successRate >= 50) score += 10;
  else score += 5;
  
  // Recent Activity (30 points max)
  if (data.lastJobTimestamp) {
    const hoursSinceLastJob = (Date.now() - data.lastJobTimestamp) / (1000 * 60 * 60);
    if (hoursSinceLastJob < 1) score += 30;
    else if (hoursSinceLastJob < 6) score += 25;
    else if (hoursSinceLastJob < 24) score += 20;
    else if (hoursSinceLastJob < 72) score += 10;
    else if (hoursSinceLastJob < 168) score += 5;
  }
  
  // Jobs Completed (30 points max)
  if (data.jobsCompleted > 500) score += 30;
  else if (data.jobsCompleted > 200) score += 25;
  else if (data.jobsCompleted > 100) score += 20;
  else if (data.jobsCompleted > 50) score += 15;
  else if (data.jobsCompleted > 20) score += 10;
  else if (data.jobsCompleted > 5) score += 5;
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Determine health status
 */
function getHealthStatus(score: number): string {
  if (score >= 80) return "healthy";
  if (score >= 60) return "warning";
  return "critical";
}

/**
 * Generate recommendations
 */
function generateRecommendations(data: AgentData, score: number): string[] {
  const recommendations: string[] = [];
  
  if (score >= 85) {
    recommendations.push("Agent is performing excellently! Keep up the good work.");
  } else if (score >= 70) {
    recommendations.push("Agent is in good health with room for improvement.");
  } else if (score >= 50) {
    recommendations.push("Agent needs attention - some issues detected.");
  } else {
    recommendations.push("⚠️ Agent has critical issues - immediate action required.");
  }
  
  // Success rate recommendations
  if (data.successRate < 90) {
    recommendations.push(`Improve success rate (currently ${data.successRate.toFixed(1)}%) - check for errors in handlers`);
  }
  
  // Activity recommendations
  if (data.lastJobTimestamp) {
    const hoursSinceLastJob = (Date.now() - data.lastJobTimestamp) / (1000 * 60 * 60);
    if (hoursSinceLastJob > 72) {
      recommendations.push("Low recent activity - check if seller runtime is running");
    } else if (hoursSinceLastJob > 24) {
      recommendations.push("No jobs in last 24h - consider marketing or pricing adjustments");
    }
  } else {
    recommendations.push("No job history found - agent may be new or offline");
  }
  
  // Jobs completed recommendations
  if (data.jobsCompleted < 10) {
    recommendations.push("New agent - focus on building reputation and getting first customers");
  } else if (data.jobsCompleted < 50) {
    recommendations.push("Growing agent - continue building trust and expanding offerings");
  }
  
  // Offerings recommendations
  if (data.offerings < 3) {
    recommendations.push("Consider adding more offerings to increase touchpoints");
  }
  
  return recommendations;
}

/**
 * Main execution function
 */
export async function executeJob(requirements: any): Promise<ExecuteJobResult> {
  console.log('[Health Check] Starting health check...');
  console.log('[Health Check] Requirements:', requirements);
  
  // Support both naming conventions
  const agentId = requirements.agent_id || requirements.agentId;
  
  if (!agentId) {
    throw new Error('agent_id is required');
  }
  
  try {
    // Fetch agent data
    const agentData = await fetchAgentData(agentId);
    
    // Calculate health score
    const healthScore = calculateHealthScore(agentData);
    
    // Determine status
    const status = getHealthStatus(healthScore);
    
    // Generate recommendations
    const recommendations = generateRecommendations(agentData, healthScore);
    
    // Build result
    const result = {
      healthScore,
      status,
      checks: {
        isOnline: agentData.lastJobTimestamp !== null,
        hasActiveOfferings: agentData.offerings > 0,
        recentActivity: agentData.lastJobTimestamp ? (Date.now() - agentData.lastJobTimestamp) < (24 * 60 * 60 * 1000) : false,
        goodSuccessRate: agentData.successRate >= 90
      },
      metrics: {
        successRate: agentData.successRate,
        jobsCompleted: agentData.jobsCompleted,
        lastJobTimestamp: agentData.lastJobTimestamp,
        revenue: agentData.revenue,
        offerings: agentData.offerings,
        rank: agentData.rank
      },
      recommendations,
      timestamp: Date.now(),
      checkedBy: "AgentPulse v1.0"
    };
    
    console.log('[Health Check] Completed successfully');
    console.log('[Health Check] Health Score:', healthScore);
    console.log('[Health Check] Status:', status);
    
    return { deliverable: result };
    
  } catch (error: any) {
    console.error('[Health Check] Error:', error);
    throw new Error(`Health check failed: ${error.message}`);
  }
}

/**
 * Validate incoming requirements
 */
export function validateRequirements(requirements: any): ValidationResult {
  const agentId = requirements.agent_id || requirements.agentId;
  
  if (!agentId) {
    return {
      valid: false,
      reason: "agent_id is required - provide the agent ID or wallet address to check"
    };
  }
  
  // Basic validation - agent ID should be a string
  if (typeof agentId !== 'string' && typeof agentId !== 'number') {
    return {
      valid: false,
      reason: "agent_id must be a string or number"
    };
  }
  
  return { valid: true };
}

/**
 * Custom payment request message
 */
export function requestPayment(requirements: any): string {
  const agentId = requirements.agent_id || requirements.agentId;
  return `Health check requested for agent ${agentId} - 0.25 USDC`;
}
