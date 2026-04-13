import HeroSection from '@/components/landing/HeroSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import TopicsSection from '@/components/landing/TopicsSection';
import CtaFooter from '@/components/landing/CtaFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorksSection />
      <TopicsSection />
      <CtaFooter />
    </div>
  );
}
