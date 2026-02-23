'use client';

import { useEffect, useState } from 'react';

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

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async () => {
    try {
      const res = await fetch('/api/webhook/results');
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">AgentPulse Results</h1>
        
        {results.length === 0 ? (
          <div className="text-gray-400 text-center py-20">
            No results yet. Waiting for jobs...
          </div>
        ) : (
          <div className="grid gap-6">
            {results.map((result) => (
              <div
                key={result.jobId}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-400">
                      {result.agentName}
                    </h2>
                    <p className="text-gray-400">Agent ID: {result.agentId}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-400">
                      {result.score}/100
                    </div>
                    <div className="text-sm text-gray-400">{result.service}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {result.metrics.successRate !== undefined && (
                    <div className="bg-gray-800 p-3 rounded">
                      <div className="text-gray-400 text-sm">Success Rate</div>
                      <div className="text-xl font-bold">
                        {result.metrics.successRate.toFixed(2)}%
                      </div>
                    </div>
                  )}
                  {result.metrics.jobsCompleted !== undefined && (
                    <div className="bg-gray-800 p-3 rounded">
                      <div className="text-gray-400 text-sm">Jobs</div>
                      <div className="text-xl font-bold">
                        {result.metrics.jobsCompleted.toLocaleString()}
                      </div>
                    </div>
                  )}
                  {result.metrics.revenue !== undefined && (
                    <div className="bg-gray-800 p-3 rounded">
                      <div className="text-gray-400 text-sm">Revenue</div>
                      <div className="text-xl font-bold">
                        ${result.metrics.revenue.toLocaleString()}
                      </div>
                    </div>
                  )}
                  {result.metrics.rank !== undefined && result.metrics.rank !== null && (
                    <div className="bg-gray-800 p-3 rounded">
                      <div className="text-gray-400 text-sm">Rank</div>
                      <div className="text-xl font-bold">#{result.metrics.rank}</div>
                    </div>
                  )}
                </div>

                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">💡 Recommendations</h3>
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
                    {new Date(result.timestamp).toLocaleString()}
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
