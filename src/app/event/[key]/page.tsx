'use client';

import { useParams } from 'next/navigation';
import { useEvent } from '@/hooks/useEvent';
import { useRsvps } from '@/hooks/useRsvps';
import RsvpButton from '@/components/RsvpButton';
import { useWallet } from '@/contexts/WalletContext';
import { queryOrganizerByWallet, getImageUrl, type ParsedOrganizer, CATEGORIES } from '@/lib/entities';
import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Tag, ArrowLeft, Loader2, Share2, Check } from 'lucide-react';
import Link from 'next/link';

function truncateAddress(addr: string): string {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function EventDetailPage() {
    const params = useParams();
    const key = params.key as string;
    const { event, loading, error } = useEvent(key);
    const { rsvps, refetch: refetchRsvps } = useRsvps(key);
    const { address } = useWallet();
    const [organizer, setOrganizer] = useState<ParsedOrganizer | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (event?.organizer) {
            queryOrganizerByWallet(event.organizer).then(setOrganizer);
        }
        if (event?.imageKey) {
            getImageUrl(event.imageKey).then(setImageUrl);
        }
    }, [event]);

    if (loading) {
        return (
            <div className="event-detail">
                <div className="container" style={{ textAlign: 'center', padding: '120px 0' }}>
                    <Loader2 size={40} className="spin" style={{ color: 'var(--accent)' }} />
                    <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Loading event...</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="event-detail">
                <div className="container empty-state">
                    <h3>Event not found</h3>
                    <p>This event may have expired or doesn&apos;t exist.</p>
                    <Link href="/browse" className="btn btn-primary">
                        Browse Events
                    </Link>
                </div>
            </div>
        );
    }

    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('en', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    const cat = CATEGORIES.find(
        (c) => c.name.toLowerCase() === event.category?.toLowerCase()
    );

    const rsvpCount = rsvps.length;
    const isFull = rsvpCount >= event.capacity;
    const capacityPercent = Math.min(100, (rsvpCount / event.capacity) * 100);

    return (
        <div className="event-detail">
            <div className="container">
                <Link
                    href="/browse"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        color: 'var(--text-secondary)',
                        marginBottom: 24,
                        fontSize: '0.9rem',
                    }}
                >
                    <ArrowLeft size={16} />
                    Back to Events
                </Link>

                <div className="event-detail-hero">
                    {imageUrl ? (
                        <img src={imageUrl} alt={event.title} />
                    ) : (
                        <Calendar size={80} style={{ color: 'var(--text-tertiary)', opacity: 0.3 }} />
                    )}
                </div>

                <div className="event-detail-content">
                    <div className="event-detail-main animate-fade-in-up">
                        {cat && (
                            <span className="badge badge-orange" style={{ marginBottom: 16, display: 'inline-flex' }}>
                                {cat.emoji} {cat.name}
                            </span>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                            <h1 style={{ flex: 1 }}>{event.title}</h1>
                            <button
                                className="btn btn-secondary btn-sm"
                                style={{ flexShrink: 0, marginTop: 6 }}
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                            >
                                {copied ? <><Check size={14} /> Copied!</> : <><Share2 size={14} /> Share</>}
                            </button>
                        </div>

                        <div className="event-detail-meta">
                            <div className="event-detail-meta-item">
                                <Calendar size={18} />
                                <span>{formattedDate}</span>
                            </div>
                            <div className="event-detail-meta-item">
                                <Clock size={18} />
                                <span>{event.time}</span>
                            </div>
                            <div className="event-detail-meta-item">
                                <MapPin size={18} />
                                <span>{event.location}</span>
                            </div>
                            <div className="event-detail-meta-item">
                                <Users size={18} />
                                <span>{event.capacity} capacity</span>
                            </div>
                        </div>

                        {event.tags && event.tags.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                                {event.tags.map((tag) => (
                                    <span key={tag} className="badge badge-orange" style={{ display: 'inline-flex', gap: 4 }}>
                                        <Tag size={10} />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="event-detail-description">
                            {event.description || 'No description provided.'}
                        </div>

                        {/* Attendees List */}
                        {rsvps.length > 0 && (
                            <div style={{ marginTop: 32 }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: 16 }}>
                                    Attendees ({rsvps.length})
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {rsvps.slice(0, 10).map((rsvp) => (
                                        <div key={rsvp.entityKey} className="glass-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: '50%',
                                                background: 'var(--accent)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.75rem', fontWeight: 700, color: '#fff',
                                            }}>
                                                {(rsvp.attendeeName || rsvp.attendee || '?')[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                                                    {rsvp.attendeeName || truncateAddress(rsvp.attendee)}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                                                    {truncateAddress(rsvp.attendee)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {rsvps.length > 10 && (
                                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                                            +{rsvps.length - 10} more attendees
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="event-detail-sidebar animate-fade-in-up stagger-2">
                        {/* RSVP Card */}
                        <div className="glass-card sidebar-card rsvp-section">
                            <div className="rsvp-count" style={{ color: 'var(--accent)' }}>{rsvpCount}</div>
                            <div className="rsvp-label">
                                of {event.capacity} spots filled
                            </div>
                            <div className="capacity-bar">
                                <div
                                    className="capacity-fill"
                                    style={{ width: `${capacityPercent}%` }}
                                />
                            </div>
                            {address?.toLowerCase() === event.organizer.toLowerCase() ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem', margin: '8px 0 0' }}>
                                    You are the organizer
                                </p>
                            ) : (
                                <RsvpButton
                                    eventKey={key}
                                    eventDate={event.date}
                                    isFull={isFull}
                                    onSuccess={refetchRsvps}
                                />
                            )}
                        </div>

                        {/* Organizer Card */}
                        <Link href={`/organizer/${event.organizer}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="glass-card sidebar-card" style={{ cursor: 'pointer' }}>
                                <h3>Organizer</h3>
                                <div className="organizer-info">
                                    <div className="organizer-avatar">
                                        {(organizer?.name || event.organizer || '?')[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="organizer-name">
                                            {organizer?.name || 'Anonymous Organizer'}
                                        </div>
                                        <div className="organizer-wallet">
                                            {truncateAddress(event.organizer)}
                                        </div>
                                    </div>
                                </div>
                                {organizer?.bio && (
                                    <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                        {organizer.bio}
                                    </p>
                                )}
                            </div>
                        </Link>

                        {/* Event Info Card */}
                        <div className="glass-card sidebar-card">
                            <h3>Event Details</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.85rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-tertiary)' }}>Entity Key</span>
                                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                        {key.slice(0, 8)}...{key.slice(-6)}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-tertiary)' }}>City</span>
                                    <span>{event.city}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-tertiary)' }}>Storage</span>
                                    <span className="badge badge-orange" style={{ fontSize: '0.7rem' }}>Arkiv Network</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
