'use client';

import { Search } from 'lucide-react';
import { CATEGORIES } from '@/lib/entities';

interface EventFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export default function EventFilters({
    search,
    onSearchChange,
    activeCategory,
    onCategoryChange,
}: EventFiltersProps) {
    return (
        <div className="filters-bar">
            <div className="search-input-wrapper">
                <Search size={16} />
                <input
                    type="text"
                    placeholder="Search events..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <div className="filter-chips">
                <button
                    className={`filter-chip ${activeCategory === '' ? 'active' : ''}`}
                    onClick={() => onCategoryChange('')}
                >
                    All
                </button>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.name}
                        className={`filter-chip ${activeCategory === cat.name.toLowerCase() ? 'active' : ''}`}
                        onClick={() =>
                            onCategoryChange(
                                activeCategory === cat.name.toLowerCase()
                                    ? ''
                                    : cat.name.toLowerCase()
                            )
                        }
                    >
                        {cat.emoji} {cat.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
