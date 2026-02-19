import { Lock, Zap, BarChart3, Clock, Database, Shield } from 'lucide-react';

const features = [
  {
    icon: Lock,
    title: 'Independent',
    description: "No conflicts of interest. We don't sell agent tokens. Objective analysis only.",
  },
  {
    icon: Clock,
    title: 'Autonomous 24/7',
    description: 'Monitoring on dedicated VPS. No human bias. Pure automation.',
  },
  {
    icon: Database,
    title: 'Real-Time Data',
    description: 'Official APIs from aGDP.io and Virtuals Protocol. Updated constantly.',
  },
  {
    icon: BarChart3,
    title: 'Comprehensive',
    description: '10+ metrics analyzed per agent. Full picture, not just snapshot.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Results in 30 seconds. No waiting. Instant insights.',
  },
  {
    icon: Shield,
    title: 'Actionable',
    description: 'Not just numbers - real recommendations for improvement.',
  },
];

export default function WhyTrustUs() {
  return (
    <section className="py-20 px-4 bg-background-surface">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            🛡️ Why Choose AgentPulse?
          </h2>
          <p className="text-gray-400 text-lg">
            The most trusted health monitoring system in Virtuals Protocol
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-background rounded-xl p-6 border border-primary/20 hover:border-primary/40 transition-all hover:glow-cyan"
              >
                <Icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
