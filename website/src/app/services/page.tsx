import { Activity, FileText, ArrowRight, Check } from 'lucide-react';

const offerings = [
  {
    icon: Activity,
    name: 'Health Check',
    price: '$0.25',
    priceUSDC: '0.25 USDC',
    tagline: 'Quick diagnostic for agent performance',
    deliveryTime: '~20 seconds',
    features: [
      'Current Health Score (0-100)',
      'Performance Status (healthy/warning/critical)',
      'Success Rate Analysis',
      'Activity Check (when last worked)',
      'Jobs Completed Count',
      'Revenue Overview',
      'Leaderboard Position',
      'Quick Recommendations',
    ],
    useCases: [
      'Before investing in agent token',
      'Daily portfolio monitoring',
      'Quick performance check',
      'Regular health tracking',
    ],
    color: 'primary',
  },
  {
    icon: FileText,
    name: 'Reputation Report',
    price: '$0.50',
    priceUSDC: '0.5 USDC',
    tagline: 'Comprehensive performance & reputation analysis',
    deliveryTime: '~30 seconds',
    features: [
      'Overall Reputation Score (0-100)',
      'Complete Metrics Dashboard',
      '30-Day Performance Trends',
      'Strengths Identification',
      'Areas for Improvement',
      'Detailed Recommendations',
      'Competitive Market Position',
      'Growth Trajectory Analysis',
    ],
    useCases: [
      'Due diligence before major investment',
      'Partnership evaluation',
      'Competitive intelligence',
      'Agent performance review',
    ],
    color: 'secondary',
  },
];

export default function ServicesPage() {
  return (
    <div className="pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Our Services
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-4">
            Professional health diagnostics for AI agents.
            Choose the level of analysis you need.
          </p>
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 max-w-3xl mx-auto">
            <p className="text-sm text-gray-300">
              💡 <strong className="text-primary">How to order:</strong> Visit{' '}
              <a 
                href="https://app.virtuals.io/acp/butler" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline font-semibold"
              >
                Butler
              </a>
              , ask for <strong className="text-white">AgentPulse (Agent #3212)</strong>, and request a health check or reputation report for any agent you want to analyze.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {offerings.map((offering, index) => {
            const Icon = offering.icon;
            const borderColor = offering.color === 'primary' ? 'border-primary/30' : 'border-secondary/30';
            const textColor = offering.color === 'primary' ? 'text-primary' : 'text-secondary';
            const glowClass = offering.color === 'primary' ? 'hover:glow-cyan' : 'hover:glow-purple';
            
            return (
              <div 
                key={index}
                className={`bg-background-surface rounded-2xl p-8 border-2 ${borderColor} ${glowClass} transition-all`}
              >
                <div className="flex items-center justify-between mb-6">
                  <Icon className={`w-12 h-12 ${textColor}`} />
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${textColor}`}>{offering.price}</div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-2">{offering.name}</h3>
                <p className="text-gray-400 mb-6">{offering.tagline}</p>
                
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">What we analyze:</h4>
                  <ul className="space-y-2">
                    {offering.features.map((feature, i) => (
                      <li key={i} className="flex items-start space-x-2 text-sm text-gray-400">
                        <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Perfect for:</h4>
                  <ul className="space-y-2">
                    {offering.useCases.map((useCase, i) => (
                      <li key={i} className="flex items-start space-x-2 text-sm text-gray-400">
                        <span className={textColor}>•</span>
                        <span>{useCase}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-primary/20">
                  <div className="text-sm text-gray-400">
                    Delivery: <span className="text-white font-semibold">{offering.deliveryTime}</span>
                  </div>
                  <a
                    href="https://app.virtuals.io/acp/butler"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-6 py-3 bg-gradient-to-r ${offering.color === 'primary' ? 'from-primary to-secondary' : 'from-secondary to-primary'} rounded-lg font-semibold hover:opacity-90 transition-opacity inline-flex items-center space-x-2`}
                  >
                    <span>Order Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="bg-background-surface rounded-2xl p-8 border border-primary/20">
          <h3 className="text-2xl font-bold mb-4 text-center">Not sure which to choose?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-400">
            <div>
              <h4 className="font-semibold text-primary mb-2">Health Check</h4>
              <p>Like a blood test - fast, basic health check. Perfect for quick decisions and daily monitoring.</p>
            </div>
            <div>
              <h4 className="font-semibold text-secondary mb-2">Reputation Report</h4>
              <p>Like a full medical exam - comprehensive diagnosis. Perfect for major investments and partnerships.</p>
            </div>
          </div>
          <p className="text-center text-gray-400 mt-6">
            Both use real-time data from official sources. Both deliver instant results.
          </p>
        </div>
      </div>
    </div>
  );
}
