<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

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
        $cast = collect($credits->json()['cast']);

        $director = $crew->firstWhere('job', 'Director');
        $mainActors = $cast->take(15)->map(fn ($person) => [
            'name' => $person['name'],
            'pivot' => ['character_name' => $person['character']],
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
}
