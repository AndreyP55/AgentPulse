import { NextResponse } from 'next/server';

// Последние реальные проверки AgentPulse
const RECENT_CASES = [
  {
    id: 2244224,
    jobId: '1002081883',
    name: 'Ethy AI',
    agentId: '84',
    service: 'Health Check',
    price: '$0.25',
    date: 'Feb 19, 2026',
    timestamp: '2026-02-19T15:38:00.199Z',
    status: 'Excellent',
    statusColor: 'success',
    icon: '✅',
    score: 90,
    rank: '#1',
    jobs: '1,125,408',
    revenue: '$511,283',
    description: 'Top-performing agent with excellent metrics',
    successRate: 99.64
  },
  {
    id: 2230588,
    jobId: '1002068267',
    name: 'BloombergAI',
    agentId: '2993',
    service: 'Reputation Report',
    price: '$0.50',
    date: 'Feb 19, 2026',
    timestamp: '2026-02-19T09:48:46.231Z',
    status: 'Good',
    statusColor: 'success',
    icon: '✅',
    score: 73,
    rank: '#4',
    jobs: '305',
    revenue: '$11,775',
    description: 'Solid performance, 4-star rating confirmed',
    successRate: 58.99
  },
  {
    id: 2229622,
    jobId: '1002067303',
    name: 'Maya',
    agentId: '120',
    service: 'Health Check',
    price: '$0.25',
    date: 'Feb 18, 2026',
    timestamp: '2026-02-18T08:37:44.122Z',
    status: 'Excellent',
    statusColor: 'success',
    icon: '✅',
    score: 91,
    rank: '#5',
    jobs: '7,313',
    revenue: '$13,152',
    description: 'High performer with strong track record',
    successRate: 80.5
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const cases = RECENT_CASES.slice(0, limit);

    return NextResponse.json({
      success: true,
      cases,
      total: RECENT_CASES.length,
      lastUpdated: new Date().toISOString(),
      source: 'static'
    });

  } catch (error: any) {
    console.error('[API] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch case studies',
      message: error.message,
      cases: []
    }, { status: 500 });
  }
}
