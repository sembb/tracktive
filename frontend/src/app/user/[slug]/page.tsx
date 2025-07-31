import { notFound } from 'next/navigation';
import Image from 'next/image';

export default async function Page({params, }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const apiUrl = process.env.NEXT_PUBLIC_API_ADDRESS || 'http://localhost:8000';
    const res = await fetch(`${apiUrl}/api/user/${slug}`, {
        next: { revalidate: 60 }, // ISR: regenerate page every 60 seconds
    });

if (!res.ok) {
  let errorDetails = '';
  try {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const json = await res.json();
      errorDetails = JSON.stringify(json, null, 2); // Pretty-printed JSON
    } else {
      errorDetails = await res.text(); // Fallback to plain text
    }
  } catch (e) {
    errorDetails = 'Could not parse error response';
  }

  console.error(`Fetch failed (${res.status} ${res.statusText}):\n${errorDetails}`);
  notFound(); // or throw new Error(errorDetails)
}
    const profile = await res.json();
    console.log(profile);
    return(
        <div className="container mx-auto">
            <div>
                <div className='flex items-center gap-2'>
                    <Image className='flex-shrink-0 object-cover mx-1 rounded-full w-9 h-9' src={profile.profile?.avatar_url ? `${apiUrl}/storage/${profile.profile?.avatar_url}` : '/images/dummy.png'} width={50} height={50} alt='profile picture'></Image>
                    <div>
                        {profile.name}
                    </div>
                </div>
                <div>
                    {profile.profile?.bio}
                </div>
            </div>
        </div>
    )
}