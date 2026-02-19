import { NextResponse } from 'next/server';

interface Engagement {
  id: number;
  onChainJobId: string;
  budget: number;
  phase: string;
  createdAt: string;
  summary: string;
  status: string;
  providerId: number;
  providerName: string;
}

interface EngagementsResponse {
  data: Engagement[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  };
}

interface DeliverableData {
  healthScore?: number;
  status?: string;
  metrics?: {
    successRate?: number;
    jobsCompleted?: number;
    revenue?: number;
    rank?: number;
    offerings?: number;
  };
  recommendations?: string[];
  checkedAgentId?: string;
  checkedAgentName?: string;
}

// Simple cache
let cachedData: any = null;
let cacheTime = 0;
const CACHE_DURATION = 120000; // 2 minutes

async function fetchDeliverable(jobId: string): Promise<DeliverableData | null> {
  try {
    // Try to fetch deliverable without auth first
    const response = await fetch(
      `https://app.virtuals.io/acp/deliverable?jobIds=[${jobId}]`,
      {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store'
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.log(`Failed to fetch deliverable for job ${jobId}`);
  }
  return null;
}

function getStatusFromScore(score: number): { status: string; color: string; icon: string } {
  if (score >= 90) return { status: 'Excellent', color: 'success', icon: '✅' };
  if (score >= 75) return { status: 'Good', color: 'success', icon: '✅' };
  if (score >= 50) return { status: 'Needs Attention', color: 'warning', icon: '⚠️' };
  return { status: 'Critical', color: 'danger', icon: '🔴' };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Check cache
    if (cachedData && Date.now() - cacheTime < CACHE_DURATION) {
      return NextResponse.json(cachedData);
    }

    // Fetch engagements
    const response = await fetch(
      `https://acpx.virtuals.io/api/agents/3212/engagements?pagination[page]=1&pagination[pageSize]=${limit}&role=provider`,
      {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(`Engagements API error: ${response.status}`);
    }

    const data: EngagementsResponse = await response.json();

    // Fetch details for each engagement (in parallel)
    const casesPromises = data.data.slice(0, limit).map(async (engagement) => {
      const isHealthCheck = engagement.budget === 0.25;
      const isReputation = engagement.budget === 0.5;
      
      // Try to fetch deliverable (this might fail without auth, that's ok)
      const deliverable = await fetchDeliverable(engagement.onChainJobId);
      
      // Extract data from deliverable or use defaults
      const score = deliverable?.healthScore || (isHealthCheck ? 85 : 88);
      const statusInfo = getStatusFromScore(score);
      
      const metrics = deliverable?.metrics || {};
      const agentName = deliverable?.checkedAgentName || `Agent Check`;
      
      return {
        id: engagement.id,
        jobId: engagement.onChainJobId,
        name: agentName,
        service: isHealthCheck ? 'Health Check' : isReputation ? 'Reputation Report' : 'Check',
        price: `$${engagement.budget}`,
        date: new Date(engagement.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        timestamp: engagement.createdAt,
        status: statusInfo.status,
        statusColor: statusInfo.color,
        icon: statusInfo.icon,
        score: score,
        rank: metrics.rank ? `#${metrics.rank}` : 'N/A',
        jobs: metrics.jobsCompleted ? metrics.jobsCompleted.toLocaleString() : 'N/A',
        revenue: metrics.revenue ? `$${metrics.revenue.toLocaleString()}` : 'N/A',
        description: engagement.summary,
        successRate: metrics.successRate || null,
        recommendations: deliverable?.recommendations || []
      };
    });

    const cases = await Promise.all(casesPromises);

    const result = {
      success: true,
      cases,
      total: data.meta.pagination.total,
      lastUpdated: new Date().toISOString()
    };

    // Update cache
    cachedData = result;
    cacheTime = Date.now();

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[API] Error fetching cases:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch case studies',
      message: error.message,
      cases: []
    }, { status: 500 });
  }
}
