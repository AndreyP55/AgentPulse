import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Use /tmp for serverless (Vercel) or local data dir for VPS
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const RESULTS_DIR = isServerless 
  ? path.join('/tmp', 'agentpulse-results')
  : path.join(process.cwd(), 'data', 'results');
const RESULTS_FILE = path.join(RESULTS_DIR, 'latest.json');

interface WebhookResult {
  jobId: string;
  agentId: string;
  agentName: string;
  service: string;
  price: number;
  score: number;
  status: string;
  metrics: any;
  recommendations?: string[];
  timestamp?: number;
}

export async function POST(request: NextRequest) {
  try {
    const data: WebhookResult = await request.json();
    
    console.log('[Webhook API] Received result:', {
      jobId: data.jobId,
      agentName: data.agentName,
      service: data.service,
      score: data.score
    });

    // Ensure data directory exists
    if (!existsSync(RESULTS_DIR)) {
      await mkdir(RESULTS_DIR, { recursive: true });
    }

    // Read existing results
    let results: WebhookResult[] = [];
    if (existsSync(RESULTS_FILE)) {
      const content = await readFile(RESULTS_FILE, 'utf-8');
      results = JSON.parse(content);
    }

    // Add timestamp
    const resultWithTimestamp = {
      ...data,
      timestamp: data.timestamp || Date.now()
    };

    // Add new result (keep last 100)
    results.unshift(resultWithTimestamp);
    if (results.length > 100) {
      results = results.slice(0, 100);
    }

    // Save to file
    await writeFile(RESULTS_FILE, JSON.stringify(results, null, 2));

    console.log('[Webhook API] ✅ Result saved successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'Result received and saved' 
    });

  } catch (error: any) {
    console.error('[Webhook API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!existsSync(RESULTS_FILE)) {
      return NextResponse.json([]);
    }

    const content = await readFile(RESULTS_FILE, 'utf-8');
    const results = JSON.parse(content);

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('[Webhook API] Error reading results:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
