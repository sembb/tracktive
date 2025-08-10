<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use App\Models\MediaItem;
use App\Jobs\StoreMediaFromApi;
use Illuminate\Support\Facades\Log;

use Illuminate\Http\Request;

class MediaController extends Controller
{
    public function show(Request $request, $type)
    {
        $id = $request->query('id');

        if (!$id) {
            return response()->json(['error' => 'Invalid media type or ID'], 400);
        }

        $model = MediaItem::with('people')->where('external_id', $id)->first();

        // Case 1: Exists and recently updated → just return
        if ($model && $model->updated_at->gt(now()->subDays(3))) {
            return response()->json($model);
        }else{
            if($type === 'movies') {

                $token = config('services.tmdb.token');

                // Case 2: Doesn't exist or is stale → fetch from external
                [$details, $credits] = Http::pool(fn ($pool) => [
                    $pool->withToken($token)->get("https://api.themoviedb.org/3/movie/{$id}"),
                    $pool->withToken($token)->get("https://api.themoviedb.org/3/movie/{$id}/credits"),
                ]);

                if ($details->successful() && $credits->successful()) {
                    $mediaitem = $details->json();
                    $crew = collect($credits->json()['crew']);
                    $cast = collect($credits->json()['cast']);

                    $director = $crew->firstWhere('job', 'Director');
                    $mainActors = $cast->take(15);
                }else{
                    return response()->json(['error' => 'Movie or cast could not be found'], 404);
                }

                // Return external data immediately
                response()->json([
                    'id' => $mediaitem['id'],
                    'title' => $mediaitem['title'],
                    'overview' => $mediaitem['overview'],
                    'release_date' => $mediaitem['release_date'],
                    'poster_path' => $mediaitem['poster_path'],
                    'genres' => $mediaitem['genres'], // or pluck only names
                    'director' => $director ? $director['name'] : null,
                    'people' => collect($mainActors)->map(function($person){
                        return [
                            'name' => $person['name'],
                            'pivot' => [
                                'character_name' => $person['character']
                            ],
                        ];
                    }),
                    'runtime' => $mediaitem['runtime'],
                    'budget' => $mediaitem['budget'],
                    'revenue' => $mediaitem['revenue'],
                    'tagline' => $mediaitem['tagline'] ?? '',
                    'runtime' => $mediaitem['runtime'] ?? 0,
                ])->send();

            }else if($type === 'animes') {
                $crew = [];
                $cast = [];
                $gqlquery = '
                    query ($id: Int) {
                        Media(id: $id, type: ANIME) {
                            id
                            title {
                                romaji
                                english
                                native
                            }
                            description
                            episodes
                            coverImage {
                                extraLarge
                            }
                            genres
                            status
                            startDate {
                                year
                                month
                                day
                            }
                        }
                    }
                ';

                $variables = [
                    'id' => (int) $id,
                ];

                $externalResponse = Http::post('https://graphql.anilist.co', [
                    'query' => $gqlquery,
                    'variables' => $variables,
                ]);

                if($externalResponse->successful()) {
                    $mediaitem = $externalResponse->json()['data']['Media'] ?? null;

                    if (!$mediaitem) {
                        return response()->json(['error' => 'Anime not found'], 404);
                    }

                    response()->json([
                        'id' => $mediaitem['id'],
                        'title' => $mediaitem['title'],
                        'poster_path' => $mediaitem['coverImage']['extraLarge'] ?? null,
                        'overview' => $mediaitem['description'] ?? '',
                        'release_date' => $mediaitem['startDate']['day'].'/'.$mediaitem['startDate']['month'].'/'.$mediaitem['startDate']['year'], // Anime may not have a release date
                    ])->send();
                }else{
                    return response()->json(['error' => 'Anime not found'], 404);
                }
            }else{
                $mediaitem = [];
            }

            if (!$model || $model->updated_at->lt(now()->subDays(3))) {
                StoreMediaFromApi::dispatch($type, $mediaitem, collect($crew), collect($cast));
            }
        }
        
        exit;
    }
}
