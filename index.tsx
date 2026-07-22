'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import {
    MapPin,
    Mail,
    Share2,
    Package,
    Truck,
    Clock,
    ExternalLink,
    ClipboardCheck,
} from 'lucide-react';

// Componentes do projeto
import { LandingHeader } from '@/components/LandingHeader';
import { GlassPanel } from '@/components/GlassPanel';
import { ServiceTabs } from '@/components/ServiceTabs';
import { AnimatedStatValue } from '@/components/AnimatedStatValue';
import { FleetSpotlight } from '@/components/FleetSpotlight';
import { CopyField } from '@/components/CopyField';
import { CountUpStat } from '@/components/CountUpStat';
import { useAuth } from '@/context/AuthContext';

// Conteúdo e Assets
import * as C from '@/content/baExpress';
import { images as siteImages } from '@/content/images';
import styles from '@/app/page.module.css';

// Importações Dinâmicas (Otimização)
const ScrollRail = dynamic(
    () => import('@/components/ScrollRail').then((m) => ({ default: m.ScrollRail })),
    { ssr: false },
);

// Contexto para animações de scroll
const ScrollRevealUnlockedContext = createContext(false);

function ScrollRevealGate({ children }: { children: React.ReactNode }) {
    const [unlocked, setUnlocked] = useState(false);
    useEffect(() => {
        const unlock = () => setUnlocked(true);
        window.addEventListener('scroll', unlock, { passive: true });
        window.addEventListener('wheel', unlock, { passive: true });
        window.addEventListener('touchmove', unlock, { passive: true });
        return () => {
            window.removeEventListener('scroll', unlock);
            window.removeEventListener('wheel', unlock);
            window.removeEventListener('touchmove', unlock);
        };
    }, []);
    return (
        <ScrollRevealUnlockedContext.Provider value={unlocked}>
            {children}
        </ScrollRevealUnlockedContext.Provider>
    );
}

function isElementInViewport(el: HTMLElement) {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    return r.top < vh * 0.94 && r.bottom > vh * 0.06;
}

function usePrefersReducedMotion() {
    const [reduce, setReduce] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReduce(mq.matches);
        const onChange = () => setReduce(mq.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);
    return reduce;
}

function SectionMotion({
    children,
    className,
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const scrollUnlocked = useContext(ScrollRevealUnlockedContext);
    const reduce = usePrefersReducedMotion();
    const [visible, setVisible] = useState(reduce);
    const unlockedRef = useRef(scrollUnlocked);
    unlockedRef.current = scrollUnlocked;

    useEffect(() => {
        if (!scrollUnlocked || reduce) return;
        const el = ref.current;
        if (!el) return;
        if (isElementInViewport(el)) setVisible((v) => v || true);
    }, [scrollUnlocked, reduce]);

    useEffect(() => {
        if (reduce) return;
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting && unlockedRef.current) {
                        setVisible((v) => v || true);
                        break;
                    }
                }
            },
            {
                threshold: [0, 0.05, 0.12],
                rootMargin: '0px 0px 200px 0px',
            },
        );
        io.observe(el);
        return () => io.disconnect();
    }, [reduce]);

    useEffect(() => {
        if (reduce) return;
        let resizeTimer = 0;
        const onResize = () => {
            if (!unlockedRef.current) return;
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(() => {
                const el = ref.current;
                if (!el || !isElementInViewport(el)) return;
                setVisible((v) => v || true);
            }, 120);
        };
        window.addEventListener('resize', onResize);
        return () => {
            window.clearTimeout(resizeTimer);
            window.removeEventListener('resize', onResize);
        };
    }, [reduce]);

    const revealCls = [
        className,
        styles.sectionReveal,
        reduce || visible ? styles.sectionRevealVisible : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div
            ref={ref}
            className={revealCls}
            style={
                reduce || !visible
                    ? undefined
                    : { transitionDelay: `${delay}s` }
            }
        >
            {children}
        </div>
    );
}

const mapEmbed = (q: string) =>
    `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=m&z=11&output=embed&iwloc=near`;

