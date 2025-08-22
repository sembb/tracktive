<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\MediaItem;

class TmdbDetailFetchService implements MediaDetailFetcherInterface
{
    public function fetch(string|int $id): array
    {
        $token = config('services.tmdb.token');

        [$details, $credits] = Http::pool(fn ($pool) => [
            $pool->withToken($token)->get("https://api.themoviedb.org/3/movie/{$id}"),
            $pool->withToken($token)->get("https://api.themoviedb.org/3/movie/{$id}/credits"),
        ]);

        if (!($details->successful() && $credits->successful())) {
            throw new \RuntimeException('Movie or cast could not be found');
        }

        $mediaitem = $details->json();
        $crew = collect($credits->json()['crew']);

        $cast = collect($credits->json()['cast'] ?? [])->map(function ($member) {
            return [
                'original_name' => $member['name'] ?? 'Unknown',
                'character' => $member['original_name'] ?? '',
                'character_image_url' => null,
                'actor_image_url' => $member['profile_path'] ?? null,
                'type' => 'actor',
            ];
        });

        $director = $crew->firstWhere('job', 'Director');
        $mainActors = $cast->take(15)->map(fn ($person) => [
            'name' => $person['original_name'],
            'image_url' => $person['actor_image_url'] ?? null,
            'pivot' => [
                'character_name' => $person['character'], 
                'image_url' => $person['character_image_url'] ?? null
            ],
        ]);

        return [
            'details' => 
                [
                    'id' => $mediaitem['id'],
                    'title' => $mediaitem['title'],
                    'overview' => $mediaitem['overview'],
                    'release_date' => $mediaitem['release_date'],
                    'poster_path' => $mediaitem['poster_path'],
                    'genres' => $mediaitem['genres'],
                    'director' => $director['name'] ?? null,
                    'people' => $mainActors,
                    'runtime' => $mediaitem['runtime'] ?? 0,
                    'budget' => $mediaitem['budget'],
                    'revenue' => $mediaitem['revenue'],
                    'tagline' => $mediaitem['tagline'] ?? '',
                ],
            'crew' => collect($crew),
            'cast' => collect($cast),
            ];
    }

    public function searchMovies(string $query): \Illuminate\Support\Collection
    {
            $externalResponse = Http::withToken(config('services.tmdb.token'))
            ->get('https://api.themoviedb.org/3/search/movie', [
                'query' => $query
            ]);

            $externalRaw = $externalResponse->json()['results'] ?? [];

            $localResults = MediaItem::where('title', 'like', '%' . $query . '%')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->external_id,
                    'title' => $item->title,
                    'type' => $item->type,
                    'source' => 'cached',
                ];
            });

            $localExternalIds = $localResults->pluck('id')->filter()->toArray();

            $externalResults = collect($externalRaw)->filter(function ($item) use ($localExternalIds) {
                return !in_array((string) ($item['id'] ?? ''), $localExternalIds);
            })->map(function ($item) {
                return [
                    'id' => $item['id'],
                    'title' => $item['title'] ?? 'Untitled',
                    'source' => 'external',
                ];
            });

            return $localResults->concat($externalResults)->values();
    }
}
