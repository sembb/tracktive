import { notFound } from 'next/navigation';
import Image from 'next/image';
import CastList from './CastList';

interface Movie {
  title: string;
  release_date: string;
  image_url: string;
}

async function getMovie(id: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_ADDRESS || 'http://localhost:8000';
  console.log('API URL:', apiUrl);

  const url = `${apiUrl}/api/media/movies?id=${id}`;
  console.log('Fetching URL:', url);

  try {
    // Simple test fetch
    await fetch('https://jsonplaceholder.typicode.com/todos/1');
  } catch (testError) {
    console.error('Fetch test failed:', testError);
  }

  try {
    const res = await fetch(url, { cache: 'no-store' });
    console.log('Response status:', res.status);
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response body:', errorText);
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
					<h1 className='font-bebas text-6xl'>{normalizedMovie.title}</h1>
					<span>{normalizedMovie.release_date}</span>
					<CastList cast={normalizedMovie.cast} />
				</div>
			</div>
        </div>
    )
}