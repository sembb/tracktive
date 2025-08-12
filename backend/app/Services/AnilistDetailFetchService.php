<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

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
                    characters {
                        edges {
                            node {
                            id
                            name {
                                full
                            }
                            image {
                                large
                            }
                            }
                            voiceActors(language: JAPANESE) {
                            name {
                                full
                            }
                            image {
                                large
                            }
                            }
                        }
                    }
                    staff {
                        edges {
                            role
                            node {
                            id
                            name {
                                full
                            }
                            image {
                                large
                            }
                            }
                        }
                    }
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

        if (!empty($mediaitem['startDate']['day']) && !empty($mediaitem['startDate']['month']) && !empty($mediaitem['startDate']['year'])) {
            try {
                $releaseDate = Carbon::parse(
                    $mediaitem['startDate']['year'] . '-' .
                    $mediaitem['startDate']['month'] . '-' .
                    $mediaitem['startDate']['day']
                )->format('Y-m-d');
            } catch (\Exception $e) {
                $releaseDate = null;
            }
        } else {
            $releaseDate = null;
        }

        $cast = collect($mediaitem['characters']['edges'] ?? [])->map(function ($edge) {
            return [
                'original_name' => $edge['voiceActors'][0]['name']['full'] ?? 'Unknown',
                'character' => $edge['node']['name']['full'] ?? '',
                'character_image_url' => $edge['node']['image']['large'] ?? null,
                'actor_image_url' => $edge['voiceActors'][0]['image']['large'] ?? null,
            ];
        });

        $mainActors = $cast->take(15)->map(fn ($person) => [
            'name' => $person['original_name'],
            'image_url' => $person['actor_image_url'] ?? null,
            'pivot' => [
                'character_name' => $person['character'], 
                'image_url' => $person['character_image_url'] ?? null
            ],
        ]);

        return [
            'details' => [
                'id' => $mediaitem['id'],
                'title' => $mediaitem['title']['english'] ?? $mediaitem['title']['romaji'] ?? $mediaitem['title']['native'] ?? 'Untitled',
                'poster_path' => $mediaitem['coverImage']['extraLarge'] ?? null,
                'overview' => $mediaitem['description'] ?? '',
                'release_date' => $releaseDate,
                'metadata' => [
                    'episodes' => $mediaitem['episodes'] ?? 0,
                    'genres' => $mediaitem['genres'] ?? [],
                ],
                'people' => $mainActors,
            ],
            'crew' => collect([]),
            'cast' => $cast,
        ];
    }
}
