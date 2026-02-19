import { Coins, ArrowRight } from 'lucide-react';

export default function TokenTeaser() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="gradient-border rounded-2xl p-8 md:p-12 text-center glow-purple">
          <div className="flex justify-center mb-6">
            <Coins className="w-16 h-16 text-secondary animate-pulse-slow" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            🪙 <span className="gradient-text">$PULSE</span> Token Launching Tonight
          </h2>
          
          <p className="text-gray-300 text-lg mb-8">
            Stake $PULSE to unlock premium benefits
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-background/50 rounded-lg p-4">
              <div className="text-2xl mb-2">💰</div>
              <div className="font-semibold mb-1">20% Discount</div>
              <div className="text-sm text-gray-400">On all audits</div>
            </div>
            
            <div className="bg-background/50 rounded-lg p-4">
              <div className="text-2xl mb-2">🤝</div>
              <div className="font-semibold mb-1">Revenue Sharing</div>
              <div className="text-sm text-gray-400">50% of profits</div>
            </div>
            
            <div className="bg-background/50 rounded-lg p-4">
              <div className="text-2xl mb-2">🗳️</div>
              <div className="font-semibold mb-1">Governance</div>
              <div className="text-sm text-gray-400">Vote on features</div>
            </div>
          </div>
          
          <button className="px-8 py-4 bg-gradient-to-r from-secondary to-primary rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity inline-flex items-center space-x-2">
            <span>Join Waitlist</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
