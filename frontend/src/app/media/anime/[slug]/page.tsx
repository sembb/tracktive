import { notFound } from 'next/navigation';
import Image from 'next/image';
import CastList from './CastList';
import DOMPurify from 'dompurify';
import SafeDescription from '@/app/components/SafeDescription';

interface Anime {
  title: string;
  release_date: string;
  image_url: string;
}

async function getAnime(id: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_ADDRESS || 'http://localhost:8000';
  console.log('API URL:', apiUrl);

  const url = `${apiUrl}/api/media/anime?id=${id}`;
  console.log('Fetching URL:', url);

  try {
    const res = await fetch(url, { cache: 'no-store' });
    console.log('Response status:', res.status);
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response body:', errorText);
      throw new Error(`Failed to fetch anime: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Anime data:', data);
    return data;
  } catch (error) {
    console.error('Error in getAnime:', error);
    throw error;
  }
}


export default async function Page({params, }: { params: Promise<{ slug: string }> }) {
    const {slug} = await params;
    const anime = await getAnime(slug);

	console.log('Normalized anime data:', anime);

	const metadata = typeof anime.metadata_json === 'string'
		? JSON.parse(anime.metadata_json)
		: anime.metadata_json || '';

	const normalizedAnime = {
		title: anime.title || 'Untitled',
		release_date: anime.release_date,
        image_url: anime.poster_path || anime.image_url, // first API, otherwise DB
        description: anime.description || anime.overview || '', // fallback to overview if description is not available
		cast:  anime.people || [],
	}

	console.log('Normalized anime:', normalizedAnime.cast);

    return(
        <div className="container mx-auto">
			<div className='grid grid-cols-[500px_auto] gap-12'>
				<div>
					<Image
						src={`${normalizedAnime.image_url}`}
						width={500}
						height={500}
						alt="Anime poster"
					/>
				</div>
				<div>
					<h1 className='font-bebas text-6xl'>{normalizedAnime.title}</h1>
          			<span className='block italic mb-4'>{normalizedAnime.tagline}</span>
					<span>{normalizedAnime.release_date}</span>
          			<div className="my-4">
						<SafeDescription html={normalizedAnime.description} />
					</div>
					<CastList cast={normalizedAnime.cast} />
				</div>
			</div>
        </div>
    )
}