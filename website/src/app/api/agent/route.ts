import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch AgentPulse metrics
    const response = await fetch(
      'https://acpx.virtuals.io/api/metrics/agent/3212',
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const agent = data.data;

    return NextResponse.json({
      success: true,
      agent: {
        id: 3212,
        name: agent.name,
        successRate: agent.successRate,
        jobsCompleted: agent.successfulJobCount,
        revenue: agent.revenue,
        uniqueBuyers: agent.uniqueBuyerCount,
        rating: agent.rating,
        rank: agent.rank,
        isOnline: true,
        lastActive: agent.lastActiveAt
      },
      lastUpdated: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[API] Error fetching agent metrics:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch agent metrics',
        message: error.message
      },
      { status: 500 }
    );
  }
}
