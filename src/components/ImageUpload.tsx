'use client';

import { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
    onImageSelect: (file: File) => void;
    preview: string | null;
    onClear: () => void;
}

// Helper to compress image down to max 800x800 and 70% quality WebP
async function compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                const MAX_SIZE = 800;
                if (width > height && width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                } else if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Canvas to Blob failed'));
                            return;
                        }
                        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                            type: 'image/webp',
                        });
                        resolve(compressedFile);
                    },
                    'image/webp',
                    0.7 // 70% quality
                );
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = event.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

export default function ImageUpload({ onImageSelect, preview, onClear }: ImageUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const processFile = async (file: File) => {
        if (!file.type.startsWith('image/')) return;

        setIsCompressing(true);
        try {
            const compressedFile = await compressImage(file);
            onImageSelect(compressedFile);
        } catch (err) {
            console.error('Failed to compress image, using original', err);
            onImageSelect(file);
        } finally {
            setIsCompressing(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            await processFile(file);
        }
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    return (
        <div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                style={{ display: 'none' }}
            />
            {preview ? (
                <div className="image-upload has-image" style={{ position: 'relative' }}>
                    <img src={preview} alt="Preview" />
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onClear();
                        }}
                        style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: 'rgba(0,0,0,0.7)',
                            border: 'none',
                            borderRadius: '50%',
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white',
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div
                    className={`image-upload ${isDragging ? 'dragging' : ''}`}
                    onClick={handleClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={isDragging ? { borderColor: 'var(--accent)', background: 'var(--accent-bg)' } : {}}
                >
                    <div className="image-upload-text">
                        {isCompressing ? (
                            <>
                                <ImageIcon size={32} className="spin" style={{ animation: 'spin 2s linear infinite' }} />
                                <p>Compressing...</p>
                            </>
                        ) : (
                            <>
                                {isDragging ? <Upload size={32} /> : <ImageIcon size={32} />}
                                <p>{isDragging ? 'Drop image here' : 'Click or drag to upload image'}</p>
                                <span>Images are compressed automatically</span>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
