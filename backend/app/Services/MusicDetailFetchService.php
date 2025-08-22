<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\MediaItem;

class MusicDetailFetchService implements MediaDetailFetcherInterface
{
    public function __construct(string $type = null)
    {
        $this->type = $type;
    }

    public function fetch(string|int $id): array
    {

        return match ($this->type) {
            'artist' => $this->fetchArtist($id),
            'album' => $this->fetchAlbum($id),
            'track' => $this->fetchTrack($id),
            default => throw new \Exception("Unsupported type: {$this->type}"),
        };

    }

    protected function fetchArtist($id) { 
        $url = "https://api.deezer.com/artist/{$id}";
    }
    protected function fetchAlbum($id) {
        $url = "https://api.deezer.com/album/{$id}";

        $details = Http::get($url);

        if (!($details->successful())) {
            throw new \RuntimeException('Movie or cast could not be found');
        }

        $mediaitem = $details->json();

        log::debug('mediaitem:', ['results' => $mediaitem['artist']]);
        $crew = collect([]);
        $mainArtist = $mediaitem['artist'] ?? null;
        $contributors = $mediaitem['contributors'] ?? [];

        // Tag each one with a source
        $items = collect(array_merge(
            $mainArtist ? [array_merge($mainArtist, ['_source' => 'artist'])] : [],
            array_map(fn($c) => array_merge($c, ['_source' => 'contributor']), $contributors)
        ));

        $cast = $items
        ->unique('id') // remove duplicates by artist id
        ->map(function ($member) {
            return [
                'original_name' => $member['name'] ?? 'Unknown',
                'character' => null,
                'character_image_url' => null,
                'actor_image_url' => $member['picture_medium'] ?? null,
                'type' => 'artist',
                'role' => $member['_source'] === 'artist' ? 'artist' : 'contributor',
            ];
        });

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
    protected function fetchTrack($id) {
        $url = "https://api.deezer.com/track/{$id}";
    }

    public function searchMusic(string $query): \Illuminate\Support\Collection
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
        
        // 1. Get local (cached) results
        $localResults = MediaItem::where('title', 'like', '%' . $query . '%')
        ->with(['people'])
        ->get()
        ->map(function ($item) {
            return [
                'id' => $item->external_id,
                'title' => $item->title,
                'type' => $item->type,
                'source' => 'cached',
                'artist' => $item->people->where('pivot.role', 'artist')->first()->name ?? null,
            ];
        });

        $localExternalIds = $localResults->pluck('id')->filter()->toArray();

        $externalResults = collect($externalResults)->filter(function ($item) use ($localExternalIds) {
            return !in_array((string) ($item['id'] ?? ''), $localExternalIds);
        })->map(function ($item) {
            return [
                'id' => $item['id'],
                'title' => $item['title'] ?? $item['name'] ?? 'Untitled',
                'type' => $item['type'] ?? 'unknown',
                'source' => 'external',
                'artist' => $item['artist']['name'] ?? null,
            ];
        });

        return $localResults->concat($externalResults)->values();
    }
}