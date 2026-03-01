/**
 * Shared webhook utility for AgentPulse offerings
 */

const WEBHOOK_URL = process.env.WEBHOOK_URL || '';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

interface WebhookData {
  jobId?: string;
  agentId: string;
  agentName: string;
  service: string;
  price: number;
  score: number;
  status: string;
  metrics: {
    successRate?: number;
    jobsCompleted?: number;
    revenue?: number;
    rank?: number | null;
    uniqueBuyers?: number;
  };
  recommendations?: string[];
  /** Reputation Report only */
  period?: string;
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  trends?: { jobsGrowth?: string; revenueGrowth?: string; ratingTrend?: string };
  competitivePosition?: { rank?: number | null; category?: string; pricingVsMarket?: string };
}

/**
 * Send result to website webhook
 */
export async function sendResultToWebhook(data: WebhookData): Promise<void> {
  try {
    if (!WEBHOOK_URL) {
      console.log('[Webhook] URL not configured, skipping');
      return;
    }
    
    const webhookPayload: Record<string, unknown> = {
      jobId: data.jobId || `job_${Date.now()}`,
      agentId: data.agentId,
      agentName: data.agentName,
      service: data.service,
      price: data.price,
      score: data.score,
      status: data.status,
      metrics: data.metrics,
      recommendations: data.recommendations || []
    };
    if (data.period !== undefined) webhookPayload.period = data.period;
    if (data.summary !== undefined) webhookPayload.summary = data.summary;
    if (data.strengths?.length) webhookPayload.strengths = data.strengths;
    if (data.weaknesses?.length) webhookPayload.weaknesses = data.weaknesses;
    if (data.trends) webhookPayload.trends = data.trends;
    if (data.competitivePosition) webhookPayload.competitivePosition = data.competitivePosition;
    
    console.log(`[Webhook] Sending ${data.service} result to:`, WEBHOOK_URL);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (WEBHOOK_SECRET) {
      headers['Authorization'] = `Bearer ${WEBHOOK_SECRET}`;
    }

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(webhookPayload),
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (response.ok) {
      console.log('[Webhook] ✅ Result sent successfully');
    } else {
      const text = await response.text();
      console.log(`[Webhook] ⚠️ Failed with status ${response.status}:`, text);
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log('[Webhook] Error (non-critical):', msg);
  }
}
