'use client';

import { useEffect, useState, useCallback } from 'react';

interface Result {
  jobId: string;
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
  timestamp: number;
}

function scoreColorClass(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-red-400';
}

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch('/api/webhook/results');
      const data = await res.json();
      if (Array.isArray(data)) {
        setResults(data);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchResults();
    };

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') fetchResults();
    }, 15000);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchResults]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-xl text-gray-400">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 gradient-text">AgentPulse Results</h1>
        
        {results.length === 0 ? (
          <div className="text-gray-400 text-center py-20">
            No results yet. Waiting for jobs...
          </div>
        ) : (
          <div className="grid gap-6">
            {results.map((result) => (
              <div
                key={result.jobId}
                className="gradient-border rounded-xl p-6 hover:scale-[1.01] transition-transform"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-primary">
                      {result.agentName}
                    </h2>
                    <p className="text-gray-400">Agent ID: {result.agentId}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${scoreColorClass(result.score)}`}>
                      {result.score}/100
                    </div>
                    <div className="text-sm text-gray-400">{result.service}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {result.metrics.successRate !== undefined && (
                    <div className="bg-background-surface p-3 rounded-lg border border-primary/10">
                      <div className="text-gray-400 text-sm">Success Rate</div>
                      <div className="text-xl font-bold">
                        {result.metrics.successRate.toFixed(2)}%
                      </div>
                    </div>
                  )}
                  {result.metrics.jobsCompleted !== undefined && (
                    <div className="bg-background-surface p-3 rounded-lg border border-primary/10">
                      <div className="text-gray-400 text-sm">Jobs</div>
                      <div className="text-xl font-bold">
                        {result.metrics.jobsCompleted.toLocaleString()}
                      </div>
                    </div>
                  )}
                  {result.metrics.revenue !== undefined && (
                    <div className="bg-background-surface p-3 rounded-lg border border-primary/10">
                      <div className="text-gray-400 text-sm">Revenue</div>
                      <div className="text-xl font-bold">
                        ${result.metrics.revenue.toLocaleString()}
                      </div>
                    </div>
                  )}
                  {result.metrics.rank !== undefined && result.metrics.rank !== null && (
                    <div className="bg-background-surface p-3 rounded-lg border border-primary/10">
                      <div className="text-gray-400 text-sm">Rank</div>
                      <div className="text-xl font-bold">#{result.metrics.rank}</div>
                    </div>
                  )}
                </div>

                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2 text-primary">Recommendations</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      {result.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                  <span>Job ID: {result.jobId}</span>
                  <span>
                    {result.timestamp ? new Date(result.timestamp).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
