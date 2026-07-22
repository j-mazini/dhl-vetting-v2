'use client';

import { LandingHeader } from '@/components/LandingHeader';
import { EnhancedHeroSection } from '@/components/EnhancedHeroSection';
import { ServiceTabs } from '@/components/ServiceTabs';
import { FleetSpotlight } from '@/components/FleetSpotlight';
import { ContactForm } from '@/components/ContactForm';

export default function HomePage() {
  return (
    <main>
      <LandingHeader />
      <EnhancedHeroSection />
      <ServiceTabs />
      <FleetSpotlight />
      <ContactForm />
    </main>
  );
}
