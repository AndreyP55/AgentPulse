import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const RESULTS_DIR = isServerless 
  ? path.join('/tmp', 'agentpulse-results')
  : path.join(process.cwd(), 'data', 'results');
const RESULTS_FILE = path.join(RESULTS_DIR, 'latest.json');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    if (!existsSync(RESULTS_FILE)) {
      return NextResponse.json(
        { error: 'No results found' },
        { status: 404 }
      );
    }

    const content = await readFile(RESULTS_FILE, 'utf-8');
    const results = JSON.parse(content);

    const result = results.find((r: any) => 
      r.jobId === jobId || 
      r.jobId === `job_${jobId}` ||
      String(r.jobId) === jobId
    );

    if (!result) {
      return NextResponse.json(
        { error: `Result not found for job ${jobId}` },
        { status: 404 }
      );
    }

    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error('[Results API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
