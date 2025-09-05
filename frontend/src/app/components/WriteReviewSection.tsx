'use client';

import { useState, useEffect, useRef } from "react";
import { MediaLikeButton } from "./MediaLikeButton";
import { fetchUserFromServer } from "../../../lib/user";
import ReviewCard from "./ReviewCard";

export default function WriteReviewSection({media}: any) {

    const [value, setValue] = useState(50);
    const rangeRef = useRef<HTMLInputElement>(null);
    const [loggedIn, setLoggedIn] = useState(null);
    const [userReview, setUserReview] = useState(null);

    useEffect(() => {
        async function fetchUser() {
            const user = await fetchUserFromServer(media.id);
            setLoggedIn(user);
            if(user?.reviewdetails.score || user?.reviewdetails.review || user?.reviewdetails.date){
                setUserReview(user?.reviewdetails ?? null);
            }else{
                setUserReview(null);
            }
        }
        fetchUser();
    }, []);

    console.log('user state:', userReview);

    // Compute the gradient based on value
    const getGradient = (val: number) => {
        return `linear-gradient(to right, 
        rgb(${255 - Math.round((val / 100) * 255)}, ${Math.round((val / 100) * 255)}, 0) 0%, 
        rgb(${255 - Math.round((val / 100) * 255)}, ${Math.round((val / 100) * 255)}, 0) ${val}%, 
        #ddd ${val}%, 
        #ddd 100%)`;
    };

    // Update the background whenever value changes
    useEffect(() => {
        if (rangeRef.current) {
            rangeRef.current.style.background = `linear-gradient(to right, ${getGradient(value)} 0%, ${getGradient(value)} ${value}%, #ddd ${value}%, #ddd 100%)`;
        }
    }, [value]);

    console.log(loggedIn);
    console.log(media);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const apiUrl = process.env.NEXT_PUBLIC_API_ADDRESS || 'http://localhost:8000';
        const URL = `${apiUrl}/api/media/createreview`;
        const response = await fetch(URL, {
            method: 'POST',
            body: JSON.stringify({
                mediaId: media.id,
                score: formData.get('score'),
                review: formData.get('review'),
            }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
        });

        if (response.ok) {
            // Optionally, close the modal or reset the form here
            const dialog = document.getElementById('my_modal_3') as HTMLDialogElement;
            dialog.close();
            setUserReview({
                score: formData.get('score'),
                review: formData.get('review'),
                date: new Date().toISOString(),
            });
        } else {
            alert('Failed to submit review.');
        }
    }

    console.log('user state:', userReview);

    return(
        loggedIn ? (
        <div>
            {userReview ? (
                <ReviewCard {...userReview} {...loggedIn.user} />
            ) : null}
            <button className="btn" onClick={()=>document.getElementById('my_modal_3').showModal()}>Write a review</button>
            <dialog id="my_modal_3" className="modal">
            <div className="modal-box">
                <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <h3 className="font-bold text-lg">Write a review for {media.title}</h3>
                <form onSubmit={handleSubmit}>
                    <fieldset className="fieldset grid-cols-2">
                        <div>
                            <legend className="fieldset-legend">Review score</legend>
                            <div className="flex flex-col gap-6">
                                <input
                                defaultValue={loggedIn.reviewdetails.score ?? ''}
                                type="number"
                                name="score"
                                className="input input-xl validator text-3xl w-30 text-center"
                                required
                                placeholder="1-100"
                                min="1"
                                max="100"
                                title="Must be between be 1 to 100"
                                onChange={(e) => setValue(Number(e.target.value))}
                                ref={rangeRef}
                                style={{ color: `rgb(${255 - Math.round((value / 100) * 255)}, ${Math.round((value / 100) * 255)}, 0)` }}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3">
                            <MediaLikeButton id={media.id} init={loggedIn} action='like' type={media.mediatype} />
                            <MediaLikeButton id={media.id} init={loggedIn} action='consumed' type={media.mediatype} />
                            <MediaLikeButton id={media.id} init={loggedIn} action='wishlist' type={media.mediatype} />
                        </div>
                    </fieldset>
                
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Your review</legend>
                        <textarea defaultValue={loggedIn.reviewdetails.review ?? ''} name="review" className="textarea textarea-bordered w-full" placeholder="Write your review here..."></textarea>
                    </fieldset>
                    <input type="submit" value="Submit" className="btn mt-2" />
                </form>
                <p className="py-4">Press ESC key or click on ✕ button to close</p>
            </div>
            </dialog>
        </div>
        ) : (
            <div>
                Log in to write a review
            </div>
        )
    );
}