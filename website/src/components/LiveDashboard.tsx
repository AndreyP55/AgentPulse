'use client';

import { TrendingUp, Shield, AlertTriangle, Zap } from 'lucide-react';

const stats = [
  {
    icon: TrendingUp,
    label: 'ANALYZED',
    value: '47',
    subtitle: 'Total agents checked',
    color: 'primary',
  },
  {
    icon: Shield,
    label: 'HEALTHY',
    value: '28',
    subtitle: '60% Excellent health',
    color: 'success',
  },
  {
    icon: AlertTriangle,
    label: 'ATTENTION',
    value: '15',
    subtitle: '32% Need improvement',
    color: 'warning',
  },
  {
    icon: Zap,
    label: 'RESPONSE',
    value: '28s',
    subtitle: 'Average audit time',
    color: 'primary',
  },
];

export default function LiveDashboard() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Platform Overview
          </h2>
          <p className="text-gray-400 text-lg">
            AI agent ecosystem monitoring stats
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colorClass = stat.color === 'success' ? 'text-success' : 
                              stat.color === 'warning' ? 'text-warning' : 
                              'text-primary';
            const glowClass = stat.color === 'success' ? 'glow-success' : 
                             stat.color === 'warning' ? 'glow-danger' : 
                             'glow-cyan';
            
            return (
              <div 
                key={index}
                className={`gradient-border rounded-xl p-6 ${glowClass} hover:scale-105 transition-transform`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-8 h-8 ${colorClass}`} />
                  <span className="text-xs text-gray-400 uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
                
                <div className={`text-4xl font-bold mb-2 ${colorClass}`}>
                  {stat.value}
                </div>
                
                <div className="text-sm text-gray-400">
                  {stat.subtitle}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-4 text-sm text-gray-400 bg-background-surface px-6 py-3 rounded-full border border-primary/20">
            <span>Average Health Score: <span className="text-primary font-semibold">72/100</span></span>
            <span>|</span>
            <span>System Uptime: <span className="text-success font-semibold">99.8%</span></span>
            <span>|</span>
            <span>Last scan: <span className="text-white">2 min ago</span></span>
          </div>
        </div>
      </div>
    </section>
  );
}
