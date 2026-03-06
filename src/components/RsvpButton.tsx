'use client';

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { createRsvp, checkExistingRsvp } from '@/lib/entities';
import { parseTransactionError } from '@/lib/errors';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Loader2, Check, UserPlus, Clock } from 'lucide-react';

interface RsvpButtonProps {
    eventKey: string;
    eventDate: string;
    isFull: boolean;
    onSuccess: () => void;
}

export default function RsvpButton({
    eventKey,
    eventDate,
    isFull,
    onSuccess,
}: RsvpButtonProps) {
    const { address, connector, isConnected } = useWallet();
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [waitlisted, setWaitlisted] = useState(false);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [showNameInput, setShowNameInput] = useState(false);

    if (!isConnected) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ConnectButton />
            </div>
        );
    }

    if (done) {
        return (
            <button className="btn btn-primary btn-lg" disabled style={{ width: '100%', opacity: 1 }}>
                <Check size={18} />
                RSVP Confirmed!
            </button>
        );
    }

    if (waitlisted) {
        return (
            <button className="btn btn-secondary btn-lg" disabled style={{ width: '100%', opacity: 1 }}>
                <Clock size={18} />
                On the Waitlist!
            </button>
        );
    }

    const handleRsvp = async (asWaitlist: boolean = false) => {
        if (!address || !connector) return;

        setLoading(true);
        setError('');

        try {
            const exists = await checkExistingRsvp(eventKey, address);
            if (exists) {
                if (asWaitlist) setWaitlisted(true);
                else setDone(true);
                return;
            }

            await createRsvp(connector, address, eventKey, { attendeeName: name || undefined }, eventDate, asWaitlist);
            if (asWaitlist) {
                setWaitlisted(true);
            } else {
                setDone(true);
            }
            onSuccess();
        } catch (err: unknown) {
            setError(parseTransactionError(err));
        } finally {
            setLoading(false);
        }
    };

    // Event is full — show Join Waitlist
    if (isFull) {
        return (
            <div>
                <button
                    className="btn btn-secondary btn-lg"
                    onClick={() => handleRsvp(true)}
                    disabled={loading}
                    style={{ width: '100%' }}
                >
                    {loading ? (
                        <>
                            <Loader2 size={18} className="spin" />
                            Joining Waitlist...
                        </>
                    ) : (
                        <>
                            <Clock size={18} />
                            Join Waitlist
                        </>
                    )}
                </button>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: 8, textAlign: 'center' }}>
                    This event is full. Join the waitlist to be notified if spots open up.
                </p>
                {error && <div className="error-message" style={{ marginTop: 12 }}>{error}</div>}
            </div>
        );
    }

    return (
        <div>
            {showNameInput ? (
                <div style={{ marginBottom: 12 }}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Your name (optional)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ marginBottom: 8 }}
                    />
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => handleRsvp(false)}
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="spin" />
                                RSVPing...
                            </>
                        ) : (
                            <>
                                <Check size={18} />
                                Confirm RSVP
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <button
                    className="btn btn-primary btn-lg"
                    onClick={() => setShowNameInput(true)}
                    style={{ width: '100%' }}
                >
                    <UserPlus size={18} />
                    RSVP to this Event
                </button>
            )}

            {error && <div className="error-message" style={{ marginTop: 12 }}>{error}</div>}
        </div>
    );
}
