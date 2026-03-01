'use client';

import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CaseData {
  id: number;
  jobId: string;
  name: string;
  service: string;
  price: string;
  date: string;
  status: string;
  statusColor: string;
  icon: string;
  score: number;
  rank: string;
  jobs: string;
  revenue: string;
  description: string;
  successRate?: number;
}

export default function CasesPage() {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cases?limit=10')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.cases) {
          setCases(data.cases);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch cases:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="pt-24 pb-20 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-gray-400">Loading case studies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            📊 Case Studies
          </h1>
          <p className="text-gray-400 text-lg">
            Real audits. Real results. Objective analysis.
          </p>
        </div>
        
        <div className="space-y-8">
          {cases.map((caseData) => {
            const borderColor = caseData.statusColor === 'success' ? 'border-success/30' :
                               caseData.statusColor === 'warning' ? 'border-warning/30' :
                               'border-danger/30';
            
            const scoreColor = caseData.statusColor === 'success' ? 'text-success' :
                              caseData.statusColor === 'warning' ? 'text-warning' :
                              'text-danger';

            return (
              <div
                key={caseData.id}
                className={`bg-background-surface rounded-2xl p-8 border-2 ${borderColor}`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{caseData.icon}</div>
                    <div>
                      <h2 className="text-2xl font-bold">{caseData.name}</h2>
                      <p className="text-gray-400 text-sm">
                        Job ID: {caseData.jobId} | {caseData.date} | {caseData.service} ({caseData.price})
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-5xl font-bold ${scoreColor}`}>
                      {caseData.score}<span className="text-2xl text-gray-400">/100</span>
                    </div>
                    <div className={`text-sm font-semibold ${scoreColor}`}>
                      {caseData.status}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-background/50 rounded-lg p-4 border border-primary/20">
                    <div className="text-xs text-gray-400 uppercase mb-1">Rank</div>
                    <div className="text-lg font-bold">{caseData.rank}</div>
                  </div>
                  
                  <div className="bg-background/50 rounded-lg p-4 border border-primary/20">
                    <div className="text-xs text-gray-400 uppercase mb-1">Jobs</div>
                    <div className="text-lg font-bold">{caseData.jobs}</div>
                  </div>
                  
                  <div className="bg-background/50 rounded-lg p-4 border border-primary/20">
                    <div className="text-xs text-gray-400 uppercase mb-1">Revenue</div>
                    <div className="text-lg font-bold">{caseData.revenue}</div>
                  </div>
                  
                  <div className="bg-background/50 rounded-lg p-4 border border-success/20">
                    <div className="text-xs text-gray-400 uppercase mb-1">Success Rate</div>
                    <div className="text-lg font-bold">{caseData.successRate ? `${caseData.successRate}%` : 'N/A'}</div>
                  </div>
                  
                  <div className="bg-background/50 rounded-lg p-4 border border-primary/20">
                    <div className="text-xs text-gray-400 uppercase mb-1">Status</div>
                    <div className={`text-sm font-semibold ${scoreColor}`}>{caseData.status}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-400">{caseData.description}</p>
                </div>

                <a
                  href={`https://app.virtuals.io/acp/deliverable?jobIds=[${caseData.jobId}]`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg transition-colors"
                >
                  <span>View Full Report on Butler</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            );
          })}
        </div>

        {cases.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-2">No case studies yet</h3>
            <p className="text-gray-400">
              Recent health checks will appear here automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
