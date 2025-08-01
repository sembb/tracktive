import { notFound } from 'next/navigation';
import Image from 'next/image';

async function getMovie(id: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_ADDRESS || 'http://localhost:8000';
    const res = await fetch(`${apiUrl}/api/media/movies?id=${id}`, {
        cache: 'no-store', // ensures SSR like getServerSideProps
    });

    if (!res.ok) throw new Error('Failed to fetch movie');
    return res.json();
}

export default async function Page({params, }: { params: Promise<{ slug: string }> }) {
    const {slug} = await params;
    const movie = await getMovie(slug);
    return(
        <div className="container mx-auto">
            <div>
            </div>
        </div>
    )
}