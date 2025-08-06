import { notFound } from 'next/navigation';
import Image from 'next/image';

interface Movie {
  title: string;
  release_date: string;
  image_url: string;
}

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

	const normalizedMovie = {
		title: movie.title,
		release_date: movie.release_date,
		image_url: movie.poster_path || movie.image_url, // eerst API, anders DB
		cast: movie.people,
	}

    return(
        <div className="container mx-auto">
			<div className='grid grid-cols-[500px_auto] gap-12'>
				<div>
					<Image
						src={`https://image.tmdb.org/t/p/w500/${normalizedMovie.image_url}`}
						width={500}
						height={500}
						alt="Movie poster"
					/>
				</div>
				<div>
					<h1>{normalizedMovie.title}</h1>
					<span>{normalizedMovie.release_date}</span>
					<div className='flex gap-1 flex-wrap'>{normalizedMovie.cast.map(castmember => (
						<span className='inline-flex items-center rounded-md bg-pink-50 px-2 py-1 text-xs font-medium text-pink-700 ring-1 ring-pink-700/10 ring-inset'>{castmember.name} - {castmember.pivot.character_name}</span>
					))}</div>
				</div>
			</div>
        </div>
    )
}