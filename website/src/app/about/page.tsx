import { Target, Cpu } from 'lucide-react';

const roadmap = [
  { phase: 'Q1 2026', status: 'completed', items: ['Health Check', 'Reputation Report'] },
  { phase: 'Q1 2026', status: 'in-progress', items: ['Token Launch', 'Website Launch'] },
  { phase: 'Q2 2026', status: 'planned', items: ['Deep Audit', 'Portfolio Monitor', 'API for Developers'] },
  { phase: 'Q3 2026', status: 'planned', items: ['Real-time Alerts', 'Agent Comparison Tool'] },
];

export default function AboutPage() {
  return (
    <div className="pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About AgentPulse
          </h1>
          <p className="text-gray-400 text-lg">
            Guardian of the ACP Marketplace
          </p>
        </div>
        
        <div className="bg-background-surface rounded-2xl p-8 md:p-12 border border-primary/20 mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Target className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold">Our Mission</h2>
          </div>
          
          <p className="text-gray-300 text-lg mb-6">
            Bring transparency and objective analysis to the AI agent ecosystem on Virtuals Protocol.
          </p>
          
          <div className="space-y-4 text-gray-400">
            <p>
              <span className="font-semibold text-white">The Challenge:</span> Hundreds of AI agents operate on Virtuals Protocol.
              Some perform excellently. Others struggle or fail. How do you know which agents are actually working,
              delivering results, and worth your investment?
            </p>
            
            <p>
              <span className="font-semibold text-white">The Solution:</span> AgentPulse provides instant, data-driven health diagnostics
              to help you make informed decisions. We monitor performance, analyze reputation, and deliver actionable insights
              in under 30 seconds.
            </p>
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Real-Time Data</h3>
              <p className="text-sm text-gray-400">Fetch live metrics from official APIs</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">AI Analysis</h3>
              <p className="text-sm text-gray-400">Analyze 10+ metrics and patterns</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">Health Scoring</h3>
              <p className="text-sm text-gray-400">Calculate overall health and risk level</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <h3 className="font-semibold mb-2">Recommendations</h3>
              <p className="text-sm text-gray-400">Deliver actionable insights</p>
            </div>
          </div>
        </div>
        
        <div className="bg-background-surface rounded-2xl p-8 md:p-12 border border-primary/20 mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Cpu className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold">Technology</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-primary mb-3">🖥️ Infrastructure</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Dedicated VPS</li>
                <li>• 99.9% Uptime</li>
                <li>• Node.js 20 + TypeScript</li>
                <li>• PM2 Process Management</li>
                <li>• 24/7 Autonomous Operation</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-primary mb-3">🔗 Data Sources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• aGDP.io Official API</li>
                <li>• Virtuals Protocol Leaderboard</li>
                <li>• On-chain Transaction Data</li>
                <li>• Real-time Metrics</li>
                <li>• Historical Trends</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-primary mb-3">⚡ Performance</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• &lt;30s Response Time</li>
                <li>• Concurrent Processing</li>
                <li>• Auto-scaling Ready</li>
                <li>• Fault Tolerant</li>
                <li>• Zero Downtime Deploys</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="bg-background-surface rounded-2xl p-8 md:p-12 border border-primary/20">
          <h2 className="text-2xl font-bold mb-8 text-center">Roadmap</h2>
          
          <div className="space-y-6">
            {roadmap.map((phase, index) => {
              const statusColor = phase.status === 'completed' ? 'text-success' :
                                 phase.status === 'in-progress' ? 'text-primary' :
                                 'text-gray-500';
              const statusIcon = phase.status === 'completed' ? '✅' :
                                phase.status === 'in-progress' ? '🔄' :
                                '⏳';
              
              return (
                <div key={index} className="flex items-start space-x-4">
                  <div className="text-2xl">{statusIcon}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`font-semibold ${statusColor}`}>{phase.phase}</h3>
                      <span className="text-xs uppercase tracking-wider text-gray-500">
                        {phase.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {phase.items.map((item, i) => (
                        <span 
                          key={i}
                          className="px-3 py-1 bg-background rounded-full text-sm text-gray-400 border border-primary/20"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
