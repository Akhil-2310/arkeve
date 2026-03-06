'use client';

import { useState, useEffect, useCallback } from 'react';
import { queryRsvps, type ParsedRsvp } from '@/lib/entities';

export function useRsvps(eventKey: string | null) {
    const [rsvps, setRsvps] = useState<ParsedRsvp[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRsvps = useCallback(async () => {
        if (!eventKey) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await queryRsvps(eventKey);
            setRsvps(result);
        } catch (err) {
            console.error('Failed to fetch RSVPs:', err);
            setError('Failed to load RSVPs');
        } finally {
            setLoading(false);
        }
    }, [eventKey]);

    useEffect(() => {
        fetchRsvps();
    }, [fetchRsvps]);

    return { rsvps, loading, error, refetch: fetchRsvps };
}
