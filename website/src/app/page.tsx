import Hero from '@/components/Hero';
import LiveDashboard from '@/components/LiveDashboard';
import WhatWeMonitor from '@/components/WhatWeMonitor';
import RecentAnalysesLive from '@/components/RecentAnalysesLive';
import WhyTrustUs from '@/components/WhyTrustUs';

export default function Home() {
  return (
    <>
      <Hero />
      <LiveDashboard />
      <WhatWeMonitor />
      <RecentAnalysesLive />
      <WhyTrustUs />
    </>
  );
}
