<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MusicDetailFetchService implements MediaDetailFetcherInterface
{
    public function fetch(string|int $id, string $subtype): array
    {

        switch ($subtype) {
            case 'album':
                $url = "https://api.deezer.com/album/{$id}";
                break;
            case 'track':
                $url = "https://api.deezer.com/track/{$id}";
                break;
            case 'artist':
                $url = "https://api.deezer.com/artist/{$id}";
                break;
            default:
                throw new \InvalidArgumentException("Unknown subtype: $subtype");
        }

        $details = Http::get($url);

        if (!($details->successful())) {
            throw new \RuntimeException('Movie or cast could not be found');
        }

        $mediaitem = $details->json();
        $crew = collect([]);
        $cast = collect([]);

        return [
            'details' => 
                [
                    'id' => $mediaitem['id'],
                    'title' => $mediaitem['title'],
                    'overview' => null,
                    'release_date' => $mediaitem['release_date'],
                    'poster_path' => $mediaitem['cover_big'] ?? null,
                    'genres' => null,
                    'director' => null,
                    'people' => null,
                    'runtime' => $mediaitem['duration'] ?? 0,
                    'budget' => null,
                    'revenue' => null,
                    'tagline' => null,
                ],
            'crew' => $crew,
            'cast' => $cast,
        ];
    }

    public function searchMusic(string $query, array $localExternalIds): \Illuminate\Support\Collection
    {
        [$tracks, $albums, $artist] = Http::pool(fn ($pool) => [
            $pool->get("https://api.deezer.com/search/album", ['q' => $query, 'limit' => 5]),
            $pool->get("https://api.deezer.com/search/track", ['q' => $query, 'limit' => 10]),
            $pool->get("https://api.deezer.com/search/artist", ['q' => $query, 'limit' => 5]),
        ]);

        if (!($tracks->successful() && $albums->successful() && $artist->successful())) {
            throw new \RuntimeException('Music details could not be fetched');
        }

        $externalRawAlbums = $tracks->json()['data'] ?? [];
        $externalRawTracks = $albums->json()['data'] ?? [];
        $externalRawArtists = $artist->json()['data'] ?? [];

        $externalResults = array_merge(
            $externalRawArtists,
            $externalRawAlbums,
            $externalRawTracks
        );
        log::debug('Music search results:', ['results' => $externalRawAlbums, 'tracks' => $externalRawTracks, 'artists' => $externalRawArtists]);

        return collect($externalResults)->filter(function ($item) use ($localExternalIds) {
            return !in_array((string) ($item['id'] ?? ''), $localExternalIds);
        })->map(function ($item) {
            return [
                'id' => $item['id'],
                'title' => $item['title'] ?? $item['name'] ?? 'Untitled',
                'type' => $item['type'] ?? 'unknown',
                'source' => 'external',
            ];
        });
    }
}