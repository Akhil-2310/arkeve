'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { queryEventsByOrganizer, queryRsvps, updateEventStatus, type ParsedEvent } from '@/lib/entities';
import { parseTransactionError } from '@/lib/errors';
import CreateEventForm from '@/components/CreateEventForm';
import EventCard from '@/components/EventCard';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { Plus, Calendar, TrendingUp, X, Play, Square, Pencil, Loader2 } from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, { bg: string; text: string }> = {
        upcoming: { bg: '#FFF3E0', text: '#F57C00' },
        live: { bg: '#E8F5E9', text: '#2E7D32' },
        ended: { bg: '#F3E5F5', text: '#7B1FA2' },
    };
    const s = colors[status] || colors.upcoming;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem',
            fontWeight: 600, background: s.bg, color: s.text,
            textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>
            {status === 'live' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.text, animation: 'pulse 1.5s infinite' }} />}
            {status}
        </span>
    );
}

export default function DashboardPage() {
    const { address, connector, isConnected, isOrganizer, organizer } = useWallet();
    const [events, setEvents] = useState<ParsedEvent[]>([]);
    const [rsvpCounts, setRsvpCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<ParsedEvent | null>(null);
    const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

    const loadEvents = async () => {
        if (!address || !isOrganizer) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const evts = await queryEventsByOrganizer(address);
            setEvents(evts);
            const counts: Record<string, number> = {};
            await Promise.all(
                evts.map(async (evt) => {
                    try {
                        const rsvps = await queryRsvps(evt.entityKey);
                        counts[evt.entityKey] = rsvps.length;
                    } catch {
                        counts[evt.entityKey] = 0;
                    }
                })
            );
            setRsvpCounts(counts);
        } catch (err) {
            console.error('Failed to load events:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, [address, isOrganizer]);

    const handleStatusChange = async (event: ParsedEvent, newStatus: 'upcoming' | 'live' | 'ended') => {
        if (!address || !connector) return;
        setStatusUpdating(event.entityKey);
        try {
            await updateEventStatus(connector, address, event, newStatus);
            await loadEvents();
        } catch (err) {
            console.error('Failed to update status:', err);
            alert(parseTransactionError(err));
        } finally {
            setStatusUpdating(null);
        }
    };

    if (!isConnected) {
        return (
            <div className="section">
                <div className="container empty-state">
                    <Calendar size={64} />
                    <h3>Connect Your Wallet</h3>
                    <p>Connect your wallet to access the organizer dashboard.</p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <ConnectButton />
                    </div>
                </div>
            </div>
        );
    }

    if (!isOrganizer) {
        return (
            <div className="section">
                <div className="container empty-state">
                    <Calendar size={64} />
                    <h3>Become an Organizer</h3>
                    <p>Create your organizer profile to start publishing events on ArkEve.</p>
                    <Link href="/become-organizer" className="btn btn-primary btn-lg">
                        Become an Organizer
                    </Link>
                </div>
            </div>
        );
    }

    const totalRsvps = Object.values(rsvpCounts).reduce((a, b) => a + b, 0);
    const upcomingEvents = events.filter(e => e.status !== 'ended');
    const endedEvents = events.filter(e => e.status === 'ended');

    return (
        <div className="dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1>
                            Welcome, <span style={{ color: 'var(--accent)' }}>{organizer?.name}</span>
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
                            Manage your events and track RSVPs
                        </p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => { setEditingEvent(null); setShowCreateForm(true); }}
                    >
                        <Plus size={16} />
                        Create Event
                    </button>
                </div>

                {/* Stats */}
                <div className="dashboard-stats">
                    <div className="glass-card stat-card">
                        <div className="stat-value" style={{ color: 'var(--accent)' }}>{events.length}</div>
                        <div className="stat-label">Published Events</div>
                    </div>
                    <div className="glass-card stat-card">
                        <div className="stat-value" style={{ color: 'var(--accent)' }}>{totalRsvps}</div>
                        <div className="stat-label">Total RSVPs</div>
                    </div>
                    <div className="glass-card stat-card">
                        <div className="stat-value" style={{ color: 'var(--accent)' }}>
                            {events.length > 0 ? Math.round(totalRsvps / events.length) : 0}
                        </div>
                        <div className="stat-label">Avg. per Event</div>
                    </div>
                </div>

                {/* Create / Edit Event Modal */}
                {showCreateForm && (
                    <div className="modal-overlay" onClick={() => { setShowCreateForm(false); setEditingEvent(null); }}>
                        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h2>{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
                                <button className="btn btn-ghost btn-sm" onClick={() => { setShowCreateForm(false); setEditingEvent(null); }}>
                                    <X size={18} />
                                </button>
                            </div>
                            <CreateEventForm
                                existingEvent={editingEvent || undefined}
                                onSuccess={() => {
                                    setShowCreateForm(false);
                                    setEditingEvent(null);
                                    loadEvents();
                                }}
                                onCancel={() => { setShowCreateForm(false); setEditingEvent(null); }}
                            />
                        </div>
                    </div>
                )}

                {/* Active Events */}
                <div className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h2>Active Events</h2>
                    </div>
                    {loading ? (
                        <div className="events-grid">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="glass-card" style={{ height: 300 }}>
                                    <div className="skeleton" style={{ height: 160 }} />
                                    <div style={{ padding: 16 }}>
                                        <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 8 }} />
                                        <div className="skeleton" style={{ height: 14, width: '40%' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : upcomingEvents.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {upcomingEvents.map((event) => (
                                <div key={event.entityKey} className="glass-card" style={{ padding: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                                        <div style={{ flex: 1, minWidth: 200 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                                <StatusBadge status={event.status} />
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                                    {rsvpCounts[event.entityKey] || 0} RSVPs
                                                </span>
                                            </div>
                                            <Link href={`/event/${event.entityKey}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <h3 style={{ fontSize: '1.15rem', marginBottom: 4 }}>{event.title}</h3>
                                            </Link>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                                                {new Date(event.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })} · {event.time} · {event.city}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                                            {statusUpdating === event.entityKey ? (
                                                <Loader2 size={18} className="spin" style={{ color: 'var(--accent)' }} />
                                            ) : (
                                                <>
                                                    {event.status === 'upcoming' && (
                                                        <button
                                                            className="btn btn-sm"
                                                            style={{ background: '#E8F5E9', color: '#2E7D32', border: 'none', fontSize: '0.8rem' }}
                                                            onClick={() => handleStatusChange(event, 'live')}
                                                            title="Go Live"
                                                        >
                                                            <Play size={14} />
                                                            Go Live
                                                        </button>
                                                    )}
                                                    {event.status === 'live' && (
                                                        <button
                                                            className="btn btn-sm"
                                                            style={{ background: '#F3E5F5', color: '#7B1FA2', border: 'none', fontSize: '0.8rem' }}
                                                            onClick={() => handleStatusChange(event, 'ended')}
                                                            title="End Event"
                                                        >
                                                            <Square size={14} />
                                                            End Event
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        style={{ fontSize: '0.8rem' }}
                                                        onClick={() => { setEditingEvent(event); setShowCreateForm(true); }}
                                                        title="Edit"
                                                    >
                                                        <Pencil size={14} />
                                                        Edit
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: '40px 24px' }}>
                            <TrendingUp size={48} />
                            <h3>No active events</h3>
                            <p>Create your first event to get started!</p>
                            <button className="btn btn-primary" onClick={() => { setEditingEvent(null); setShowCreateForm(true); }}>
                                <Plus size={16} />
                                Create Event
                            </button>
                        </div>
                    )}
                </div>

                {/* Ended Events */}
                {endedEvents.length > 0 && (
                    <div className="dashboard-section" style={{ marginTop: 32 }}>
                        <div className="dashboard-section-header">
                            <h2>Past Events</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {endedEvents.map((event) => (
                                <div key={event.entityKey} className="glass-card" style={{ padding: 16, opacity: 0.7 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <StatusBadge status="ended" />
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                                    {rsvpCounts[event.entityKey] || 0} RSVPs
                                                </span>
                                            </div>
                                            <Link href={`/event/${event.entityKey}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <h3 style={{ fontSize: '1rem', marginBottom: 2 }}>{event.title}</h3>
                                            </Link>
                                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', margin: 0 }}>
                                                {new Date(event.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })} · {event.city}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
