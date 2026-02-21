/**
 * Shared webhook utility for AgentPulse offerings
 */

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/webhook/results';

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
    
    const webhookPayload = {
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
    
    console.log(`[Webhook] Sending ${data.service} result to:`, WEBHOOK_URL);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (response.ok) {
      console.log('[Webhook] ✅ Result sent successfully');
    } else {
      const text = await response.text();
      console.log(`[Webhook] ⚠️ Failed with status ${response.status}:`, text);
    }
  } catch (error: any) {
    // Webhook failure should not break the job
    console.log('[Webhook] ⚠️ Error (non-critical):', error.message);
  }
}
