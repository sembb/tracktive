import { notFound } from 'next/navigation';
import Image from 'next/image';

async function getMovie(id: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_ADDRESS || 'http://localhost:8000';

  try {
    const res = await fetch(`${apiUrl}/api/media/movies?id=${id}`, {
      cache: 'no-store',
    });

    // Log the raw response status and headers
    console.log('Response status:', res.status);
    console.log('Response headers:', [...res.headers.entries()]);

    if (!res.ok) {
      const errorText = await res.text(); // get text for more info
      console.error('Failed to fetch movie:', errorText);
      throw new Error(`Failed to fetch movie: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Movie data:', data);
    return data;
  } catch (error) {
    console.error('Error in getMovie:', error);
    throw error;
  }
}

export default async function Page({params, }: { params: Promise<{ slug: string }> }) {
    const {slug} = await params;
    const movie = await getMovie(slug);
    return(
        <div className="container mx-auto">
            <div>
                <h1>{movie.title}</h1>
                <span>{movie.release_date}</span>
            </div>
        </div>
    )
}