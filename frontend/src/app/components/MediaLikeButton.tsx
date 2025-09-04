import React from 'react'

import { useMediaStore } from '../../../lib/stores/mediaStore';
import { initializeMediaStore } from '../../../lib/stores/mediaStore';
import { useEffect, useState } from 'react';

type MediaLikeButtonProps = {
  id: string;
  init: any;
  action: string;
  type: string;
};

export const MediaLikeButton = ({ id, init, action, type }: MediaLikeButtonProps) => {
    const stateMap = {
        like: useMediaStore((s) => s.liked),
        consumed: useMediaStore((s) => s.consumed),
        wishlist: useMediaStore((s) => s.wishlist),
    };

    const setterMap = {
        like: useMediaStore((s) => s.setLiked),
        consumed: useMediaStore((s) => s.setConsumed),
        wishlist: useMediaStore((s) => s.setWishlist),
    };

    const active = stateMap[action];
    const setActive = setterMap[action];
    const [isLiking, setIsLiking] = useState(false);

    useEffect(() => {
        initializeMediaStore(init);
    }, [init]);

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
                    mediaId: id,
                    action: action,
                }),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                },
            });
            if (res.ok) {
                setActive(!active);
            }

            if (res.status === 401) {
                // Not authenticated → redirect on the frontend
                window.location.href = '/login';
            }
        } finally {
            setIsLiking(false);
            console.log(active);
        }
    };

    let legendText = null;

    if(action == 'like'){
        legendText = "Liked?"
    }else if(action == 'consumed'){
        if(type == 'music'){
            legendText = "Listened?"
        }else if(type == 'movie'){
            legendText = 'Watched?'
        }
    }else if(action == 'wishlist'){
        if(type == 'music'){
            legendText = "Listen later"
        }else if(type == 'movie'){
            legendText = 'Watch later'
        }
    }

    return (
        <div>
            <legend className="fieldset-legend">{legendText}</legend>
            <label className="swap">
                <input
                        type="checkbox"
                        checked={active}
                        onChange={toggleLike}
                    />
                { action == 'like' ? (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-14 swap-off">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-14 swap-on">
                        <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                    </svg>
                </>
                ): action == 'consumed' ? (
                    type == 'music' ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-14 swap-off">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-14 swap-on">
                                <path fillRule="evenodd" d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" clipRule="evenodd" />
                            </svg>
                        </>
                    ): type == 'movie' ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-14 swap-off">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-14 swap-on">
                                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                                <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
                            </svg>
                        </>
                    ): null
                ): action == 'wishlist' ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-14 swap-off">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m3 3 1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 0 1 1.743-1.342 48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664 19.5 19.5" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-14 swap-on">
                            <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
                        </svg>
                    </>
                ): null }

            </label>
        </div>

    )
    
}