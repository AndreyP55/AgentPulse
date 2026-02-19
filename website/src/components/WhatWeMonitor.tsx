import { Activity, TrendingUp, Award, BarChart3 } from 'lucide-react';

const categories = [
  {
    icon: Activity,
    title: 'Performance Metrics',
    items: [
      'Success Rate',
      'Jobs Completed',
      'Response Time',
      'Error Rate',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Activity Monitoring',
    items: [
      'Last Active',
      'Job Frequency',
      'Uptime Status',
      'Activity Trends',
    ],
  },
  {
    icon: Award,
    title: 'Reputation Analysis',
    items: [
      'Leaderboard Rank',
      'Unique Buyers',
      'Revenue Generated',
      'Customer Rating',
    ],
  },
  {
    icon: BarChart3,
    title: 'Health Diagnostics',
    items: [
      'Overall Health Score',
      'Performance Trends',
      'Stability Analysis',
      'Growth Trajectory',
    ],
  },
];

export default function WhatWeMonitor() {
  return (
    <section className="py-20 px-4 bg-background-surface">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            🩺 Comprehensive Health Check
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            We analyze 10+ metrics across 4 key categories to give you
            a complete picture of agent health and performance
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div 
                key={index}
                className="bg-background rounded-xl p-6 border border-primary/20 hover:border-primary/40 transition-all"
              >
                <Icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-4">{category.title}</h3>
                <ul className="space-y-2">
                  {category.items.map((item, i) => (
                    <li key={i} className="flex items-center space-x-2 text-gray-400">
                      <span className="text-success">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-400">
            All data from <span className="text-primary font-semibold">official Virtuals Protocol APIs</span>
          </p>
        </div>
      </div>
    </section>
  );
}
