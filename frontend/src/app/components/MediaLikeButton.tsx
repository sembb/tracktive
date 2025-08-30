import React from 'react'

import { useMediaStore } from '../../../lib/stores/mediaStore';
import { initializeMediaStore } from '../../../lib/stores/mediaStore';
import { useState } from 'react';

type MediaLikeButtonProps = {
  id: string;
  likedinit: any;
};

export const MediaLikeButton = ({ id, likedinit }: MediaLikeButtonProps) => {
    initializeMediaStore(likedinit)
    const { liked, setLiked } = useMediaStore();
    const [isLiking, setIsLiking] = useState(false);

    const toggleLike = async () => {
        if (isLiking) return; // prevent double click
        setIsLiking(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_ADDRESS || 'http://localhost:8000';
            const URL = `${apiUrl}/api/media/action`;
            console.log('Sending like request with query:', URL);
            const res = await fetch(URL, {
                method: 'POST',
                body: JSON.stringify({
                    mediaId: id, // <-- send the real ID
                    action: 'like', // <-- send the string directly
                }),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                },
            });
            if (res.ok) {
                setLiked(!liked);
            }

            if (res.status === 401) {
                // Not authenticated → redirect on the frontend
                window.location.href = '/login';
            }
        } finally {
            setIsLiking(false);
            console.log(liked);
        }
    };

    return (
        <div>
            <legend className="fieldset-legend">Liked?</legend>
            <label className="swap">
                <input
                        type="checkbox"
                        checked={liked}
                        onChange={toggleLike}
                    />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-14 swap-off">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>

                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-14 swap-on">
                    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                </svg>

            </label>
        </div>
    )
    
}