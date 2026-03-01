/**
 * AgentPulse - Reputation Report Offering
 * Price: 1 USDC
 * 
 * Comprehensive reputation analysis for AI agents on Virtuals Protocol.
 * Includes trends, competitive positioning, strengths/weaknesses analysis.
 */

import type { ExecuteJobResult, ValidationResult } from "../../../runtime/offeringTypes.js";
import { fetchAgentMetrics, estimateLastActivity, resolveAgentId } from "../shared/agdp-client.js";
import { sendResultToWebhook } from "../shared/webhook.js";

interface AgentData {
  agentId: string;
  agentName: string;
  successRate: number;
  jobsCompleted: number;
  uniqueBuyers: number;
  revenue: number;
  averageRating: number;
  rank: number | null;
  lastJobTimestamp: number | null;
  offerings: Array<{
    name: string;
    price: number;
    description?: string;
  }>;
}

/**
 * Fetch comprehensive agent data using improved client
 */
async function fetchAgentData(agentId: string): Promise<AgentData> {
  const metrics = await fetchAgentMetrics(agentId);
  
  return {
    agentId: metrics.agentId,
    agentName: metrics.agentName,
    successRate: metrics.successRate,
    jobsCompleted: metrics.jobsCompleted,
    uniqueBuyers: metrics.uniqueBuyers,
    revenue: metrics.revenue,
    averageRating: metrics.rating,
    rank: metrics.rank,
    lastJobTimestamp: metrics.lastJobTimestamp || estimateLastActivity(metrics.jobsCompleted),
    offerings: metrics.offerings
  };
}

/**
 * Calculate overall reputation score (0-100)
 */
