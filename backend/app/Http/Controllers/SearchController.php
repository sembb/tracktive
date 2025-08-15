<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MediaItem;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Services\TmdbDetailFetchService;
use App\Services\AnilistDetailFetchService;
use App\Services\MusicDetailFetchService;

class SearchController extends Controller
{
    public function search(Request $request, string $origin)
    {
        $query = $request->query('q');

        if (strlen($query) < 2) {
            return response()->json([]);
        }

        // 1. Get local (cached) results
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

        

        $externalResults = match ($origin) {
            'movies' => app(TmdbDetailFetchService::class)->searchMovies($query, $localExternalIds),
            'anime' => app(AnilistDetailFetchService::class)->searchAnime($query, $localExternalIds),
            'music' => app(MusicDetailFetchService::class)->searchMusic($query, $localExternalIds),
            default => collect([]),
        };

        // 4. Merge results (cached first)
        $combined = $localResults->concat($externalResults)->values();

        // 5. Log output safely
        Log::debug('Local results:', ['local' => $localResults->toArray()]);
        Log::debug('External results:', ['external' => $externalResults->toArray()]);
        Log::debug('Combined results:', ['combined' => $combined->toArray()]);

        return response()->json($combined);
    }
}
