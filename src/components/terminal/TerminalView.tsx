'use client';

import { useEffect } from 'react';
import Link from 'next/link';

const TICKER_ITEMS = [
  'BA EXPRESS · TAILORED JOURNEYS, DELIVERED EXCELLENCE',
  'LAST-MILE LOGISTICS AND DELIVERIES',
  'CENTRAL LONDON · GREATER LONDON · KENT',
  'SERVICES · PRECISE AND HARD WORKING',
  'OUR FLEET · PRECISION ACROSS LONDON',
  'CONTACT · INFO@BAEXPRESS.CO.UK',
];
const TICKER_STRIP = TICKER_ITEMS.map((t) => `<span style="margin:0 30px">${t}</span>·`).join('');

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·/+&:,.—';

/**
 * Split-flap character cells + reveal-on-scroll + fleet/coverage row hover
 * remarks. Ported from the approved "Terminal" artifact; operates on the
 * real DOM (as the original vanilla build did) rather than React state,
 * since the flap animation is a one-shot imperative effect per element.
 */
export function TerminalView() {
  useEffect(() => {
    document.body.dataset.view = 'home';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function buildCells(el: Element, text: string) {
      el.textContent = '';
      el.setAttribute('role', 'text');
      el.setAttribute('aria-label', text);
      const cells: { el: HTMLSpanElement; target: string }[] = [];
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const s = document.createElement('span');
        s.className = 'cell' + (ch === ' ' ? ' blank' : '');
        s.setAttribute('aria-hidden', 'true');
        s.textContent = ' ';
        el.appendChild(s);
        cells.push({ el: s, target: ch });
      }
      return cells;
    }

    function flap(el: Element) {
      const node = el as HTMLElement;
      if (node.dataset.done) return;
      node.dataset.done = '1';
      const text = node.getAttribute('data-flap') || '';
      const cells = buildCells(node, text);
      cells.forEach((c, i) => {
        if (c.target === ' ') return;
        if (reduced) {
          c.el.textContent = c.target;
          return;
        }
        const flips = 4 + Math.floor(Math.random() * 7);
        let n = 0;
        setTimeout(function cycle() {
          if (n++ < flips) {
            c.el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
            c.el.classList.add('spin');
            setTimeout(cycle, 45 + Math.random() * 30);
          } else {
            c.el.textContent = c.target;
            c.el.classList.remove('spin');
          }
        }, i * 42 + Math.random() * 90);
      });
    }

    function flapInto(el: Element, text: string) {
      if (reduced) {
        el.textContent = text;
        return;
      }
      const cells = buildCells(el, text);
      cells.forEach((c, i) => {
        if (c.target === ' ') return;
        let n = 0;
        const flips = 2 + Math.floor(Math.random() * 3);
        setTimeout(function cycle() {
          if (n++ < flips) {
            c.el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
            setTimeout(cycle, 40);
          } else {
            c.el.textContent = c.target;
          }
        }, i * 18);
      });
    }

    const chapters = Array.from(document.querySelectorAll('#view-home .chapter'));
    const railLinks = Array.from(document.querySelectorAll('#rail a'));
    const ioHome = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.querySelectorAll('[data-flap]').forEach(flap);
          e.target.querySelectorAll('.reveal').forEach((r) => r.classList.add('in'));
          const idx = chapters.indexOf(e.target);
          railLinks.forEach((l, i) => l.classList.toggle('on', i === idx));
        });
      },
      { threshold: 0.35 },
    );
    chapters.forEach((c) => ioHome.observe(c));

    const rowCleanups: (() => void)[] = [];
    document.querySelectorAll('.board-row[data-remark]').forEach((row) => {
      const line = row.querySelector('.col-dest .board-line');
      if (!line) return;
      const baseText = line.getAttribute('data-flap') || '';
      let hot = false;
      const toRemark = () => {
        if (hot || !(line as HTMLElement).dataset.done) return;
        hot = true;
        flapInto(line, row.getAttribute('data-remark') || '');
      };
      const toBase = () => {
        if (!hot) return;
        hot = false;
        flapInto(line, baseText);
      };
      row.addEventListener('mouseenter', toRemark);
      row.addEventListener('mouseleave', toBase);
      row.addEventListener('focus', toRemark);
      row.addEventListener('blur', toBase);
      rowCleanups.push(() => {
        row.removeEventListener('mouseenter', toRemark);
        row.removeEventListener('mouseleave', toBase);
        row.removeEventListener('focus', toRemark);
        row.removeEventListener('blur', toBase);
      });
    });

    return () => {
      delete document.body.dataset.view;
      ioHome.disconnect();
      rowCleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <>
      <div className="ambient" aria-hidden="true" />

      <nav id="rail" aria-label="Chapters">
        <a href="#arrivals" aria-label="Home" />
        <a href="#manifest" aria-label="About" />
        <a href="#whyus" aria-label="Why choose us" />
        <a href="#fleet" aria-label="Fleet" />
        <a href="#standards" aria-label="Services" />
        <a href="#partners" aria-label="Customers" />
        <a href="#coverage" aria-label="Area we serve" />
        <a href="#boarding" aria-label="Contact" />
      </nav>

      <div id="view-home">
        <section className="chapter" id="arrivals">
          <p className="kicker">
            <span className="idx">01</span>Home · BA Express
          </p>
          <div className="flap-xl">
            <div className="board-line" data-flap="BA EXPRESS" />
            <div className="board-line" data-flap="TAILORED JOURNEYS," />
            <div className="board-line accent-line" data-flap="DELIVERED EXCELLENCE" />
          </div>
          <div className="hero-sub flap-md">
            <div
              className="board-line"
              data-flap="LAST-MILE LOGISTICS · CENTRAL LONDON · GREATER LONDON · KENT"
            />
          </div>
          <p className="blurb reveal" style={{ marginTop: 26 }}>
            Last-mile logistics and deliveries across Central London, Greater London and Kent.
          </p>
          <span className="scroll-cue">
            SCROLL · NEXT BOARD <span className="arrow">↓</span>
          </span>
        </section>

        <section className="chapter" id="manifest">
          <p className="kicker">
            <span className="idx">02</span>About
          </p>
          <div className="flap-lg">
            <div className="board-line" data-flap="TRANSPORT & LOGISTICS" />
          </div>
          <div className="counters reveal">
            <div className="counter">
              <div className="board-line flap-lg" data-flap="ABOUT" />
              <div className="label">
                At BA Express, we are more than just a logistics company.
              </div>
            </div>
            <div className="counter">
              <div className="board-line flap-lg" data-flap="LAST MILE" />
              <div className="label">
                Our core focus is on bridging the last-mile delivery gap for major international
                and domestic logistics carriers who demand tailor-made services.
              </div>
            </div>
            <div className="counter">
              <div className="board-line flap-lg" data-flap="SAFETY" />
              <div className="label">
                With a commitment to ensuring safety and compliance, every driver in our team is
                rigorously vetted to meet the Civil Aviation Authority standards and trained in
                the transport of Dangerous Goods.
              </div>
            </div>
            <div className="counter">
              <div className="board-line flap-lg" data-flap="FLEXIBLE" />
              <div className="label">
                But what truly sets us apart is our dedication to nurturing exceptional and
                professional relationships with our customers. We pride ourselves on flexibility,
                understanding that every delivery, like every client, is unique.
              </div>
            </div>
          </div>
        </section>

        <section className="chapter" id="whyus">
          <p className="kicker">
            <span className="idx">03</span>Why choose us
          </p>
          <div className="flap-lg">
            <div className="board-line" data-flap="PRECISION ACROSS EVERY MILE" />
          </div>
          <p className="blurb reveal" style={{ marginTop: 22 }}>
            We combine international-carrier standards with London street-level agility—so your
            first and last miles stay seamless.
          </p>
          <p className="blurb reveal">
            From electric cargo bikes in Central London to a modern van fleet across Greater
            London and Kent, we scale to your volume without compromising compliance or care.
          </p>
        </section>

        <section className="chapter" id="fleet">
          <p className="kicker">
            <span className="idx">04</span>Our fleet
          </p>
          <div className="flap-lg">
            <div className="board-line" data-flap="OUR FLEET" />
          </div>
          <p className="blurb reveal" style={{ marginTop: 22 }}>
            Combining international standards with urban agility spanning Greater London and Kent.
          </p>
          <div className="board reveal" role="table" aria-label="Fleet board">
            <div className="board-head" role="row">
              <span>COUNT</span>
              <span>REF</span>
              <span>IMPACT</span>
            </div>
            <div className="board-row" role="row" tabIndex={0} data-remark="OUR MISSION">
              <span className="col-time">45K+</span>
              <span className="col-code">BA-OPS</span>
              <span className="col-dest">
                <span className="board-line flap-md" data-flap="DELIVERIES" />
                <small>45,000+ DELIVERIES EVERY MONTH</small>
              </span>
            </div>
            <div className="board-row" role="row" tabIndex={0} data-remark="PRECISION ACROSS LONDON">
              <span className="col-time">× 32</span>
              <span className="col-code">BA-VAN</span>
              <span className="col-dest">
                <span className="board-line flap-md" data-flap="VANS" />
                <small>MODERN VAN FLEET FOR GREATER LONDON &amp; KENT</small>
              </span>
            </div>
            <div
              className="board-row"
              role="row"
              tabIndex={0}
              data-remark="URBAN AGILITY"
            >
              <span className="col-time">× 12</span>
              <span className="col-code">BA-CGO</span>
              <span className="col-dest">
                <span className="board-line flap-md" data-flap="CARGO BIKES" />
                <small>ELECTRIC CARGO BIKES FOR CENTRAL LONDON</small>
              </span>
            </div>
            <div className="board-row" role="row" tabIndex={0} data-remark="FLEXIBLE WINDOWS">
              <span className="col-time">× 09</span>
              <span className="col-code">BA-MTO</span>
              <span className="col-dest">
                <span className="board-line flap-md" data-flap="MOTOR BIKES" />
                <small>9 BIKES · EXPRESS RUNS</small>
              </span>
            </div>
          </div>
        </section>

        <section className="chapter" id="standards">
          <p className="kicker">
            <span className="idx">05</span>Services
          </p>
          <div className="flap-lg">
            <div className="board-line" data-flap="PRECISE AND HARD WORKING" />
          </div>
          <p className="blurb reveal" style={{ marginTop: 22 }}>
            In the world of logistics, we recognise that international enterprises demand bespoke
            solutions tailored to their distinct needs. Every stretch of the journey, from start to
            finish, is crucial, and at BA Express, we&apos;re adept at ensuring the first and last
            legs are managed with utmost precision and attention to detail.
          </p>
          <p className="blurb reveal">
            Our forte is in shaping our services to meet the intricate demands of global
            companies. In today&apos;s fast-paced environment, flexibility is key. By outsourcing
            with BA Express, businesses can bolster their productivity, safe in the knowledge that
            their logistical requirements are being addressed with the highest standard of
            customisation and efficiency.
          </p>
          <div className="tags reveal">
            <div className="tag" style={{ '--tag-accent': '#bf1d23' } as React.CSSProperties}>
              <span className="punch" aria-hidden="true" />
              <span className="code">SERVICE 01</span>
              <h3>Last mile</h3>
              <p>
                End-to-end deliveries with tracking and SLAs aligned to your volume.
              </p>
            </div>
            <div className="tag" style={{ '--tag-accent': '#0891b2' } as React.CSSProperties}>
              <span className="punch" aria-hidden="true" />
              <span className="code">SERVICE 02</span>
              <h3>Mixed fleet</h3>
              <p>
                Vans and cargo bikes for urban areas and Greater London.
              </p>
            </div>
            <div className="tag" style={{ '--tag-accent': '#189a55' } as React.CSSProperties}>
              <span className="punch" aria-hidden="true" />
              <span className="code">SERVICE 03</span>
              <h3>Flexible windows</h3>
              <p>
                Operations adapted to peaks and business hours.
              </p>
            </div>
            <div className="tag" style={{ '--tag-accent': '#7c3aed' } as React.CSSProperties}>
              <span className="punch" aria-hidden="true" />
              <span className="code">SERVICE 04</span>
              <h3>Partnership first</h3>
              <p>
                Opting for BA Express isn&apos;t just about dependable deliveries; it&apos;s about
                entering a partnership grounded in trust, adaptability, and a shared ambition for
                top-tier service.
              </p>
            </div>
          </div>
        </section>

        <section className="chapter" id="partners">
          <p className="kicker">
            <span className="idx">06</span>Our customers
          </p>
          <div className="flap-lg">
            <div className="board-line" data-flap="PARTNERS WE ARE PROUD TO SERVE" />
          </div>
          <div className="consign reveal">
            <div className="row">
              <span>
                CUSTOMER <b>DHL EXPRESS</b>
              </span>
              <span>
                PARTNER <b>GLOBAL LEADER</b>
              </span>
              <span>
                STANDARD <b>RELIABILITY</b>
              </span>
              <span>
                CARE <b>CUSTOMER CARE</b>
              </span>
            </div>
            <p className="quote">
              At BA Express, our customer base is the lifeblood of our operation and serves as a
              testament to our commitment to excellence in logistics. Among our esteemed clientele,
              we are proud to highlight our robust partnership with <strong>DHL Express</strong>.
              As a trusted service provider for this global leader in express logistics, we uphold
              the highest standards of delivery, reliability, and customer care. Our collaboration
              with DHL Express not only showcases our capability to serve international giants but
              also reinforces our dedication to ensuring seamless and efficient logistic solutions
              for all our partners.
            </p>
            <p className="quote" style={{ color: 'var(--dim)', fontSize: '.95rem' }}>
              We&apos;re always eager to expand our horizons and welcome new partnerships. So,
              whether you&apos;re a multinational corporation or a local enterprise, BA Express is
              here to cater to your logistical needs with unmatched precision and dedication.
            </p>
          </div>
        </section>

        <section className="chapter" id="coverage">
          <p className="kicker">
            <span className="idx">07</span>Area we serve
          </p>
          <div className="flap-lg">
            <div className="board-line" data-flap="RECENTLY UPDATED" />
          </div>
          <div className="board cols3 reveal" role="table" aria-label="Coverage zones board">
            <div className="board-head" role="row">
              <span>ZONE</span>
              <span>AREA</span>
              <span>STATUS</span>
            </div>
            <div
              className="board-row"
              role="row"
              tabIndex={0}
              data-remark="HEART OF CENTRAL LONDON"
            >
              <span className="col-code">ZN-CTL</span>
              <span className="col-dest">
                <span className="board-line flap-md" data-flap="CENTRAL LONDON" />
                <small>OPERATIONS RADIATE FROM THE HEART OF CENTRAL LONDON</small>
              </span>
              <span className="status ok" data-base="DAILY">
                SERVED
              </span>
            </div>
            <div
              className="board-row"
              role="row"
              tabIndex={0}
              data-remark="BREADTH OF GREATER LONDON"
            >
              <span className="col-code">ZN-GTR</span>
              <span className="col-dest">
                <span className="board-line flap-md" data-flap="GREATER LONDON" />
                <small>SPANNING THE BREADTH OF GREATER LONDON</small>
              </span>
              <span className="status ok" data-base="DAILY">
                SERVED
              </span>
            </div>
            <div
              className="board-row"
              role="row"
              tabIndex={0}
              data-remark="BEAUTIFUL LANDSCAPES OF KENT"
            >
              <span className="col-code">ZN-KNT</span>
              <span className="col-dest">
                <span className="board-line flap-md" data-flap="KENT" />
                <small>EXTENDING INTO THE BEAUTIFUL LANDSCAPES OF KENT</small>
              </span>
              <span className="status ok" data-base="DAILY">
                SERVED
              </span>
            </div>
          </div>
          <p className="blurb reveal" style={{ marginTop: 22 }}>
            Our operations radiate out from the heart of Central London, spanning the breadth of
            Greater London, and extending into the beautiful landscapes of Kent. With BA Express,
            you&apos;re not just choosing a delivery service; you&apos;re opting for a sustainable
            future.
          </p>
        </section>

        <section className="chapter" id="boarding">
          <p className="kicker">
            <span className="idx">08</span>Contact
          </p>
          <div className="flap-lg">
            <div className="board-line" data-flap="CONTACT" />
          </div>
          <p className="blurb reveal" style={{ marginTop: 22 }}>
            Reach out to us today – we&apos;re here to help and eager to establish a service
            partner relationship with you.
          </p>
          <div className="gates reveal">
            <a
              className="gate"
              href="mailto:info@baexpress.co.uk"
              aria-label="Contact BA Express — email info@baexpress.co.uk"
            >
              <span className="gate-head">
                <span>CONTACT INFO</span>
                <span className="now">FIND US HERE</span>
              </span>
              <span className="gate-body gate-business-body">
                <span className="gate-eyebrow">Email</span>
                <h3>
                  info@baexpress.co.uk <span className="arr">→</span>
                </h3>
                <p>
                  Reach out to us today – we&apos;re here to help and eager to establish a service
                  partner relationship with you.
                </p>
                <span className="gate-route" aria-label="Service flow">
                  <span>CENTRAL LONDON</span>
                  <span className="route-line" aria-hidden="true" />
                  <span>GREATER LONDON</span>
                  <span className="route-line" aria-hidden="true" />
                  <span>KENT</span>
                </span>
                <span className="gate-metrics" aria-label="Service highlights">
                  <span>
                    <strong>Email</strong>
                    <small>info@baexpress.co.uk</small>
                  </span>
                  <span>
                    <strong>Address</strong>
                    <small>20 The Laurels DA3 7HH</small>
                  </span>
                  <span>
                    <strong>Company</strong>
                    <small>BA Express Ltd.</small>
                  </span>
                  <span>
                    <strong>Location</strong>
                    <small>London, United Kingdom</small>
                  </span>
                </span>
              </span>
            </a>
          </div>
          <p className="contact">
            Email <a href="mailto:info@baexpress.co.uk">info@baexpress.co.uk</a> &nbsp;·&nbsp;
            Address 20 The Laurels DA3 7HH
          </p>
          <footer>
            © 2026 BA Express Ltd. Registered in England &amp; Wales: 08771410. London, United
            Kingdom.
          </footer>
        </section>
      </div>

      <div id="ticker" aria-hidden="true">
        <div
          className="strip"
          dangerouslySetInnerHTML={{ __html: TICKER_STRIP + TICKER_STRIP }}
        />
      </div>
    </>
  );
}
