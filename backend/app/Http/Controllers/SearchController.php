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

        $combined = match ($origin) {
            'movies' => app(TmdbDetailFetchService::class)->searchMovies($query),
            'anime' => app(AnilistDetailFetchService::class)->searchAnime($query),
            'music' => app(MusicDetailFetchService::class)->searchMusic($query),
            default => collect([]),
        };

        return response()->json($combined);
    }
}
