'use client';

import { useState, useEffect, useRef } from "react";
import { MediaLikeButton } from "./MediaLikeButton";
import { fetchUserFromServer } from "../../../lib/user";
import ReviewCard from "./ReviewCard";
import AllReviews from "./allReviews";

export default function WriteReviewSection({media}: any) {

    const [value, setValue] = useState(50);
    const rangeRef = useRef<HTMLInputElement>(null);
    const [loggedIn, setLoggedIn] = useState(null);
    const [userReview, setUserReview] = useState(null);

    useEffect(() => {
        async function fetchUser() {
            const user = await fetchUserFromServer(media.id);
            console.log('user state:', user);
            setLoggedIn(user);
            if(user?.reviewdetails.rating || user?.reviewdetails.review_text || user?.reviewdetails.date){
                setUserReview(user?.reviewdetails ?? null);
            }else{
                setUserReview(null);
            }
        }
        fetchUser();
    }, []);

    

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
                rating: formData.get('rating'),
                review_text: formData.get('review_text'),
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
                rating: formData.get('rating'),
                review_text: formData.get('review_text'),
                date: new Date().toISOString(),
            });
        } else {
            alert('Failed to submit review.');
        }
    }

    console.log('user review:', userReview);

    return(
        <>
            {loggedIn ? (
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
                                <legend className="fieldset-legend">Review rating</legend>
                                <div className="flex flex-col gap-6">
                                    <input
                                    defaultValue={loggedIn.reviewdetails.rating ?? ''}
                                    type="number"
                                    name="rating"
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
                            <textarea defaultValue={loggedIn.reviewdetails.review_text ?? ''} name="review_text" className="textarea textarea-bordered w-full" placeholder="Write your review here..."></textarea>
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
            )}
            <AllReviews mediaId={media.id} />
        </>
    );
}