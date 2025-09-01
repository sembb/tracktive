import { notFound } from 'next/navigation';
import Image from 'next/image';
import WriteReviewSection from '@/app/components/WriteReviewSection';
import { useState } from 'react';
import { initializeMediaStore } from '../../../../../lib/stores/mediaStore';

interface Movie {
  title: string;
  release_date: string;
  image_url: string;
}

async function getMovie(id: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_ADDRESS || 'http://localhost:8000';
  console.log('API URL:', apiUrl);

  const url = `${apiUrl}/api/media/album?id=${id}`;
  console.log('Fetching URL:', url);

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

	console.log('Normalized movie data:', movie);

	const metadata = typeof movie.metadata_json === 'string'
		? JSON.parse(movie.metadata_json)
		: movie.metadata_json || '';

	const normalizedMovie = {
		id: movie.id,
		mediatype: 'music',
		title: movie.title,
		release_date: movie.release_date,
		image_url: movie.poster_path || movie.image_url, // eerst API, anders DB
		cast: movie.people,
		description: movie.description || movie.overview || '', // fallback to overview if description is not available
		tagline: metadata.tagline || movie.tagline || '',
		runtime: metadata.runtime || movie.runtime || 0, // fallback to movie runtime if metadata is not available
		liked: movie.liked || false,
	}

	initializeMediaStore({liked: normalizedMovie.liked});

    return(
        <div className="container mx-auto">
			<div className='grid grid-cols-[500px_auto] gap-12'>
				<div>
					<Image
						src={`${normalizedMovie.image_url}`}
						width={500}
						height={500}
						alt="Album cover"
					/>
				</div>
				<div>
					<h1 className='font-bebas text-6xl'>{normalizedMovie.title}</h1>
          			<span className='block italic mb-4'>{normalizedMovie.tagline}</span>
					<span>{normalizedMovie.release_date}</span>
          			<div className='my-4'>{normalizedMovie.description}</div>
				</div>
				<WriteReviewSection media={normalizedMovie} />
			</div>
        </div>
    )
}