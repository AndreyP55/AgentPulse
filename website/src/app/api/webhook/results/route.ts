import { NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';

interface WebhookResult {
  jobId: string;
  timestamp: string;
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
    rank?: number;
    uniqueBuyers?: number;
  };
  recommendations?: string[];
}

// Path to store results
const DATA_DIR = join(process.cwd(), 'data');
const RESULTS_FILE = join(DATA_DIR, 'results.json');

async function ensureDataDir() {
  try {
    await mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

async function loadResults(): Promise<WebhookResult[]> {
  try {
    const data = await readFile(RESULTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveResults(results: WebhookResult[]) {
  await ensureDataDir();
  await writeFile(RESULTS_FILE, JSON.stringify(results, null, 2));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.jobId || !body.agentId || !body.score) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Load existing results
    const results = await loadResults();
    
    // Add new result
    const newResult: WebhookResult = {
      jobId: body.jobId,
      timestamp: new Date().toISOString(),
      agentId: body.agentId,
      agentName: body.agentName || `Agent ${body.agentId}`,
      service: body.service || 'Health Check',
      price: body.price || 0.25,
      score: body.score,
      status: body.status || 'Completed',
      metrics: body.metrics || {},
      recommendations: body.recommendations || []
    };
    
    // Add to beginning of array (newest first)
    results.unshift(newResult);
    
    // Keep only last 50 results
    const trimmedResults = results.slice(0, 50);
    
    // Save to file
    await saveResults(trimmedResults);
    
    console.log('[Webhook] New result saved:', newResult.jobId, newResult.agentName);
    
    return NextResponse.json({
      success: true,
      message: 'Result saved successfully',
      totalResults: trimmedResults.length
    });
    
  } catch (error: any) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve results
export async function GET() {
  try {
    const results = await loadResults();
    
    return NextResponse.json({
      success: true,
      results,
      total: results.length
    });
    
  } catch (error: any) {
    console.error('[Webhook] Error loading results:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
