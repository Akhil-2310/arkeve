'use client';

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { createOrganizerProfile } from '@/lib/entities';
import { parseTransactionError } from '@/lib/errors';
import ImageUpload from './ImageUpload';
import { Loader2, User } from 'lucide-react';

interface OrganizerSetupProps {
    onSuccess: () => void;
}

export default function OrganizerSetup({ onSuccess }: OrganizerSetupProps) {
    const { address, connector } = useWallet();
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [twitter, setTwitter] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!address || !connector || !name.trim()) return;

        setSubmitting(true);
        setError('');

        try {
            let avatarData: string | undefined;

            // Convert avatar to base64 if provided
            if (avatarFile) {
                avatarData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(avatarFile);
                });
            }

            await createOrganizerProfile(connector, address, {
                name: name.trim(),
                bio: bio.trim(),
                avatar: avatarData,
                twitter: twitter.trim() || undefined,
            });

            onSuccess();
        } catch (err: unknown) {
            console.error('Failed to create organizer:', err);
            setError(parseTransactionError(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">
                    <User size={14} />
                    Display Name *
                </label>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Your name or org name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                    className="form-input"
                    placeholder="Tell attendees about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Profile Picture</label>
                <ImageUpload
                    onImageSelect={(file: File) => {
                        setAvatarFile(file);
                        const reader = new FileReader();
                        reader.onload = () => setAvatarPreview(reader.result as string);
                        reader.readAsDataURL(file);
                    }}
                    preview={avatarPreview}
                    onClear={() => { setAvatarFile(null); setAvatarPreview(null); }}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Twitter Handle</label>
                <input
                    type="text"
                    className="form-input"
                    placeholder="@username"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={submitting || !name.trim()}
                style={{ width: '100%', marginTop: 16 }}
            >
                {submitting ? (
                    <>
                        <Loader2 size={18} className="spin" />
                        Creating Profile...
                    </>
                ) : (
                    'Create Organizer Profile'
                )}
            </button>
        </form>
    );
}