const SCROLL_OFFSET = 84;

export default function BAExpressLanding() {
    const { user, isAuthenticated, hasCandidateRecord, recordLoading } = useAuth();
    const [coverageExpanded, setCoverageExpanded] = useState(false);
    const showApplication =
        !isAuthenticated ||
        (!recordLoading && !user?.isAdmin && hasCandidateRecord === false);

    const scrollTo = useCallback((id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        const top =
            el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }, []);

    return (
        <ScrollRevealGate>
            <div className={styles.pageRoot}>
                <LandingHeader />
                <ScrollRail />

                <div className="glow-container">
                    <div className="glow-ball glow-1" />
                    <div className="glow-ball glow-2" />
                </div>

                <section id="home" className={`${styles.snapSection} ${styles.heroSection} overflow-hidden`}>
                    <div className="container">
                        <div className={styles.heroGrid}>
                            <div className={styles.heroTextBlock}>
                                <h1 className={styles.heroTitle}>{C.hero.title}</h1>
                                <h2 className={styles.heroSubtitle}>{C.hero.subtitle}</h2>
                                <div className={styles.heroRule} aria-hidden />
                                <p className="text-sm text-text-secondary max-w-xl">
                                    {C.siteMeta.description}
                                </p>
                                <div className={styles.heroChips} role="group" aria-label="Page shortcuts">
                                    <button type="button" className={`${styles.heroChip}`} onClick={() => scrollTo('services')}>Services</button>
                                    <button type="button" className={`${styles.heroChip}`} onClick={() => scrollTo('stats')}>Impact</button>
                                    {showApplication && <a href="/vetting/register" className={`${styles.heroChip}`}>Apply</a>}
                                </div>
                            </div>

                            <div className={styles.heroMediaCol}>
                                <div className={`${styles.heroImageWrap} w-full aspect-[4/3]`}>
                                    <Image
                                        src={siteImages.gemini}
                                        alt="BA Express — deliveries in London"
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                                <div className={styles.heroGlow} />
                            </div>
                        </div>
                    </div>
                </section>

                <section id="about" className={`${styles.snapSection} ${styles.snapSectionTall}`}>
                    <div className="container">
                        <div className={styles.twoCol}>
                            <SectionMotion>
                                <div className={`${styles.imageCard} relative aspect-square`}>
                                    <Image
                                        src={siteImages.bike}
                                        alt="BA Express cargo bike in London"
                                        fill
                                        sizes="(max-width: 768px) 100vw, 45vw"
                                        className="object-cover"
                                    />
                                </div>
                            </SectionMotion>
                            <SectionMotion delay={0.06}>
                                <GlassPanel>
                                    <p className={styles.sectionLabel}>{C.about.label}</p>
                                    <h2 className={styles.sectionHeading}>{C.about.heading}</h2>
                                    <div className={styles.rule} />
                                    <div className={styles.body}>
                                        {C.about.paragraphs.map((p, i) => (
                                            <p key={i}>{p}</p>
                                        ))}
                                    </div>
                                </GlassPanel>
                            </SectionMotion>
                        </div>
                    </div>
                </section>

                <section id="why" className={`${styles.snapSection} ${styles.snapSectionTall}`}>
                    <div className="container">
                        <div className={styles.twoColReverse}>
                            <SectionMotion>
                                <GlassPanel>
                                    <p className={styles.sectionLabel}>{C.whyChoose.label}</p>
                                    <h2 className={styles.sectionHeading}>{C.whyChoose.heading}</h2>
                                    <div className={styles.rule} />
                                    <div className={styles.body}>
                                        {C.whyChoose.paragraphs.map((p, i) => (
                                            <p key={i}>{p}</p>
                                        ))}
                                    </div>
                                </GlassPanel>
                            </SectionMotion>
                            <SectionMotion delay={0.06}>
                                <div className={`${styles.imageCard} relative aspect-[4/5]`}>
                                    <Image
                                        src={siteImages.van}
                                        alt="BA Express fleet in operation"
                                        fill
                                        sizes="(max-width: 768px) 100vw, 45vw"
                                        className="object-cover"
                                    />
                                </div>
                            </SectionMotion>
                        </div>
                    </div>
                </section>

                <section id="services" className={`${styles.snapSection} ${styles.snapSectionTall}`}>
                    <div className="container">
                        <SectionMotion>
                            <div className={styles.servicesLayout}>
                                <header className={styles.servicesHead}>
                                    <p className={styles.sectionLabel}>{C.services.label}</p>
                                    <h2 className={styles.sectionHeading}>{C.services.heading}</h2>
                                    <div className={styles.rule} />
                                </header>

                                <div className={styles.servicesIconStrip}>
                                    <div className={styles.servicesIconCard}>
                                        <div className={styles.servicesIconCardIcon}>
                                            <Package size={26} strokeWidth={1.35} className="text-primary" />
                                        </div>
                                        <h3 className={styles.iconPanelTitle}>Last mile</h3>
                                        <p className={styles.iconPanelText}>End-to-end deliveries with tracking and SLAs aligned to your volume.</p>
                                    </div>
                                    <div className={styles.servicesIconCard}>
                                        <div className={styles.servicesIconCardIcon}>
                                            <Truck size={26} strokeWidth={1.35} className="text-primary" />
                                        </div>
                                        <h3 className={styles.iconPanelTitle}>Mixed fleet</h3>
                                        <p className={styles.iconPanelText}>Vans and cargo bikes for urban areas and Greater London.</p>
                                    </div>
                                    <div className={styles.servicesIconCard}>
                                        <div className={styles.servicesIconCardIcon}>
                                            <Clock size={26} strokeWidth={1.35} className="text-primary" />
                                        </div>
                                        <h3 className={styles.iconPanelTitle}>Flexible windows</h3>
                                        <p className={styles.iconPanelText}>Operations adapted to peaks and business hours.</p>
                                    </div>
                                </div>

                                <div className={styles.servicesSplit}>
                                    <GlassPanel>
                                        <div className={styles.body}>
                                            {C.services.paragraphs.map((p, i) => (
                                                <p key={i}>{p}</p>
                                            ))}
                                        </div>
                                    </GlassPanel>
                                    <GlassPanel className={`${styles.servicesTabsPanel} h-full`}>
                                        <ServiceTabs
                                            tabs={C.serviceTabs}
                                            className={styles.serviceTabsFlush}
                                        />
                                    </GlassPanel>
                                </div>
                            </div>
                        </SectionMotion>
                    </div>
                </section>

                <section id="stats" className={`${styles.snapSection} ${styles.snapSectionTall}`}>
                    <div className="container">
                        <SectionMotion>
                            <div className={styles.statsGrid}>
                                <CountUpStat value={45000} label="Deliveries every month" suffix="+" />
                                <CountUpStat value={32} label="Vans" />
                                <CountUpStat value={12} label="Cargo bikes" />
                                <CountUpStat value={9} label="Motor bikes" />
                            </div>
                        </SectionMotion>
                    </div>
                </section>

                <section id="fleet" className={`${styles.snapSection} ${styles.snapSectionTall}`}>
                    <div className="container">
                        <div className={styles.twoCol}>
                            <SectionMotion>
                                <GlassPanel>
                                    <p className={styles.sectionLabel}>{C.fleet.label}</p>
                                    <div className={styles.rule} />
                                    <div className={styles.body}>
                                        {C.fleet.paragraphs.map((p, i) => (
                                            <p key={i}>{p}</p>
                                        ))}
                                    </div>
                                </GlassPanel>
                            </SectionMotion>
                            <SectionMotion delay={0.06}>
                                <div className={`${styles.fleetSpotlightWrap} aspect-square`}>
                                    <FleetSpotlight items={C.fleetSpotlight} />
                                </div>
                            </SectionMotion>
                        </div>
                    </div>
                </section>

                <section id="area" className={`${styles.snapSection} ${styles.snapSectionTall}`}>
                    <div className="container">
                        <div className={styles.twoCol}>
                            <SectionMotion>
                                <GlassPanel className="p-2 h-full min-h-[240px]">
                                    <div className="relative w-full h-full min-h-[220px] rounded-2xl overflow-hidden border border-black/5 shadow-lg">
                                        <iframe
                                            className={styles.mapFrame}
                                            src={mapEmbed(C.coverage.mapQuery)}
                                            title={`Map: ${C.coverage.mapQuery}`}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            allowFullScreen
                                        />
                                    </div>
                                </GlassPanel>
                            </SectionMotion>
                            <SectionMotion delay={0.05}>
                                <GlassPanel>
                                    <p className={styles.sectionLabel}>{C.coverage.label}</p>
                                    <h2 className={styles.sectionHeading}>{C.coverage.heading}</h2>
                                    <div className={styles.rule} />
                                    <p className={`${styles.body} mb-5`}>{C.coverage.body}</p>
                                    {coverageExpanded ? (
                                        <p className={`${styles.body} mb-5`}>{C.coverage.bodyMore}</p>
                                    ) : null}
                                    <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-start">
                                        <button
                                            type="button"
                                            className="btn-primary"
                                            onClick={() => setCoverageExpanded((v) => !v)}
                                            aria-expanded={coverageExpanded}
                                        >
                                            {coverageExpanded ? C.coverage.loadLessLabel : C.coverage.loadMoreLabel}
                                        </button>
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(C.coverage.mapQuery)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-outline inline-flex items-center gap-2 !bg-white !text-text-primary border border-black/10"
                                        >
                                            <ExternalLink size={14} />
                                            Google Maps
                                        </a>
                                    </div>
                                </GlassPanel>
                            </SectionMotion>
                        </div>
                    </div>
                </section>

                <section id="contact-banner" className={styles.contactWave}>
                    <div className={styles.contactWaveTop} aria-hidden />
                    <div className={styles.contactWaveShape} aria-hidden />
                    <SectionMotion className={styles.contactWaveInner}>
                        <h2 className={styles.contactWaveTitle}>{C.contactBanner.heading}</h2>
                        <p className={styles.contactWaveBody}>{C.contactBanner.body}</p>
                    </SectionMotion>
                </section>

                {showApplication && <section id="contact" className={`${styles.snapSection} ${styles.snapSectionTall} ${styles.contactSection}`}>
                    <div className="container">
                        <div className={styles.contactContainer}>
                            <SectionMotion>
                                <GlassPanel elevated className={styles.unifiedContactPanel}>
                                    <div className={styles.unifiedContactLayout}>
                                        <div className={styles.unifiedContactInfo}>
                                            <div className={styles.unifiedContactHeader}>
                                                <div className={styles.unifiedContactIcon}>
                                                    <ClipboardCheck size={24} strokeWidth={2} />
                                                </div>
                                                <div>
                                                    <p className={styles.sectionLabelSmall}>Driver application</p>
                                                    <h2 className={styles.sectionHeadingSmall}>Apply to join BA Express</h2>
                                                </div>
                                            </div>

                                            <div className={styles.applyCopy}>
                                                <p>
                                                    Start your vetting record online. Choose the category you are applying for,
                                                    add your details and our recruitment team will review your application.
                                                </p>
                                            </div>

                                            <div className={styles.miniContactStack}>
                                                <div className={styles.miniContactItem}>
                                                    <Mail size={16} className="text-primary" />
                                                    <div className="flex items-center gap-2">
                                                        <a href={`mailto:${C.contactInfo.email}`} className={styles.contactLink}>{C.contactInfo.email}</a>
                                                        <CopyField value={C.contactInfo.email} label="Copy email" />
                                                    </div>
                                                </div>
                                                <div className={styles.miniContactItem}>
                                                    <MapPin size={16} className="text-primary" />
                                                    <span>{C.contactInfo.address}</span>
                                                </div>
                                                <div className={styles.miniContactItem}>
                                                    <Share2 size={16} className="text-primary" />
                                                    <a href={C.contactInfo.instagramUrl} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                                                        {C.contactInfo.instagram}
                                                    </a>
                                                </div>
                                            </div>

                                            <div className={styles.contactSupportNote}>
                                                <p>Applications are reviewed by the BA Express vetting team</p>
                                            </div>
                                        </div>

                                        <div className={styles.unifiedContactForm}>
                                            <div className={styles.applyPanel}>
                                                <p className={styles.applyPanelKicker}>Open application</p>
                                                <h3 className={styles.applyPanelTitle}>Become a driver partner</h3>
                                                <p className={styles.applyPanelBody}>
                                                    Complete the registration form for Van Courier, Motorbike Courier or
                                                    Bicycle Courier. Your submission creates a candidate record in the
                                                    vetting system.
                                                </p>
                                                <div className="flex flex-col gap-2">
                                                    <Link href="/login" className={styles.applyPanelButton}>
                                                        Login to portal
                                                    </Link>
                                                    <Link href="/vetting/register" className={styles.applyPanelButton}>
                                                        Apply now
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </GlassPanel>
                            </SectionMotion>
                        </div>
                    </div>
                </section>}

                <section id="customers" className={`${styles.snapSection} ${styles.snapSectionTall} ${styles.customersSection}`}>
                    <div className="container">
                        <SectionMotion>
                            <GlassPanel elevated>
                                <p className={styles.sectionLabel}>{C.customers.label}</p>
                                <h2 className={styles.sectionTitle}>{C.customers.heading}</h2>
                                <div className={styles.rule} />
                                <div className={styles.body}>
                                    {C.customers.paragraphs.map((p, i) => (
                                        <p key={i}>{p}</p>
                                    ))}
                                </div>
                                <div className="text-center">
                                    <div className={styles.dhlCard}>
                                        <Image
                                            src={siteImages.dhl}
                                            alt="DHL Express"
                                            width={520}
                                            height={140}
                                            className={styles.dhlLogoImg}
                                            sizes="(max-width: 768px) min(100vw - 3rem, 480px), 520px"
                                        />
                                    </div>
                                </div>
                            </GlassPanel>
                        </SectionMotion>
                    </div>
                </section>

                <footer className={`${styles.footerBlock} border-t border-white/10`}>
                    <div className="container">
                        <SectionMotion className={styles.footerGrid}>
                            <div className={styles.footerCol}>
                                <h3>Connect</h3>
                                <div className={styles.footerIconRow}>
                                    <Mail size={16} className="text-primary shrink-0" />
                                    <a href={`mailto:${C.contactInfo.email}`}>{C.contactInfo.email}</a>
                                </div>
                                <div className={styles.footerIconRow}>
                                    <MapPin size={16} className="text-primary shrink-0" />
                                    <p>{C.contactInfo.address}</p>
                                </div>
                                <div className={styles.footerIconRow}>
                                    <Share2 size={16} className="text-primary shrink-0" />
                                    <a href={C.contactInfo.instagramUrl} target="_blank" rel="noopener noreferrer">
                                        {C.contactInfo.instagram}
                                    </a>
                                </div>
                            </div>
                            <div className={styles.footerCol}>
                                <h3>Useful links</h3>
                                {C.footer.useful.map((l) => (
                                    <a key={l.label} href={l.href}>{l.label}</a>
                                ))}
                            </div>
                            <div className={styles.footerCol}>
                                <h3>Helpful links</h3>
                                {C.footer.helpful.map((l) => (
                                    <a key={l.label} href={l.href}>{l.label}</a>
                                ))}
                            </div>
                        </SectionMotion>
                        <SectionMotion delay={0.08}>
                            <p className="text-center text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-8 pt-6 border-t border-white/10">
                                © {new Date().getFullYear()} {C.siteMeta.company.legalName}. Registered in{' '}
                                {C.siteMeta.company.jurisdiction}: {C.siteMeta.company.registration}.{' '}
                                {C.siteMeta.company.location}.
                            </p>
                        </SectionMotion>
                    </div>
                </footer>
            </div>
        </ScrollRevealGate>
    );
}