function calculateOverallScore(data: AgentData): number {
  let score = 0;
  
  // Success Rate (30 points)
  score += (data.successRate / 100) * 30;
  
  // Jobs Completed (25 points)
  const jobsScore = Math.min(25, Math.log10(data.jobsCompleted + 1) * 8);
  score += jobsScore;
  
  // Revenue (20 points)
  const revenueScore = Math.min(20, Math.log10(data.revenue + 1) * 5);
  score += revenueScore;
  
  // Rating (15 points)
  score += (data.averageRating / 5) * 15;
  
  // Unique Buyers (10 points)
  const buyersScore = Math.min(10, Math.log10(data.uniqueBuyers + 1) * 3);
  score += buyersScore;
  
  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Analyze trends — estimated from current metrics (no historical data available yet).
 */
function analyzeTrends(data: AgentData): {
  jobsGrowth: string;
  revenueGrowth: string;
  ratingTrend: string;
} {
  const jobsGrowth = data.jobsCompleted > 100 ? "high activity"
    : data.jobsCompleted > 20 ? "moderate activity"
    : "low activity";
  const revenueGrowth = data.revenue > 200 ? "strong revenue"
    : data.revenue > 50 ? "moderate revenue"
    : "early stage";
  const ratingTrend = data.averageRating >= 4.5 ? "excellent"
    : data.averageRating >= 3.5 ? "good"
    : "needs improvement";
  
  return {
    jobsGrowth,
    revenueGrowth,
    ratingTrend
  };
}

/**
 * Identify strengths
 */
function identifyStrengths(data: AgentData): string[] {
  const strengths: string[] = [];
  
  if (data.successRate >= 95) {
    strengths.push(`Excellent success rate (${data.successRate.toFixed(1)}%)`);
  } else if (data.successRate >= 90) {
    strengths.push(`High success rate (${data.successRate.toFixed(1)}%)`);
  }
  
  if (data.jobsCompleted > 100) {
    strengths.push("Extensive experience with 100+ jobs completed");
  } else if (data.jobsCompleted > 50) {
    strengths.push("Solid track record with 50+ jobs");
  }
  
  if (data.averageRating >= 4.5) {
    strengths.push("Outstanding customer satisfaction (4.5+ stars)");
  } else if (data.averageRating >= 4.0) {
    strengths.push("Good customer reviews (4+ stars)");
  }
  
  if (data.uniqueBuyers > 30) {
    strengths.push("Wide customer base with 30+ unique buyers");
  }
  
  if (data.revenue > 200) {
    strengths.push(`Strong revenue generation ($${data.revenue.toFixed(2)})`);
  }
  
  const hoursSinceLastJob = data.lastJobTimestamp 
    ? (Date.now() - data.lastJobTimestamp) / (1000 * 60 * 60)
    : 999;
  
  if (hoursSinceLastJob < 6) {
    strengths.push("High activity - recently completed jobs");
  }
  
  if (data.offerings.length >= 5) {
    strengths.push("Diverse service portfolio with multiple offerings");
  }
  
  if (strengths.length === 0) {
    strengths.push("Building reputation - room for growth");
  }
  
  return strengths;
}

/**
 * Identify weaknesses
 */
function identifyWeaknesses(data: AgentData): string[] {
  const weaknesses: string[] = [];
  
  if (data.successRate < 85) {
    weaknesses.push(`Success rate needs improvement (${data.successRate.toFixed(1)}%)`);
  }
  
  if (data.jobsCompleted < 20) {
    weaknesses.push("Limited experience - new agent");
  }
  
  if (data.averageRating < 4.0) {
    weaknesses.push("Customer satisfaction could be higher");
  }
  
  if (data.uniqueBuyers < 10) {
    weaknesses.push("Small customer base - needs more visibility");
  }
  
  if (data.offerings.length < 3) {
    weaknesses.push("Limited offering variety");
  }
  
  const hoursSinceLastJob = data.lastJobTimestamp 
    ? (Date.now() - data.lastJobTimestamp) / (1000 * 60 * 60)
    : 999;
  
  if (hoursSinceLastJob > 72) {
    weaknesses.push("Low recent activity - possible downtime");
  }
  
  if (data.revenue < 50) {
    weaknesses.push("Low revenue generation - pricing or demand issues");
  }
  
  if (weaknesses.length === 0) {
    weaknesses.push("No significant weaknesses identified");
  }
  
  return weaknesses;
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(data: AgentData, strengths: string[], weaknesses: string[]): string[] {
  const recommendations: string[] = [];
  
  // Based on success rate
  if (data.successRate < 90) {
    recommendations.push("Focus on improving service quality - debug handlers and test edge cases");
  }
  
  // Based on job count
  if (data.jobsCompleted < 50) {
    recommendations.push("Build reputation through consistent delivery and competitive pricing");
  }
  
  // Based on offerings
  if (data.offerings.length < 3) {
    recommendations.push("Add 2-3 new offerings to increase touchpoints and revenue streams");
  } else if (data.offerings.length < 5) {
    recommendations.push("Consider adding complementary services to existing offerings");
  }
  
  // Based on activity
  const hoursSinceLastJob = data.lastJobTimestamp 
    ? (Date.now() - data.lastJobTimestamp) / (1000 * 60 * 60)
    : 999;
  
  if (hoursSinceLastJob > 24) {
    recommendations.push("Increase marketing efforts - share on Twitter, Discord, partner with other agents");
  }
  
  // Based on revenue
  if (data.revenue < 100) {
    recommendations.push("Review pricing strategy - test different price points for better conversion");
  }
  
  // Based on buyers
  if (data.uniqueBuyers < 20) {
    recommendations.push("Expand customer base through partnerships and referral programs");
  }
  
  // Based on rating
  if (data.averageRating < 4.5) {
    recommendations.push("Improve customer experience - faster response times and better result quality");
  }
  
  // General recommendations
  if (strengths.length > weaknesses.length) {
    recommendations.push("Leverage your strengths in marketing materials and positioning");
  }
  
  recommendations.push("Monitor health regularly with AgentPulse health_check (0.25 USDC)");
  
  return recommendations;
}

/**
 * Competitive positioning
 */
function analyzeCompetitivePosition(data: AgentData): {
  rank: number | null;
  category: string;
  pricingVsMarket: string;
} {
  // Use real rank from API, or null if not in leaderboard
  const rank = data.rank;
  
  const category = data.offerings[0]?.name.includes('token') ? 'analytics' :
                   data.offerings[0]?.name.includes('content') ? 'content' :
                   data.offerings[0]?.name.includes('monitor') ? 'monitoring' : 'general';
  
  const avgOfferingPrice = data.offerings.length > 0
    ? data.offerings.reduce((sum, o) => sum + o.price, 0) / data.offerings.length
    : 1.0;
  
  const pricingVsMarket = avgOfferingPrice < 0.5 ? 'budget' :
                          avgOfferingPrice < 2.0 ? 'competitive' :
                          avgOfferingPrice < 5.0 ? 'premium' : 'luxury';
  
  return {
    rank,
    category,
    pricingVsMarket
  };
}

/**
 * Main execution function
 */
export async function executeJob(requirements: any, context?: any): Promise<ExecuteJobResult> {
  console.log('[Reputation Report] Starting comprehensive analysis...');
  console.log('[Reputation Report] Requirements:', requirements);
  
  const agentIdOrName = requirements.agent_id || requirements.agentId || requirements.target_agent_id || requirements.target || requirements.agent;
  const clientWallet = context?.clientAddress;
  const period = requirements.period || '30d';
  
  console.log(`[Reputation Report] Resolving agent: input="${agentIdOrName}", clientWallet="${clientWallet}"`);
  const agentId = await resolveAgentId(agentIdOrName, clientWallet);
  console.log(`[Reputation Report] Resolved agent ID: ${agentId}`);
  if (!agentId) {
    throw new Error(
      'agent_id required. Accepted formats:\n' +
      '  - Numeric ID: 3212\n' +
      '  - Agent name: "RugBouncer"\n' +
      '  - URL: https://agdp.io/agent/3212\n' +
      '  - URL: https://app.virtuals.io/acp/agent-details/3212'
    );
  }
  
  try {
    const agentData = await fetchAgentData(agentId);
    
    // Calculate overall score
    const overallScore = calculateOverallScore(agentData);
    
    // Analyze trends
    const trends = analyzeTrends(agentData);
    
    // Identify strengths and weaknesses
    const strengths = identifyStrengths(agentData);
    const weaknesses = identifyWeaknesses(agentData);
    
    // Generate recommendations
    const recommendations = generateRecommendations(agentData, strengths, weaknesses);
    
    // Competitive positioning
    const competitivePosition = analyzeCompetitivePosition(agentData);
    
    // Build comprehensive result
    const result = {
      agentId,
      agentName: agentData.agentName,
      period,
      overallScore,
      metrics: {
        successRate: agentData.successRate,
        jobsCompleted: agentData.jobsCompleted,
        uniqueBuyers: agentData.uniqueBuyers,
        totalRevenue: agentData.revenue,
        averageRating: agentData.averageRating,
        responseTime: "N/A",
        offerings: agentData.offerings.length
      },
      trends,
      strengths,
      weaknesses,
      recommendations,
      competitivePosition,
      summary: overallScore >= 80 
        ? "Excellent agent with strong reputation and performance"
        : overallScore >= 60
        ? "Good agent with solid track record and room for growth"
        : overallScore >= 40
        ? "Developing agent with potential but needs improvement"
        : "New or struggling agent requiring significant optimization",
      timestamp: Date.now(),
      analyzedBy: "AgentPulse v1.0",
      nextCheckRecommended: "7d"
    };
    
    console.log('[Reputation Report] Analysis completed successfully');
    console.log('[Reputation Report] Overall Score:', overallScore);
    console.log('[Reputation Report] Strengths:', strengths.length);
    console.log('[Reputation Report] Weaknesses:', weaknesses.length);
    console.log('[Reputation Report] Recommendations:', recommendations.length);
    
    // Send to webhook (non-blocking)
    sendResultToWebhook({
      jobId: context?.jobId?.toString(),
      agentId,
      agentName: agentData.agentName,
      service: 'Reputation Report',
      price: 1,
      score: overallScore,
      status: overallScore >= 80 ? 'excellent' : overallScore >= 60 ? 'good' : overallScore >= 40 ? 'developing' : 'struggling',
      metrics: {
        successRate: agentData.successRate,
        jobsCompleted: agentData.jobsCompleted,
        revenue: agentData.revenue,
        rank: agentData.rank,
        uniqueBuyers: agentData.uniqueBuyers
      },
      recommendations,
      period,
      summary: result.summary,
      strengths,
      weaknesses,
      trends,
      competitivePosition
    }).catch(err => 
      console.log('[Reputation Report] Webhook error (non-critical):', err.message)
    );
    
    // JSON for agents + human_summary for Butler/humans (both audiences)
    const strengthsBlock = strengths.length
      ? `\n✅ Strengths:\n${strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
      : '';
    const weaknessesBlock = weaknesses.length
      ? `\n⚠️ Weaknesses:\n${weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')}`
      : '';
    const recommendationsBlock = recommendations.length
      ? `\n💡 Recommendations:\n${recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
      : '';

    const humanSummary = `🏆 REPUTATION REPORT - ${agentData.agentName}\n📊 Overall Score: ${overallScore}/100\n📈 Success Rate: ${agentData.successRate.toFixed(2)}%\n💼 Jobs: ${agentData.jobsCompleted.toLocaleString()}\n💰 Revenue: $${agentData.revenue.toLocaleString()}\n🏅 Rank: #${agentData.rank || 'N/A'}${strengthsBlock}${weaknessesBlock}${recommendationsBlock}`;

    const deliverable = {
      overall_score: overallScore,
      strengths,
      weaknesses,
      recommendations,
      competitive_position: competitivePosition,
      trends,
      summary: result.summary,
      human_summary: humanSummary
    };

    return { deliverable: JSON.stringify(deliverable) };
    
  } catch (error: any) {
    console.error('[Reputation Report] Error:', error);
    throw new Error(`Reputation analysis failed: ${error.message}`);
  }
}

/**
 * Validate incoming requirements
 */
export function validateRequirements(requirements: any): ValidationResult {
  const agentId = requirements.agent_id || requirements.agentId;
  if (agentId !== undefined && agentId !== null && agentId !== '') {
    if (typeof agentId !== 'string' && typeof agentId !== 'number') {
      return { valid: false, reason: "agent_id must be a string or number" };
    }
  }
  const period = requirements.period;
  if (period && !['7d', '30d', '90d'].includes(period)) {
    return { valid: false, reason: "period must be one of: 7d, 30d, 90d" };
  }
  return { valid: true };
}

/**
 * Custom payment request message
 */
export function requestPayment(requirements: any): string {
  const agentId = requirements.agent_id || requirements.agentId;
  const period = requirements.period || '30d';
  return `Comprehensive reputation report requested for agent ${agentId || 'self'} (${period} analysis) - 1 USDC`;
}
