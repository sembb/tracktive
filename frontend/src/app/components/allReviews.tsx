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
                setReviews(data.data);
                setLastPage(data.meta.last_page);
            });
            console.log(reviews);
    }, [page]);

    

    return (
        <>
            {reviews.map((review) => (
                <ReviewCard {...review} {...review.user} />
            ))}
        </>
    );
}