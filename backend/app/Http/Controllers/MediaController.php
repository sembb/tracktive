<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use App\Models\MediaItem;
use App\Jobs\StoreMediaFromApi;

use Illuminate\Http\Request;

class MediaController extends Controller
{
    public function show(Request $request, $type)
    {
        $id = $request->query('id');
        $token = config('services.tmdb.token');

        if (!$id) {
            return response()->json(['error' => 'Invalid media type or ID'], 400);
        }

        $model = MediaItem::with('people')->where('external_id', $id)->first();

        // Case 1: Exists and recently updated → just return
        if ($model && $model->updated_at->gt(now()->subDays(3))) {
            return response()->json($model);
        }

        // Case 2: Doesn't exist or is stale → fetch from external
        [$details, $credits] = Http::pool(fn ($pool) => [
            $pool->withToken($token)->get("https://api.themoviedb.org/3/movie/{$id}"),
            $pool->withToken($token)->get("https://api.themoviedb.org/3/movie/{$id}/credits"),
        ]);

        if ($details->successful() && $credits->successful()) {
            $movie = $details->json();
            $crew = collect($credits->json()['crew']);
            $cast = collect($credits->json()['cast']);

            $director = $crew->firstWhere('job', 'Director');
            $mainActors = $cast->take(15);
        }else{
            return response()->json(['error' => 'Movie or cast could not be found'], 404);
        }

        // Return external data immediately
        response()->json([
            'id' => $movie['id'],
            'title' => $movie['title'],
            'overview' => $movie['overview'],
            'release_date' => $movie['release_date'],
            'poster_path' => $movie['poster_path'],
            'genres' => $movie['genres'], // or pluck only names
            'director' => $director ? $director['name'] : null,
            'people' => collect($mainActors)->map(function($person){
                return [
                    'name' => $person['name'],
                    'pivot' => [
                        'character_name' => $person['character']
                    ],
                ];
            }),
            'runtime' => $movie['runtime'],
            'budget' => $movie['budget'],
            'revenue' => $movie['revenue'],
        ])->send();
        
        if (!$model || $model->updated_at->lt(now()->subDays(3))) {
            StoreMediaFromApi::dispatch($type, $movie, $crew, $cast);
        }

        exit;
    }
}
