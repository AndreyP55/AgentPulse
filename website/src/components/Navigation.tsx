'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Navigation() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
      <Link href="/" className="flex items-center space-x-3 group">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <Image
            src="/images/logo-clean.png"
            alt="AgentPulse"
            width={40}
            height={40}
            className="animate-pulse-slow"
          />
        </div>
        <span className="text-xl font-bold gradient-text">AgentPulse</span>
      </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/services" className="text-gray-300 hover:text-primary transition-colors">
              Services
            </Link>
            <Link href="/cases" className="text-gray-300 hover:text-primary transition-colors">
              Case Studies
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-primary transition-colors">
              About
            </Link>
            <a 
              href="https://app.virtuals.io/acp/butler" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Order Audit
            </a>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-success font-medium">LIVE</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
