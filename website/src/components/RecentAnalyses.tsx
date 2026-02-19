import { ArrowRight, TrendingUp, AlertTriangle, XCircle } from 'lucide-react';
import Link from 'next/link';

const cases = [
  {
    name: 'Maya',
    id: '120',
    score: 91,
    status: 'Excellent',
    statusColor: 'success',
    icon: '✅',
    rank: '#5',
    jobs: '7,313',
    revenue: '$13,152',
    description: 'High performer with strong track record',
  },
  {
    name: 'Luna',
    id: '74',
    score: 80,
    status: 'Needs Attention',
    statusColor: 'warning',
    icon: '⚠️',
    rank: '#14',
    jobs: '40,047',
    revenue: '$695,669',
    description: 'High volume, quality issues detected',
  },
  {
    name: 'Agent #999',
    id: '999',
    score: 5,
    status: 'Critical',
    statusColor: 'danger',
    icon: '🔴',
    rank: 'Not ranked',
    jobs: '0',
    revenue: '$0',
    description: 'Inactive, no successful jobs',
  },
];

export default function RecentAnalyses() {
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
          {cases.map((agent, index) => {
            const statusColorClass = agent.statusColor === 'success' ? 'text-success border-success/30' :
                                    agent.statusColor === 'warning' ? 'text-warning border-warning/30' :
                                    'text-danger border-danger/30';
            const glowClass = agent.statusColor === 'success' ? 'glow-success' :
                             agent.statusColor === 'warning' ? 'border-warning/30' :
                             'glow-danger';
            
            return (
              <div 
                key={index}
                className={`bg-background-surface rounded-xl p-6 border ${statusColorClass} hover:scale-105 transition-transform`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{agent.name}</h3>
                  <span className="text-3xl">{agent.icon}</span>
                </div>
                
                <div className="mb-4">
                  <div className="text-4xl font-bold mb-2">
                    <span className={statusColorClass.split(' ')[0]}>{agent.score}</span>
                    <span className="text-gray-500 text-2xl">/100</span>
                  </div>
                  <div className={`text-sm font-semibold ${statusColorClass.split(' ')[0]}`}>
                    {agent.status}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-400 mb-4">
                  <div className="flex justify-between">
                    <span>Rank:</span>
                    <span className="text-white">{agent.rank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jobs:</span>
                    <span className="text-white">{agent.jobs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="text-white">{agent.revenue}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 mb-4">
                  {agent.description}
                </p>
                
                <Link 
                  href="/cases"
                  className="text-primary hover:text-primary-dark transition-colors text-sm font-semibold flex items-center space-x-1"
                >
                  <span>View Full Report</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
        
        <div className="mt-12 text-center">
          <Link 
            href="/cases"
            className="inline-flex items-center space-x-2 px-6 py-3 border-2 border-primary rounded-lg font-semibold hover:bg-primary/10 transition-colors"
          >
            <span>View All Reports</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
