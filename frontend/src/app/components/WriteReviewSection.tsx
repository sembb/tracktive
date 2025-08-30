'use client';

import { useState, useEffect, useRef } from "react";
import { MediaLikeButton } from "./MediaLikeButton";
import { fetchUserFromServer } from "../../../lib/user";

export default function WriteReviewSection({media}: any) {

    const [value, setValue] = useState(50);
    const rangeRef = useRef<HTMLInputElement>(null);
    const [loggedIn, setLoggedIn] = useState(null);

    useEffect(() => {
        async function fetchUser() {
        const user = await fetchUserFromServer();
        setLoggedIn(user);
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
    console.log('Rendering WriteReviewSection for media:', media.id);

    return(
        loggedIn && (
        <div>
            
            <button className="btn" onClick={()=>document.getElementById('my_modal_3').showModal()}>Write a review</button>
            <dialog id="my_modal_3" className="modal">
            <div className="modal-box">
                <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <h3 className="font-bold text-lg">Write a review for {media.title}</h3>
                <fieldset className="fieldset grid-cols-2">
                    <div>
                        <legend className="fieldset-legend">Review score</legend>
                        <div className="flex flex-col gap-6">
                            <input
                            type="number"
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

                    <MediaLikeButton id={media.id} />
                </fieldset>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Your review</legend>
                    <textarea className="textarea textarea-bordered w-full" placeholder="Write your review here..."></textarea>
                </fieldset>
                <input type="submit" value="Submit" className="btn" />
                <p className="py-4">Press ESC key or click on ✕ button to close</p>
            </div>
            </dialog>
        </div>
        )
    );
}