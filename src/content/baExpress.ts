/**
 * Site content aligned with BA Express (London) mockups.
 */

export const siteMeta = {
  name: 'BA Express',
  legalName: 'BA Express Ltd.',
  tagline: 'Tailored journeys, delivered excellence',
  description:
    'Last-mile logistics and deliveries across Central London, Greater London and Kent.',
  url: 'https://baexpress.co.uk',
  company: {
    legalName: 'BA Express Ltd',
    registration: '08771410',
    jurisdiction: 'England & Wales',
    location: 'London, United Kingdom',
  },
  contact: {
    email: 'info@baexpress.co.uk',
  },
} as const;

export const hero = {
  title: 'BA EXPRESS',
  subtitle: 'TAILORED JOURNEYS,\nDELIVERED EXCELLENCE',
} as const;

export const about = {
  label: 'About',
  heading: 'Transport & logistics',
  paragraphs: [
    'At BA Express, we are more than just a logistics company. Our core focus is on bridging the last-mile delivery gap for major international and domestic logistics carriers who demand tailor-made services.',
    'With a commitment to ensuring safety and compliance, every driver in our team is rigorously vetted to meet the Civil Aviation Authority standards and trained in the transport of Dangerous Goods.',
    'But what truly sets us apart is our dedication to nurturing exceptional and professional relationships with our customers. We pride ourselves on flexibility, understanding that every delivery, like every client, is unique.',
  ],
} as const;

export const whyChoose = {
  label: 'Why choose us',
  heading: 'Precision across every mile',
  paragraphs: [
    'We combine international-carrier standards with London street-level agility—so your first and last miles stay seamless.',
    'From electric cargo bikes in Central London to a modern van fleet across Greater London and Kent, we scale to your volume without compromising compliance or care.',
  ],
} as const;

export const services = {
  label: 'Services',
  heading: 'Precise and hard working',
  paragraphs: [
    "In the world of logistics, we recognise that international enterprises demand bespoke solutions tailored to their distinct needs. Every stretch of the journey, from start to finish, is crucial, and at BA Express, we're adept at ensuring the first and last legs are managed with utmost precision and attention to detail.",
    "Our forte is in shaping our services to meet the intricate demands of global companies. In today's fast-paced environment, flexibility is key. By outsourcing with BA Express, businesses can bolster their productivity, safe in the knowledge that their logistical requirements are being addressed with the highest standard of customisation and efficiency.",
    "But our services go beyond mere operational excellence. Central to BA Express is our dedication to nurturing and sustaining deep, professional relationships with our partners. Opting for BA Express isn't just about dependable deliveries; it's about entering a partnership grounded in trust, adaptability, and a shared ambition for top-tier service.",
  ],
} as const;

export const stats = {
  items: [
    { value: '45,000+', label: 'Deliveries every month', highlight: false },
    { value: '32', label: 'Vans', highlight: false },
    { value: '12', label: 'Cargo bikes', highlight: true },
    { value: '9', label: 'Motor bikes', highlight: false },
  ],
} as const;

/** Interactive tabs (Services section) */
export const serviceTabs = [
  {
    id: 'bespoke',
    title: 'Bespoke solutions',
    body:
      'We tailor last-mile operations to the standards of international carriers—compliance, safety, and consistency on every delivery.',
  },
  {
    id: 'scale',
    title: 'Scale & flexibility',
    body:
      'From electric cargo bikes in Central London to a modern van fleet across Greater London and Kent—we scale to your volumes.',
  },
  {
    id: 'partners',
    title: 'Partnership first',
    body:
      'Long-term relationships with partners: reliability, transparency, and a team that understands your logistics.',
  },
] as const;

/** Clickable fleet highlights (side panel) */
export const fleetSpotlight = [
  {
    id: 'electric',
    title: 'Electric vans',
    badge: '9 × 100% electric',
    body:
      'Zero-emission capable vehicles for cleaner deliveries and compliant urban operations.',
  },
  {
    id: 'bikes',
    title: 'Cargo bikes',
    badge: '12 e-cargo bikes',
    body:
      'Fast last mile in dense traffic and low-emission zones across Central London.',
  },
  {
    id: 'vans',
    title: 'Modern vans',
    badge: '32 vans total',
    body:
      'Capacity and compliance for B2B volumes and scheduled linehaul hand-offs.',
  },
] as const;

