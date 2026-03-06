'use client';

import { useState, useEffect, useCallback } from 'react';
import { queryEvents, type ParsedEvent } from '@/lib/entities';

export function useEvents(filters?: { category?: string; city?: string }) {
    const [events, setEvents] = useState<ParsedEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await queryEvents(filters);
            setEvents(result);
        } catch (err) {
            console.error('Failed to fetch events:', err);
            setError('Failed to load events');
        } finally {
            setLoading(false);
        }
    }, [filters?.category, filters?.city]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return { events, loading, error, refetch: fetchEvents };
}
