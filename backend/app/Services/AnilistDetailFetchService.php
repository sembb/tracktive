<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AnilistDetailFetchService implements MediaDetailFetcherInterface
{
    public function fetch(string|int $id): array
    {
        $gqlquery = '
            query ($id: Int) {
                Media(id: $id, type: ANIME) {
                    id
                    title { romaji english native }
                    description
                    episodes
                    coverImage { extraLarge }
                    genres
                    startDate { year month day }
                }
            }
        ';

        $variables = ['id' => (int) $id];

        $response = Http::post('https://graphql.anilist.co', [
            'query' => $gqlquery,
            'variables' => $variables,
        ]);

        if (!$response->successful()) {
            throw new \RuntimeException('Anime not found');
        }

        $mediaitem = $response->json()['data']['Media'] ?? null;
        if (!$mediaitem) {
            throw new \RuntimeException('Anime not found');
        }

        return [
            'details' => [
                'id' => $mediaitem['id'],
                'title' => $mediaitem['title'],
                'poster_path' => $mediaitem['coverImage']['extraLarge'] ?? null,
                'overview' => $mediaitem['description'] ?? '',
                'release_date' => sprintf(
                    '%02d/%02d/%04d',
                    $mediaitem['startDate']['day'] ?? 0,
                    $mediaitem['startDate']['month'] ?? 0,
                    $mediaitem['startDate']['year'] ?? 0
                ),
            ],
            'crew' => collect([]),
            'cast' => collect([]),
        ];
    }
}
