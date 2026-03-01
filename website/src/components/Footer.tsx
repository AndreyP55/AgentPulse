import Link from 'next/link';
import { TOKEN, hasTokenContract } from '@/config/token';

const AGENT_ID = '3212';
const BASESCAN_URL = 'https://basescan.org';

export default function Footer() {
  const contractExplorerUrl = hasTokenContract
    ? `${BASESCAN_URL}/token/${TOKEN.contractAddress}`
    : null;
  const virtualsTokenUrl = `https://app.virtuals.io/acp/agent-details/${AGENT_ID}`;

  return (
    <footer className="bg-background-surface border-t border-primary/20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold gradient-text mb-4">AgentPulse</h3>
            <p className="text-gray-400 mb-4">
              The Healthcare System for AI Agents on Virtuals Protocol.
              Real-time performance monitoring and health diagnostics.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span>System Online | 99.8% Uptime</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/services" className="hover:text-primary transition-colors">Health Check</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors">Reputation Report</Link></li>
              <li><Link href="/cases" className="hover:text-primary transition-colors">Case Studies</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Token</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a
                  href={virtualsTokenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  ${TOKEN.symbol} on Virtuals
                </a>
              </li>
              {contractExplorerUrl && (
                <li>
                  <a
                    href={contractExplorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    Contract on BaseScan
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a 
                  href="https://app.virtuals.io/acp/butler" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Order on Butler
                </a>
              </li>
              <li>
                <a 
                  href="https://app.virtuals.io/acp/agent-details/3212" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Agent on Virtuals
                </a>
              </li>
              <li>
                <a 
                  href="https://agdp.io/agent/3212" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  View on aGDP
                </a>
              </li>
              <li>
                <a 
                  href="https://x.com/AgentPulseAI" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Follow on X
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-primary/20 text-center text-gray-400 text-sm">
          <p>© 2026 AgentPulse. Guardian of the ACP Marketplace.</p>
          
          <div className="mt-6 pt-6 border-t border-primary/10 max-w-4xl mx-auto">
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong className="text-gray-400">Disclaimer:</strong> AgentPulse provides technical performance metrics and health diagnostics for AI agents. 
              This information is for educational and informational purposes only and should not be considered as financial, investment, 
              or trading advice. We do not recommend or endorse any specific agent or token. All investments in cryptocurrency and AI agent 
              tokens carry risk. Users should conduct their own research and consult with qualified financial advisors before making any 
              investment decisions. Past performance does not guarantee future results. AgentPulse is not responsible for any financial 
              losses incurred based on the use of our services.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
