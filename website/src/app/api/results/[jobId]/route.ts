import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const RESULTS_FILE = path.join(process.cwd(), 'data', 'results', 'latest.json');

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId;

    if (!existsSync(RESULTS_FILE)) {
      return NextResponse.json(
        { error: 'No results found' },
        { status: 404 }
      );
    }

    const content = await readFile(RESULTS_FILE, 'utf-8');
    const results = JSON.parse(content);

    // Find result by jobId (support multiple formats)
    const result = results.find((r: any) => 
      r.jobId === jobId || 
      r.jobId === `job_${jobId}` ||
      r.jobId?.toString() === jobId ||
      String(r.jobId).includes(jobId)
    );

    if (!result) {
      return NextResponse.json(
        { error: `Result not found for job ${jobId}` },
        { status: 404 }
      );
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[Results API] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
