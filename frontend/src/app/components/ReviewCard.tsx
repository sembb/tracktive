'use client';

import Image from 'next/image';

interface ReviewCardProps extends UserProps {
  rating: number;
  review_text: string;
  created_at: string; // ISO-string of formatted date
}

interface UserProps {
    name: string;
    profile?: object; // optioneel, fallback als leeg
}

export default function ReviewCard({
  name,
  profile,
  rating,
  review_text,
  created_at,
}: ReviewCardProps) {
    const apiUrl = process.env.NEXT_PUBLIC_API_ADDRESS || 'http://localhost:8000';

    return (
        <div className="card bg-base-200 shadow-xl p-4 rounded-2xl w-full">
            <div className="flex items-center gap-4 mb-3">
                <div className="avatar">
                    <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <Image
                        src={`${apiUrl}/storage/${profile?.avatar_url}` || '/default-avatar.png'}
                        alt={`${name}'s avatar`}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                        />
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-lg">{name}</h4>
                    <span className="text-sm opacity-70">{new Date(created_at).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="mb-2">
                <span className="badge badge-primary text-sm">
                rating: {rating}/100
                </span>
            </div>

            <p className="text-base">{review_text}</p>
        </div>
    );
}
