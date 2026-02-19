'use client';

import { ArrowRight, Activity, Copy, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { TOKEN } from '@/config/token';
import { useState } from 'react';

const TRADE_URL = 'https://app.virtuals.io/virtuals/45213';

export default function Hero() {
  const [copied, setCopied] = useState(false);
  const copyContract = () => {
    navigator.clipboard.writeText(TOKEN.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative pt-20 pb-12 px-4 overflow-hidden min-h-screen flex flex-col items-center justify-center">
      {/* Epic Background with Neural Network */}
      <div className="absolute inset-0 z-0">
        {/* Dark base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0E1A] via-[#0D1220] to-[#0A0E1A]" />
        
        {/* Animated neural network */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D9FF" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>
          
          {/* Network lines */}
          <line x1="5%" y1="15%" x2="25%" y2="35%" stroke="url(#line-grad)" strokeWidth="1.5" opacity="0.6" />
          <line x1="25%" y1="35%" x2="45%" y2="25%" stroke="url(#line-grad)" strokeWidth="1.5" opacity="0.6" />
          <line x1="45%" y1="25%" x2="65%" y2="45%" stroke="url(#line-grad)" strokeWidth="1.5" opacity="0.6" />
          <line x1="65%" y1="45%" x2="85%" y2="35%" stroke="url(#line-grad)" strokeWidth="1.5" opacity="0.6" />
          <line x1="15%" y1="55%" x2="35%" y2="75%" stroke="url(#line-grad)" strokeWidth="1.5" opacity="0.6" />
          <line x1="35%" y1="75%" x2="55%" y2="65%" stroke="url(#line-grad)" strokeWidth="1.5" opacity="0.6" />
          <line x1="55%" y1="65%" x2="75%" y2="85%" stroke="url(#line-grad)" strokeWidth="1.5" opacity="0.6" />
          
          {/* Nodes */}
          <circle cx="5%" cy="15%" r="3" fill="#00D9FF" opacity="0.8" className="animate-pulse" />
          <circle cx="25%" cy="35%" r="3" fill="#A855F7" opacity="0.8" className="animate-pulse" />
          <circle cx="45%" cy="25%" r="3" fill="#00D9FF" opacity="0.8" className="animate-pulse" />
          <circle cx="65%" cy="45%" r="3" fill="#A855F7" opacity="0.8" className="animate-pulse" />
          <circle cx="85%" cy="35%" r="3" fill="#00D9FF" opacity="0.8" className="animate-pulse" />
        </svg>
        
        {/* Scanning lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-scan-vertical" />
          <div className="absolute w-px h-full bg-gradient-to-b from-transparent via-secondary/50 to-transparent animate-scan-horizontal" style={{animationDelay: '2s'}} />
        </div>
      </div>
      
      {/* Logo and Title Above Monitor */}
      <div className="relative z-10 text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Image 
              src="/images/logo-clean.png" 
              alt="AgentPulse Logo" 
              width={120} 
              height={120}
              className="animate-pulse-slow"
            />
            <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse-slow" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          <span className="gradient-text">AgentPulse</span>
        </h1>
        <p className="text-gray-400 text-lg">Guardian of the ACP Marketplace</p>
      </div>

      {/* Token contract & trade link */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-10 text-sm">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-background-surface/80 border border-primary/20 font-mono text-gray-300">
          <span className="text-gray-500">Contract:</span>
          <span className="text-primary break-all">{TOKEN.contractAddress}</span>
          <button
            type="button"
            onClick={copyContract}
            className="shrink-0 p-1 rounded hover:bg-primary/20 text-gray-400 hover:text-primary transition-colors"
            title="Copy"
            aria-label="Copy contract"
          >
            <Copy className="w-4 h-4" />
          </button>
          {copied && <span className="text-success text-xs">Copied</span>}
        </div>
        <a
          href={TRADE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary/20 border border-primary/40 text-primary font-medium hover:bg-primary/30 transition-colors"
        >
          <span>Trade $PULSE</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      
      {/* Cardio Monitor Screen */}
      <div className="relative z-10 w-full max-w-5xl">
        <div className="relative bg-gradient-to-br from-background-surface/90 to-background/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 border-2 border-primary/30 glow-cyan">
          {/* Monitor frame effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-secondary/5" />
          
          {/* Heartbeat line across top */}
          <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden opacity-30">
            <svg className="w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
              <path
                d="M0,50 L200,50 L220,30 L240,70 L260,20 L280,80 L300,50 L1000,50"
                stroke="#00D9FF"
                strokeWidth="2"
                fill="none"
                className="animate-pulse"
              />
            </svg>
          </div>
          
          <div className="relative z-10 text-center">
            {/* Main Content */}
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                The Healthcare System for AI Agents
              </h2>
              <p className="text-lg text-primary mb-2">
                First Performance Monitoring System in Virtuals Ecosystem
              </p>
            </div>
            
            {/* Health Metrics Display */}
            <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
              <div className="bg-background/50 rounded-lg p-6 border border-primary/20 flex flex-col items-center justify-center">
                <Activity className="w-6 h-6 text-primary mb-2" />
                <div className="text-2xl font-bold text-primary">99.9%</div>
                <div className="text-xs text-gray-400">System Health</div>
              </div>
              
              <div className="bg-background/50 rounded-lg p-6 border border-success/20 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-success">47</div>
                <div className="text-xs text-gray-400">Agents Analyzed</div>
              </div>
              
              <div className="bg-background/50 rounded-lg p-6 border border-primary/20 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-primary">28s</div>
                <div className="text-xs text-gray-400">Avg Response</div>
              </div>
            </div>
            
            {/* Animated ECG Heartbeat - Smooth Fade In/Out */}
            <div className="mb-8 h-32 flex items-center justify-center relative overflow-hidden bg-gradient-to-r from-transparent via-[#001a33] to-transparent rounded-lg">
              <svg className="w-full max-w-4xl h-full" viewBox="0 0 1200 150" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="ecg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00D9FF" />
                    <stop offset="50%" stopColor="#0EA5E9" />
                    <stop offset="100%" stopColor="#00D9FF" />
                  </linearGradient>
                  <filter id="ecg-glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  
                  {/* Grid pattern */}
                  <pattern id="ecg-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(0,217,255,0.08)" strokeWidth="0.5"/>
                    <path d="M 10 0 L 10 30 M 20 0 L 20 30 M 0 10 L 30 10 M 0 20 L 30 20" fill="none" stroke="rgba(0,217,255,0.03)" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                
                {/* Grid background */}
                <rect width="1200" height="150" fill="url(#ecg-grid)"/>
                
                {/* ECG Heartbeat Path */}
                <path
                  d="M0,75 L200,75 L210,73 L220,71 L230,65 L240,50 L250,20 L260,5 L270,40 L280,70 L290,75 L300,76 L310,75 L500,75 L510,73 L520,71 L530,65 L540,50 L550,20 L560,5 L570,40 L580,70 L590,75 L600,76 L610,75 L800,75 L810,73 L820,71 L830,65 L840,50 L850,20 L860,5 L870,40 L880,70 L890,75 L900,76 L910,75 L1100,75 L1110,73 L1120,71 L1130,65 L1140,50 L1150,20 L1160,5 L1170,40 L1180,70 L1190,75 L1200,75"
                  stroke="url(#ecg-gradient)"
                  strokeWidth="3.5"
                  fill="none"
                  filter="url(#ecg-glow)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0"
                >
                  {/* Smooth fade in and out */}
                  <animate
                    attributeName="opacity"
                    values="0;0;0.3;0.6;0.9;1;1;0.9;0.6;0.3;0;0"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                  {/* Subtle movement */}
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    from="-100 0"
                    to="100 0"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </path>
              </svg>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <a
                href="https://app.virtuals.io/acp/butler"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
              >
                <span>Order Health Check</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              
              <Link
                href="/cases"
                className="px-8 py-4 border-2 border-primary rounded-lg font-semibold text-lg hover:bg-primary/10 transition-colors flex items-center justify-center"
              >
                View Reports
              </Link>
            </div>
            
            {/* Status bar */}
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-success font-medium">LIVE</span>
              </div>
              <span>•</span>
              <span>24/7 Monitoring</span>
              <span>•</span>
              <span>99.8% Uptime</span>
            </div>
          </div>
          
          {/* Corner indicators */}
          <div className="absolute top-4 left-4 text-xs text-primary/50 font-mono">SYS_ONLINE</div>
          <div className="absolute top-4 right-4 text-xs text-success/50 font-mono flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
            <span>MONITORING</span>
          </div>
          <div className="absolute bottom-4 left-4 text-xs text-gray-500 font-mono">v1.0.0</div>
          <div className="absolute bottom-4 right-4 text-xs text-gray-500 font-mono">VIRTUALS_PROTOCOL</div>
        </div>
      </div>
      
      {/* Description Below Monitor */}
      <div className="relative z-10 text-center mt-12 max-w-3xl mx-auto">
        <p className="text-gray-400 text-lg mb-2">
          Real-time health diagnostics and performance monitoring for AI agents
        </p>
        <p className="text-gray-500 text-sm italic">
          &quot;The Doctor for AI Agents in the Virtuals Ecosystem&quot;
        </p>
      </div>
    </section>
  );
}
