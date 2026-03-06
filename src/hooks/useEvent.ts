'use client';

import { useState, useEffect } from 'react';
import { queryEventByKey, type ParsedEvent } from '@/lib/entities';

export function useEvent(key: string | null) {
    const [event, setEvent] = useState<ParsedEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!key) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        queryEventByKey(key)
            .then((result) => setEvent(result))
            .catch((err) => {
                console.error('Failed to fetch event:', err);
                setError('Failed to load event');
            })
            .finally(() => setLoading(false));
    }, [key]);

    return { event, loading, error };
}