export const fleet = {
  label: 'Our fleet',
  paragraphs: [
    'At BA Express, our commitment to eco-friendly logistics is evident in our diverse and modern fleet. Comprising of 32 advanced vans, 9 of them proudly stand as 100% electric, championing our mission for cleaner deliveries.',
    'Complementing our van line-up are our 12 electric cargo bikes, purposefully chosen to further diminish our carbon footprint. These bikes not only allow us to navigate the bustling streets of Central London more efficiently, but they also symbolize our relentless pursuit of a carbon-free delivery system.',
    "Our operations radiate out from the heart of Central London, spanning the breadth of Greater London, and extending into the beautiful landscapes of Kent. With BA Express, you're not just choosing a delivery service; you're opting for a sustainable future.",
  ],
} as const;

export const coverage = {
  label: 'Area we serve',
  heading: 'Recently updated',
  body:
    "Our operations radiate out from the heart of Central London, spanning the breadth of Greater London, and extending into the beautiful landscapes of Kent. With BA Express, you're not just choosing a delivery service; you're opting for a sustainable future.",
  bodyMore:
    'We coordinate hand-offs from regional hubs and support scheduled windows for B2B clients across Greater London and into Kent.',
  mapQuery: 'London Eye, London, United Kingdom',
  loadMoreLabel: 'Show more',
  loadLessLabel: 'Show less',
} as const;

export const contactBanner = {
  heading: 'Contact',
  body:
    "Reach out to us today – we're here to help and eager to establish a service partner relationship with you",
} as const;

export const contactInfo = {
  label: 'Contact info',
  sub: 'Find us here',
  email: 'info@baexpress.co.uk',
  address: '20 The Laurels DA3 7HH',
  instagram: 'baexpress.uk',
  instagramUrl: 'https://www.instagram.com/baexpress.uk',
} as const;

export const contactForm = {
  eyebrow: 'Get in touch',
  title: 'Send a message',
  subtitle: 'Tell us what you need — we usually reply within one business day.',
  nameLabel: 'Name',
  emailLabel: 'Email',
  messageLabel: 'Message',
  namePlaceholder: 'Your name',
  emailPlaceholder: 'you@company.com',
  messagePlaceholder: 'How can we help with deliveries in London?',
  submit: 'Send',
  sending: 'Sending...',
  success: 'Thank you — we will get back to you soon.',
  error: 'We could not send your message. Please check the details and try again.',
} as const;

export type ContactFormCopy = typeof contactForm;

export const customers = {
  label: 'Our customers',
  heading: 'Partners we are proud to serve',
  paragraphs: [
    'At BA Express, our customer base is the lifeblood of our operation and serves as a testament to our commitment to excellence in logistics. Among our esteemed clientele, we are proud to highlight our robust partnership with DHL Express. As a trusted service provider for this global leader in express logistics, we uphold the highest standards of delivery, reliability, and customer care. Our collaboration with DHL Express not only showcases our capability to serve international giants but also reinforces our dedication to ensuring seamless and efficient logistic solutions for all our partners.',
    "We're always eager to expand our horizons and welcome new partnerships. So, whether you're a multinational corporation or a local enterprise, BA Express is here to cater to your logistical needs with unmatched precision and dedication.",
  ],
} as const;

export const footer = {
  useful: [
    { label: 'About Us', href: '#about' },
    { label: 'Professional Cleaner', href: '#' },
    { label: 'Price Comparing', href: '#' },
  ],
  helpful: [
    { label: 'Contact Info', href: '#contact' },
    { label: 'Terms & Conditions', href: '#' },
  ],
} as const;

export function getSitePayload() {
  return {
    meta: siteMeta,
    images: {
      gemini: '/assets/gemini-hero.png',
      van: '/assets/van-1.jpeg',
      bike: '/assets/bike.jpeg',
      dhl: '/assets/dhl-logo.png',
    },
    hero,
    about,
    whyChoose,
    services,
    serviceTabs,
    stats,
    fleet,
    fleetSpotlight,
    coverage,
    contactBanner,
    contactInfo,
    contactForm,
    customers,
    footer,
    updatedAt: new Date().toISOString(),
  };
}
