'use client';

import { useState, useEffect, useRef } from "react";

export default function WriteReviewSection({media}: any) {

    const [value, setValue] = useState(50);
    const rangeRef = useRef<HTMLInputElement>(null);

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

    return(
        <div><button className="btn" onClick={()=>document.getElementById('my_modal_3').showModal()}>Write a review</button>
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

                    <div>
                        <legend className="fieldset-legend">Liked?</legend>
                        <label className="swap">
                            <input type="checkbox" />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-14 swap-off">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                            </svg>

                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-14 swap-on">
                                <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                            </svg>

                        </label>
                    </div>
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
    );
}