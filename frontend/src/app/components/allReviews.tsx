'use client';

import { useEffect } from "react";
import { useState } from "react";
import ReviewCard from "./ReviewCard";

export default function AllReviews({ mediaId }: { mediaId: string }) {

    console.log('media:', mediaId);
    console.log('external_id type:', typeof mediaId);

    const [reviews, setReviews] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    useEffect(() => {
        // Fetch all reviews from the server
        const apiUrl = process.env.NEXT_PUBLIC_API_ADDRESS || 'http://localhost:8000';
        fetch(`${apiUrl}/api/media/reviews/${mediaId}?page=${page}`)
            .then((res) => res.json())
            .then((data) => {
                console.log('reviews:', data.data);
                setReviews(data.data);
                setLastPage(data.last_page);
                
            });
    }, [page]);

    const getPageNumbers = () => {
        const delta = 2; // how many pages to show around current
        const range: (number | string)[] = [];
        const rangeWithDots: (number | string)[] = [];
        let l: number | null = null;

        for (let i = 1; i <= lastPage; i++) {
        if (i === 1 || i === lastPage || (i >= page - delta && i <= page + delta)) {
            range.push(i);
        }
        }

        for (let i of range) {
        if (l !== null) {
            if ((i as number) - l === 2) {
            rangeWithDots.push(l + 1);
            } else if ((i as number) - l !== 1) {
            rangeWithDots.push("...");
            }
        }
        rangeWithDots.push(i);
        l = i as number;
        }

        return rangeWithDots;
    };

    

    return (
        reviews.length > 0 ? (
        <>
            {reviews.map((review) => (
                <div className="my-8"><ReviewCard {...review} {...review.user} /></div>
            ))}

            <div>
                <span className="block mb-2">Page {page} of {lastPage}</span>
                <div className="flex gap-1">
                    <button className="btn" onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</button>

                    {getPageNumbers().map((p, idx) =>
                        p === "..." ? (
                            <span key={idx}>...</span>
                        ) : (
                            <button
                            key={idx}
                            onClick={() => setPage(p as number)}
                            className={p === page ? "font-bold underline btn" : "btn"}
                            >
                            {p}
                            </button>
                        )
                    )}

                    <button className="btn" onClick={() => setPage(page + 1)} disabled={page === lastPage}>Next</button>
                </div>
            </div>
        </>
        ) : <p>No reviews yet.</p>
    );
}