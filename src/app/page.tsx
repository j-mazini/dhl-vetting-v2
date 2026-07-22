'use client';

import { LandingHeader } from '@/components/LandingHeader';
import { EnhancedHeroSection } from '@/components/EnhancedHeroSection';
import { ServiceTabs } from '@/components/ServiceTabs';
import { FleetSpotlight } from '@/components/FleetSpotlight';
import { ContactForm } from '@/components/ContactForm';

export default function HomePage() {
  const serviceTabs = [
    {
      id: 'vetting',
      title: 'Driver Vetting',
      body: 'Comprehensive background checks and driver verification to ensure the highest standards of safety and reliability.',
    },
    {
      id: 'tracking',
      title: 'Fleet Tracking',
      body: 'Real-time GPS tracking and monitoring of your entire fleet for improved efficiency and safety.',
    },
    {
      id: 'compliance',
      title: 'Compliance Management',
      body: 'Automated compliance reporting and documentation to meet all regulatory requirements.',
    },
  ] as const;

  const fleetItems = [
    {
      id: 'safety',
      title: 'Safety First',
      badge: 'Premium',
      body: 'Industry-leading safety standards with comprehensive driver monitoring and real-time alerts.',
    },
    {
      id: 'efficiency',
      title: 'Operational Efficiency',
      badge: 'Advanced',
      body: 'Optimize routes and reduce costs with intelligent fleet management systems.',
    },
    {
      id: 'compliance',
      title: 'Full Compliance',
      badge: 'Certified',
      body: 'Stay compliant with all regulatory requirements and industry standards automatically.',
    },
  ] as const;

  return (
    <main>
      <LandingHeader />
      <EnhancedHeroSection />
      <ServiceTabs tabs={serviceTabs} />
      <FleetSpotlight items={fleetItems} />
      <ContactForm />
    </main>
  );
}
