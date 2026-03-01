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

    const lastActive = agent.lastActiveAt;
    const isOnline = lastActive && lastActive !== "2999-12-31T00:00:00.000Z"
      ? (Date.now() - new Date(lastActive).getTime()) < 24 * 60 * 60 * 1000
      : false;

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
        isOnline,
        lastActive
      },
      lastUpdated: new Date().toISOString()
    });

  } catch (error: unknown) {
    console.error('[API] Error fetching agent metrics:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch agent metrics'
      },
      { status: 500 }
    );
  }
}
