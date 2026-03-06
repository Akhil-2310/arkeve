'use client';

import Link from 'next/link';
import { MapPin, Clock, Users, Calendar } from 'lucide-react';
import { type ParsedEvent, CATEGORIES } from '@/lib/entities';
import { useEffect, useState } from 'react';
import { getImageUrl } from '@/lib/entities';

function formatDate(dateStr: string): { month: string; day: string; full: string } {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
        return { month: '???', day: '?', full: 'Invalid Date' };
    }
    return {
        month: d.toLocaleString('en', { month: 'short' }).toUpperCase(),
        day: d.getDate().toString(),
        full: d.toLocaleDateString('en', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }),
    };
}

interface EventCardProps {
    event: ParsedEvent;
    rsvpCount?: number;
}

export default function EventCard({ event, rsvpCount = 0 }: EventCardProps) {
    const date = formatDate(event.date);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (event.imageKey) {
            getImageUrl(event.imageKey).then(setImageUrl);
        }
    }, [event.imageKey]);

    const cat = CATEGORIES.find(
        (c) => c.name.toLowerCase() === event.category?.toLowerCase()
    );

    return (
        <Link href={`/event/${event.entityKey}`}>
            <div className="glass-card event-card">
                <div className="event-card-image">
                    {imageUrl ? (
                        <img src={imageUrl} alt={event.title} />
                    ) : (
                        <Calendar size={48} />
                    )}
                    <div className="event-card-date">
                        <div className="event-card-date-month">{date.month}</div>
                        <div className="event-card-date-day">{date.day}</div>
                    </div>
                </div>

                <div className="event-card-body">
                    {cat && (
                        <span className="badge badge-orange" style={{ marginBottom: 8 }}>
                            {cat.emoji} {event.category}
                        </span>
                    )}

                    <h3 className="event-card-title">{event.title}</h3>

                    <div className="event-card-info">
                        <div className="event-card-info-row">
                            <Clock size={14} />
                            <span>{date.full} · {event.time}</span>
                        </div>
                        <div className="event-card-info-row">
                            <MapPin size={14} />
                            <span>{event.location}</span>
                        </div>
                    </div>
                </div>

                <div className="event-card-footer">
                    <div className="event-card-info-row">
                        <Users size={14} />
                        <span>{rsvpCount} attending</span>
                    </div>
                    <span className="event-card-spots">
                        {event.capacity - rsvpCount} spots left
                    </span>
                </div>
            </div>
        </Link>
    );
}
