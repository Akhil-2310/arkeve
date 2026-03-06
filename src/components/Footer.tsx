'use client';

import Link from 'next/link';
import { Zap, ExternalLink } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="footer-brand-name">
                            <div className="navbar-logo" style={{ width: 28, height: 28 }}>
                                <Zap size={14} />
                            </div>
                            Ark<span style={{ color: 'var(--accent)' }}>Eve</span>
                        </div>
                        <p className="footer-brand-desc">
                            Events, owned by you. A decentralized event platform
                            powered by Arkiv Network — where organizers and
                            attendees control their data.
                        </p>
                    </div>

                    <div>
                        <div className="footer-section-title">Platform</div>
                        <div className="footer-links">
                            <Link href="/" className="footer-link">Home</Link>
                            <Link href="/browse" className="footer-link">Browse Events</Link>
                            <Link href="/dashboard" className="footer-link">Dashboard</Link>
                            <Link href="/become-organizer" className="footer-link">Become Organizer</Link>
                        </div>
                    </div>

                    <div>
                        <div className="footer-section-title">Arkiv Network</div>
                        <div className="footer-links">
                            <a href="https://docs.arkiv.network" target="_blank" rel="noopener noreferrer" className="footer-link">
                                Documentation <ExternalLink size={12} />
                            </a>
                            <a href="https://explorer.kaolin.hoodi.arkiv.network" target="_blank" rel="noopener noreferrer" className="footer-link">
                                Explorer <ExternalLink size={12} />
                            </a>
                            <a href="https://kaolin.hoodi.arkiv.network/faucet/" target="_blank" rel="noopener noreferrer" className="footer-link">
                                Faucet <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <div className="footer-section-title">Connect</div>
                        <div className="footer-links">
                            <a href="https://discord.gg/arkiv" target="_blank" rel="noopener noreferrer" className="footer-link">
                                Discord <ExternalLink size={12} />
                            </a>
                            <a href="https://github.com/ArkivNetwork" target="_blank" rel="noopener noreferrer" className="footer-link">
                                GitHub <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <span>&copy; {new Date().getFullYear()} ArkEve. Built on Arkiv Network.</span>
                    <span>Powered by decentralized data ⚡</span>
                </div>
            </div>
        </footer>
    );
}
