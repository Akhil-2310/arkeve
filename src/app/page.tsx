'use client';

import Link from 'next/link';
import { ArrowRight, Zap, Shield, Clock, Search, Users, Calendar, ChevronRight } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-content animate-fade-in-up">
          <div className="hero-badge">
            <Zap size={14} />
            Powered by Arkiv Network
          </div>
          <h1>
            Events, <span style={{ color: 'var(--accent)' }}>Owned</span> by You
          </h1>
          <p>
            Discover and host events on a decentralized platform where organizers
            and attendees own their data. No middlemen, no lock-in — just
            community.
          </p>
          <div className="hero-actions">
            <Link href="/browse" className="btn btn-primary btn-lg">
              <Search size={18} />
              Browse Events
            </Link>
            <Link href="/become-organizer" className="btn btn-secondary btn-lg">
              Host an Event
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="container">
          <div className="hero-stats animate-fade-in-up stagger-3">
            <div className="hero-stat">
              <div className="hero-stat-value" style={{ color: 'var(--accent)' }}>3</div>
              <div className="hero-stat-label">Entity Types</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value" style={{ color: 'var(--accent)' }}>100%</div>
              <div className="hero-stat-label">On-Chain Data</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value" style={{ color: 'var(--accent)' }}>0</div>
              <div className="hero-stat-label">Middlemen</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Why Ark<span style={{ color: 'var(--accent)' }}>Eve</span>?</h2>
            <p>
              A fully decentralized event platform. Your events, your audience,
              your data.
            </p>
          </div>

          <div className="landing-features">
            {/* Feature 1 */}
            <div className="glass-card landing-feature-card animate-fade-in-up stagger-1">
              <div className="landing-feature-image">
                <img src="/images/feature-security.png" alt="User-owned data" />
              </div>
              <h3>User-Owned Data</h3>
              <p>
                Events, profiles, and RSVPs are stored as entities on Arkiv,
                owned by your wallet. No one can delete your events but you.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card landing-feature-card animate-fade-in-up stagger-2">
              <div className="landing-feature-image">
                <img src="/images/feature-events.png" alt="Smart expiration" />
              </div>
              <h3>Smart Expiration</h3>
              <p>
                Data auto-expires after events end. Pay only for what you need
                — no permanent storage bloat on-chain.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card landing-feature-card animate-fade-in-up stagger-3">
              <div className="landing-feature-image">
                <img src="/images/feature-portable.png" alt="No lock-in" />
              </div>
              <h3>No Lock-In</h3>
              <p>
                Your event data is portable and queryable directly from Arkiv.
                Take your community anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <h2>How It <span style={{ color: 'var(--accent)' }}>Works</span></h2>
            <p>Three simple steps to decentralized event management</p>
          </div>

          <div className="how-it-works-grid">
            <div className="glass-card how-it-works-step animate-fade-in-up stagger-1">
              <div className="step-number">1</div>
              <h3>Create Your Profile</h3>
              <p>Connect your wallet and set up your organizer profile. One transaction, fully on-chain.</p>
            </div>

            <div className="step-arrow animate-fade-in-up stagger-2">
              <ChevronRight size={24} />
            </div>

            <div className="glass-card how-it-works-step animate-fade-in-up stagger-2">
              <div className="step-number">2</div>
              <h3>Publish Events</h3>
              <p>Create events with all the details — title, date, location, capacity. Go live when ready.</p>
            </div>

            <div className="step-arrow animate-fade-in-up stagger-3">
              <ChevronRight size={24} />
            </div>

            <div className="glass-card how-it-works-step animate-fade-in-up stagger-3">
              <div className="step-number">3</div>
              <h3>Collect RSVPs</h3>
              <p>Attendees RSVP with their wallet. Track attendance, manage capacity — all verifiable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Organizers & Attendees */}
      <section className="section">
        <div className="container">
          <div className="two-col-grid">
            <div className="glass-card animate-fade-in-up stagger-1" style={{ padding: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
                }}>
                  <Calendar size={20} />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>For Organizers</h3>
              </div>
              <ul className="feature-list">
                <li>Create & manage events with a single wallet signature</li>
                <li>Control event lifecycle: draft → live → ended</li>
                <li>Track RSVPs and attendee lists in real-time</li>
                <li>Upload images, compressed and stored on-chain</li>
                <li>Edit event details anytime</li>
              </ul>
              <Link href="/become-organizer" className="btn btn-primary" style={{ marginTop: 24 }}>
                Start Hosting <ArrowRight size={16} />
              </Link>
            </div>

            <div className="glass-card animate-fade-in-up stagger-2" style={{ padding: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
                }}>
                  <Users size={20} />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>For Attendees</h3>
              </div>
              <ul className="feature-list">
                <li>Browse events without connecting a wallet</li>
                <li>Filter by category, search by name or city</li>
                <li>RSVP with a single wallet signature</li>
                <li>View organizer profiles and their event history</li>
                <li>Share event links with friends</li>
              </ul>
              <Link href="/browse" className="btn btn-secondary" style={{ marginTop: 24 }}>
                Browse Events <Search size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="animate-fade-in-up">
            <h2 style={{ fontSize: '2.5rem', marginBottom: 16 }}>
              Ready to <span style={{ color: 'var(--accent)' }}>host</span>?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
              Create your organizer profile and start publishing events on the
              decentralized web.
            </p>
            <Link href="/become-organizer" className="btn btn-primary btn-lg">
              Become an Organizer
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
