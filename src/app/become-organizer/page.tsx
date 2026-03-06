'use client';

import { useWallet } from '@/contexts/WalletContext';
import OrganizerSetup from '@/components/OrganizerSetup';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

export default function BecomeOrganizerPage() {
    const { isConnected, isOrganizer, organizer, refreshOrganizer } = useWallet();
    const router = useRouter();

    if (isOrganizer) {
        return (
            <div className="become-organizer">
                <div className="glass-card become-organizer-card" style={{ textAlign: 'center' }}>
                    <CheckCircle2 size={64} style={{ color: 'var(--accent)', marginBottom: 16 }} />
                    <h1>You&apos;re Already an Organizer!</h1>
                    <p>
                        Welcome back, <strong>{organizer?.name}</strong>. Head to your
                        dashboard to manage events.
                    </p>
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => router.push('/dashboard')}
                        style={{ marginTop: 8, width: '100%' }}
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="become-organizer">
                <div className="glass-card become-organizer-card" style={{ textAlign: 'center' }}>
                    <h1>Connect Your Wallet</h1>
                    <p style={{ marginBottom: 24 }}>
                        To become an organizer, first connect your wallet.
                        This identifies you on the Arkiv network.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <ConnectButton />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="become-organizer">
            <div className="glass-card become-organizer-card">
                <h1>
                    Become an <span style={{ color: 'var(--accent)' }}>Organizer</span>
                </h1>
                <p>
                    Create your on-chain organizer profile. This profile is stored as an
                    entity on Arkiv Network, owned by your wallet.
                </p>
                <OrganizerSetup
                    onSuccess={async () => {
                        await refreshOrganizer();
                        router.push('/dashboard');
                    }}
                />
            </div>
        </div>
    );
}
