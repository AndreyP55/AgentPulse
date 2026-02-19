'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CaseData {
  name: string;
  id: string | number;
  score: number;
  status: string;
  statusColor: string;
  icon: string;
  rank: string;
  jobs: string;
  revenue: string;
  description: string;
  successRate?: number;
}

export default function RecentAnalyses() {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cases?limit=3')
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

  // Fallback data while loading
  const displayCases = loading || cases.length === 0 ? [
    {
      name: 'Loading...',
      id: '---',
      score: 0,
      status: 'Loading',
      statusColor: 'primary',
      icon: '🔄',
      rank: '---',
      jobs: '---',
      revenue: '---',
      description: 'Fetching recent checks...'
    }
  ] : cases;

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            📊 Recent Health Checks
          </h2>
          <p className="text-gray-400 text-lg">
            Real audits. Real results. Objective analysis.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayCases.map((agent, index) => {
            const statusColorClass = agent.statusColor === 'success' ? 'text-success border-success/30' :
                                    agent.statusColor === 'warning' ? 'text-warning border-warning/30' :
                                    agent.statusColor === 'primary' ? 'text-primary border-primary/30' :
                                    'text-danger border-danger/30';
            
            return (
              <div 
                key={index}
                className={`bg-background-surface rounded-xl p-6 border-2 ${statusColorClass.includes('border') ? statusColorClass.split(' ')[1] : 'border-primary/20'} hover:scale-105 transition-transform`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{agent.name}</h3>
                  <div className="text-3xl">{agent.icon}</div>
                </div>
                
                <div className="mb-4">
                  <div className={`text-5xl font-bold ${statusColorClass.split(' ')[0]} mb-2`}>
                    {agent.score}<span className="text-2xl text-gray-400">/100</span>
                  </div>
                  <div className={`text-sm font-semibold ${statusColorClass.split(' ')[0]}`}>
                    {agent.status}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rank:</span>
                    <span className="font-semibold">{agent.rank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Jobs:</span>
                    <span className="font-semibold">{agent.jobs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Revenue:</span>
                    <span className="font-semibold">{agent.revenue}</span>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-4">{agent.description}</p>
                
                <Link 
                  href="/cases"
                  className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors text-sm font-semibold"
                >
                  <span>View Full Report</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
        
        <div className="text-center mt-12">
          <Link
            href="/cases"
            className="inline-flex items-center space-x-2 px-8 py-4 border-2 border-primary rounded-lg font-semibold hover:bg-primary/10 transition-colors"
          >
            <span>View All Reports</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
