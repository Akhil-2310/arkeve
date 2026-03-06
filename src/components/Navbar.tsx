'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '@/contexts/WalletContext';
import { Zap } from 'lucide-react';

const NAV_LINKS = [
    { href: '/', label: 'Home' },
    { href: '/browse', label: 'Browse Events' },
    { href: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
    const pathname = usePathname();
    const { isOrganizer } = useWallet();

    return (
        <nav className="navbar">
            <div className="container navbar-inner">
                <Link href="/" className="navbar-brand">
                    <div className="navbar-logo">
                        <Zap size={18} />
                    </div>
                    <span>
                        Ark<span style={{ color: 'var(--accent)' }}>Eve</span>
                    </span>
                </Link>

                <div className="navbar-links">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`navbar-link ${pathname === link.href ? 'active' : ''
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {isOrganizer && (
                        <Link
                            href="/dashboard"
                            className={`navbar-link ${pathname === '/dashboard' ? 'active' : ''
                                }`}
                        />
                    )}
                </div>

                <ConnectButton
                    showBalance={false}
                    chainStatus="icon"
                    accountStatus="address"
                />
            </div>
        </nav>
    );
}
