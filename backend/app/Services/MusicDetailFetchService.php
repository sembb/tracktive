<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MusicDetailFetchService implements MediaDetailFetcherInterface
{
    public function fetch(string|int $id): array
    {

    }

    public function searchMusic(string $query, array $localExternalIds): \Illuminate\Support\Collection
    {
        [$tracks, $albums, $artist] = Http::pool(fn ($pool) => [
            $pool->get("https://api.deezer.com/search/album", ['q' => $query]),
            $pool->get("https://api.deezer.com/search/track", ['q' => $query]),
            $pool->get("https://api.deezer.com/search/artists", ['q' => $query]),
        ]);

        if (!($tracks->successful() && $albums->successful() && $artist->successful())) {
            throw new \RuntimeException('Music details could not be fetched');
        }

        $externalRaw = $tracks->json()['data'] ?? [];

        log::debug('Music search results:', ['results' => $externalRaw]);

        return collect($externalRaw)->filter(function ($item) use ($localExternalIds) {
            return !in_array((string) ($item['id'] ?? ''), $localExternalIds);
        })->map(function ($item) {
            return [
                'id' => $item['id'],
                'title' => $item['title'] ?? 'Untitled',
                'source' => 'external',
            ];
        });
    }
}