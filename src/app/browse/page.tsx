'use client';

import { useState, useMemo } from 'react';
import { useEvents } from '@/hooks/useEvents';
import EventCard from '@/components/EventCard';
import EventFilters from '@/components/EventFilters';
import { Search } from 'lucide-react';

export default function BrowsePage() {
    const [category, setCategory] = useState('');
    const { events, loading } = useEvents(category ? { category } : undefined);
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search) return events;
        const q = search.toLowerCase();
        return events.filter(
            (e) =>
                e.title.toLowerCase().includes(q) ||
                e.description?.toLowerCase().includes(q) ||
                e.location.toLowerCase().includes(q) ||
                e.city.toLowerCase().includes(q)
        );
    }, [events, search]);

    return (
        <div className="section">
            <div className="container">
                <div className="section-header" style={{ textAlign: 'left', marginBottom: 32 }}>
                    <h2>Browse <span className="gradient-text">Events</span></h2>
                    <p style={{ margin: 0 }}>Discover upcoming events across the Web3 community</p>
                </div>

                <EventFilters
                    search={search}
                    onSearchChange={setSearch}
                    activeCategory={category}
                    onCategoryChange={setCategory}
                />

                {loading ? (
                    <div className="events-grid">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="glass-card" style={{ height: 380 }}>
                                <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }} />
                                <div style={{ padding: 20 }}>
                                    <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 12 }} />
                                    <div className="skeleton" style={{ height: 20, width: '80%', marginBottom: 12 }} />
                                    <div className="skeleton" style={{ height: 14, width: '60%' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length > 0 ? (
                    <>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: 20 }}>
                            Showing {filtered.length} event{filtered.length !== 1 ? 's' : ''}
                            {category && ` in ${category}`}
                            {search && ` matching "${search}"`}
                        </p>
                        <div className="events-grid">
                            {filtered.map((event) => (
                                <EventCard key={event.entityKey} event={event} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="empty-state">
                        <Search size={64} />
                        <h3>No events found</h3>
                        <p>
                            {search
                                ? `No events matching "${search}". Try adjusting your search.`
                                : category
                                    ? `No events in the ${category} category yet.`
                                    : 'No events available yet. Check back soon!'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
