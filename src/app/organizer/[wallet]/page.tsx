'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { queryOrganizerByWallet, queryEventsByOrganizer, getImageUrl, type ParsedOrganizer, type ParsedEvent } from '@/lib/entities';
import EventCard from '@/components/EventCard';
import Link from 'next/link';
import { ArrowLeft, Calendar, Loader2, Twitter, User } from 'lucide-react';

export default function OrganizerProfilePage() {
    const params = useParams();
    const wallet = params.wallet as string;
    const [organizer, setOrganizer] = useState<ParsedOrganizer | null>(null);
    const [events, setEvents] = useState<ParsedEvent[]>([]);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!wallet) return;
        setLoading(true);

        Promise.all([
            queryOrganizerByWallet(wallet),
            queryEventsByOrganizer(wallet),
        ])
            .then(([org, evts]) => {
                setOrganizer(org);
                setEvents(evts);
                if (org?.avatar) {
                    getImageUrl(org.avatar).then(setAvatarUrl);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [wallet]);

    if (loading) {
        return (
            <div className="section">
                <div className="container" style={{ textAlign: 'center', padding: '120px 0' }}>
                    <Loader2 size={40} className="spin" style={{ color: 'var(--accent)' }} />
                    <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Loading organizer...</p>
                </div>
            </div>
        );
    }

    if (!organizer) {
        return (
            <div className="section">
                <div className="container empty-state">
                    <User size={64} />
                    <h3>Organizer not found</h3>
                    <p>This organizer profile doesn&apos;t exist or hasn&apos;t been created yet.</p>
                    <Link href="/browse" className="btn btn-primary">
                        Browse Events
                    </Link>
                </div>
            </div>
        );
    }

    const truncatedWallet = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
    const upcomingEvents = events.filter(e => e.status !== 'ended');
    const pastEvents = events.filter(e => e.status === 'ended');

    return (
        <div className="section">
            <div className="container">
                <Link
                    href="/browse"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem',
                    }}
                >
                    <ArrowLeft size={16} />
                    Back to Events
                </Link>

                {/* Organizer Header */}
                <div className="glass-card" style={{ padding: 32, marginBottom: 32 }}>
                    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={organizer.name}
                                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div style={{
                                width: 80, height: 80, borderRadius: '50%',
                                background: 'var(--accent)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: '2rem', fontWeight: 700, color: '#fff',
                            }}>
                                {organizer.name[0].toUpperCase()}
                            </div>
                        )}
                        <div style={{ flex: 1 }}>
                            <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>{organizer.name}</h1>
                            <p style={{ color: 'var(--text-tertiary)', fontFamily: 'monospace', fontSize: '0.85rem', marginBottom: 8 }}>
                                {truncatedWallet}
                            </p>
                            {organizer.bio && (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 8, maxWidth: 600 }}>
                                    {organizer.bio}
                                </p>
                            )}
                            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                {organizer.twitter && (
                                    <a
                                        href={`https://twitter.com/${organizer.twitter.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--accent)', fontSize: '0.9rem' }}
                                    >
                                        <Twitter size={14} />
                                        {organizer.twitter}
                                    </a>
                                )}
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                                    <Calendar size={14} />
                                    {events.length} event{events.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upcoming Events */}
                {upcomingEvents.length > 0 && (
                    <div style={{ marginBottom: 40 }}>
                        <h2 style={{ fontSize: '1.4rem', marginBottom: 20 }}>
                            Upcoming Events <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', fontWeight: 400 }}>({upcomingEvents.length})</span>
                        </h2>
                        <div className="events-grid">
                            {upcomingEvents.map((event) => (
                                <EventCard key={event.entityKey} event={event} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Past Events */}
                {pastEvents.length > 0 && (
                    <div>
                        <h2 style={{ fontSize: '1.4rem', marginBottom: 20 }}>
                            Past Events <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', fontWeight: 400 }}>({pastEvents.length})</span>
                        </h2>
                        <div className="events-grid">
                            {pastEvents.map((event) => (
                                <EventCard key={event.entityKey} event={event} />
                            ))}
                        </div>
                    </div>
                )}

                {/* No Events */}
                {events.length === 0 && (
                    <div className="empty-state">
                        <Calendar size={64} />
                        <h3>No events yet</h3>
                        <p>{organizer.name} hasn&apos;t published any events yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
