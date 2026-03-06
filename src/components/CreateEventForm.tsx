'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { createEvent, updateEvent, CATEGORIES, type EventData, type ParsedEvent } from '@/lib/entities';
import { parseTransactionError } from '@/lib/errors';
import ImageUpload from './ImageUpload';
import { Loader2, Plus, Save } from 'lucide-react';

interface CreateEventFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    existingEvent?: ParsedEvent; // If provided, form is in edit mode
}

export default function CreateEventForm({ onSuccess, onCancel, existingEvent }: CreateEventFormProps) {
    const { address, connector } = useWallet();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const isEditMode = !!existingEvent;

    const [form, setForm] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        city: '',
        category: 'tech',
        capacity: '50',
        tags: '',
    });

    // Pre-fill form when in edit mode
    useEffect(() => {
        if (existingEvent) {
            setForm({
                title: existingEvent.title || '',
                description: existingEvent.description || '',
                date: existingEvent.date || '',
                time: existingEvent.time || '',
                location: existingEvent.location || '',
                city: existingEvent.city || '',
                category: existingEvent.category || 'tech',
                capacity: String(existingEvent.capacity || 50),
                tags: (existingEvent.tags || []).join(', '),
            });
            // If the event has an existing image, show it as preview
            if (existingEvent.imageKey) {
                setImagePreview(existingEvent.imageKey);
            }
        }
    }, [existingEvent]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleImageSelect = (file: File) => {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleClearImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!address || !connector) {
            setError('Please connect your wallet first.');
            return;
        }

        if (!form.title || !form.date || !form.time || !form.location || !form.city) {
            setError('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            let imageBase64: string | undefined;

            // Convert new image to base64 if provided
            if (imageFile) {
                imageBase64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(imageFile);
                });
            }

            const eventData: EventData = {
                title: form.title,
                description: form.description,
                date: form.date,
                time: form.time,
                location: form.location,
                city: form.city,
                category: form.category,
                capacity: parseInt(form.capacity),
                tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                imageKey: imageBase64 || (isEditMode ? existingEvent?.imageKey : undefined),
            };

            if (isEditMode && existingEvent) {
                await updateEvent(connector, address, existingEvent.entityKey, eventData);
            } else {
                await createEvent(connector, address, eventData);
            }
            onSuccess?.();
        } catch (err) {
            console.error(`Failed to ${isEditMode ? 'update' : 'create'} event:`, err);
            setError(parseTransactionError(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="create-event-form">
            <div className="form-group full-width">
                <label className="form-label">Event Image</label>
                <ImageUpload
                    onImageSelect={handleImageSelect}
                    preview={imagePreview}
                    onClear={handleClearImage}
                />
            </div>

            <div className="form-group full-width">
                <label className="form-label">Event Title *</label>
                <input
                    name="title"
                    className="form-input"
                    placeholder="e.g., Web3 Builder Meetup"
                    value={form.title}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group full-width">
                <label className="form-label">Description</label>
                <textarea
                    name="description"
                    className="form-input"
                    placeholder="Describe your event..."
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                    name="date"
                    type="date"
                    className="form-input"
                    value={form.date}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">Time *</label>
                <input
                    name="time"
                    type="time"
                    className="form-input"
                    value={form.time}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">Location *</label>
                <input
                    name="location"
                    className="form-input"
                    placeholder="e.g., 123 Main St, Room 201"
                    value={form.location}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">City *</label>
                <input
                    name="city"
                    className="form-input"
                    placeholder="e.g., New York"
                    value={form.city}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">Category</label>
                <select
                    name="category"
                    className="form-input"
                    value={form.category}
                    onChange={handleChange}
                >
                    {CATEGORIES.map((cat) => (
                        <option key={cat.name} value={cat.name.toLowerCase()}>
                            {cat.emoji} {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Capacity</label>
                <input
                    name="capacity"
                    type="number"
                    min="1"
                    className="form-input"
                    value={form.capacity}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group full-width">
                <label className="form-label">Tags</label>
                <input
                    name="tags"
                    className="form-input"
                    placeholder="e.g., web3, meetup, networking (comma separated)"
                    value={form.tags}
                    onChange={handleChange}
                />
            </div>

            {error && (
                <div className="error-message full-width">
                    {error}
                </div>
            )}

            <div className="form-group full-width" style={{ display: 'flex', flexDirection: 'row', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                {onCancel && (
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>
                        Cancel
                    </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? (
                        <>
                            <Loader2 size={16} className="spin" />
                            {isEditMode ? 'Updating...' : 'Creating...'}
                        </>
                    ) : (
                        <>
                            {isEditMode ? <Save size={16} /> : <Plus size={16} />}
                            {isEditMode ? 'Update Event' : 'Create Event'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
