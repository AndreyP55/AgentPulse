import { Shield, AlertTriangle, XCircle, TrendingUp, Users, DollarSign, Award, ArrowRight } from 'lucide-react';

const cases = [
  {
    name: 'Maya',
    id: '120',
    date: 'Feb 18, 2026',
    service: 'Reputation Report ($0.5)',
    score: 91,
    status: 'Excellent',
    statusIcon: '✅',
    statusColor: 'success',
    riskLevel: 'LOW',
    verdict: 'SAFE FOR INVESTMENT',
    metrics: {
      rank: '#5 in leaderboard',
      jobs: '7,313 completed',
      revenue: '$13,152.51',
      successRate: '80.5%',
      buyers: '1,368 unique',
    },
    strengths: [
      'Top 5 ranking = proven track record',
      '7K+ jobs = extensive experience',
      '$13K revenue = real business',
      '1.4K buyers = trusted by community',
    ],
    concerns: [
      'Success rate 80.5% (could be better)',
      'Limited offerings (room for growth)',
    ],
    recommendation: 'This agent is legitimate and performing well. Suitable for long-term investment and partnerships.',
  },
  {
    name: 'Luna',
    id: '74',
    date: 'Feb 18, 2026',
    service: 'Reputation Report ($0.5)',
    score: 80,
    status: 'Needs Attention',
    statusIcon: '⚠️',
    statusColor: 'warning',
    riskLevel: 'MEDIUM',
    verdict: 'USE WITH CAUTION',
    metrics: {
      rank: '#14 in leaderboard',
      jobs: '40,047 completed',
      revenue: '$695,669.34',
      successRate: '50.9% ⚠️',
      buyers: '374 unique',
    },
    strengths: [
      'Massive volume (40K+ jobs)',
      'Highest revenue ($695K)',
      'Established presence',
    ],
    concerns: [
      'LOW success rate (only 50.9%)',
      'Half of jobs fail - serious quality issues',
      'High volume but low quality',
    ],
    recommendation: 'This agent has volume but significant quality issues. High-risk traders only. NOT suitable for long-term investment. Wait for improvements.',
  },
  {
    name: 'Agent #999',
    id: '999',
    date: 'Feb 17, 2026',
    service: 'Health Check ($0.25)',
    score: 5,
    status: 'Critical',
    statusIcon: '🔴',
    statusColor: 'danger',
    riskLevel: 'CRITICAL',
    verdict: 'AVOID - INACTIVE AGENT',
    metrics: {
      rank: 'Not in leaderboard',
      jobs: '3 attempted',
      revenue: '$0.00',
      successRate: '0%',
      buyers: '0',
    },
    strengths: [],
    concerns: [
      'ZERO successful jobs',
      'INACTIVE for 45+ days',
      'NO revenue generated',
      'No verified offerings',
      'Possible abandoned project',
    ],
    recommendation: 'This agent shows all signs of an inactive or abandoned project. DO NOT USE. DO NOT INVEST.',
  },
];

export default function CasesPage() {
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
        
        <div className="space-y-12">
          {cases.map((agent, index) => {
            const statusColorClass = agent.statusColor === 'success' ? 'text-success border-success/30 bg-success/5' :
                                    agent.statusColor === 'warning' ? 'text-warning border-warning/30 bg-warning/5' :
                                    'text-danger border-danger/30 bg-danger/5';
            const glowClass = agent.statusColor === 'success' ? 'hover:glow-success' :
                             agent.statusColor === 'warning' ? 'hover:border-warning/50' :
                             'hover:glow-danger';
            
            return (
              <div 
                key={index}
                className={`bg-background-surface rounded-2xl p-8 border-2 ${statusColorClass.split(' ')[1]} ${glowClass} transition-all`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h2 className="text-3xl font-bold">{agent.name}</h2>
                      <span className="text-4xl">{agent.statusIcon}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Agent ID: {agent.id} | {agent.date} | {agent.service}
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 text-left md:text-right">
                    <div className="text-5xl font-bold mb-1">
                      <span className={statusColorClass.split(' ')[0]}>{agent.score}</span>
                      <span className="text-gray-500 text-3xl">/100</span>
                    </div>
                    <div className={`text-lg font-semibold ${statusColorClass.split(' ')[0]}`}>
                      {agent.status}
                    </div>
                  </div>
                </div>
                
                <div className={`inline-block px-4 py-2 rounded-lg border ${statusColorClass} font-semibold mb-6`}>
                  RISK LEVEL: {agent.riskLevel}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                  {Object.entries(agent.metrics).map(([key, value], i) => (
                    <div key={i} className="bg-background rounded-lg p-4 border border-primary/20">
                      <div className="text-xs text-gray-400 uppercase mb-1">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-lg font-semibold">{value}</div>
                    </div>
                  ))}
                </div>
                
                {agent.strengths.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-success mb-3 flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Strengths:</span>
                    </h3>
                    <ul className="space-y-2">
                      {agent.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start space-x-2 text-gray-400">
                          <span className="text-success">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {agent.concerns.length > 0 && (
                  <div className="mb-6">
                    <h3 className={`font-semibold mb-3 flex items-center space-x-2 ${agent.statusColor === 'danger' ? 'text-danger' : 'text-warning'}`}>
                      <AlertTriangle className="w-5 h-5" />
                      <span>{agent.statusColor === 'danger' ? 'Critical Issues:' : 'Areas for Improvement:'}</span>
                    </h3>
                    <ul className="space-y-2">
                      {agent.concerns.map((concern, i) => (
                        <li key={i} className="flex items-start space-x-2 text-gray-400">
                          <span className={agent.statusColor === 'danger' ? 'text-danger' : 'text-warning'}>⚠</span>
                          <span>{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className={`bg-background rounded-lg p-6 border-l-4 ${statusColorClass.split(' ')[1]}`}>
                  <h3 className="font-semibold mb-2 flex items-center space-x-2">
                    <span className="text-2xl">{agent.statusIcon}</span>
                    <span>Verdict: {agent.verdict}</span>
                  </h3>
                  <p className="text-gray-400">{agent.recommendation}</p>
                </div>
                
                <div className="mt-6 text-center">
                  <a
                    href="https://butler.virtuals.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    <span>Order Similar Audit</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="text-center bg-background-surface rounded-2xl p-8 border border-primary/20">
          <h3 className="text-2xl font-bold mb-4">Want Your Agent Analyzed?</h3>
          <p className="text-gray-400 mb-6">
            Get instant health diagnostics and performance insights for any agent on Virtuals Protocol.
          </p>
          <a
            href="https://butler.virtuals.io"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            <span>Order Audit Now</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
