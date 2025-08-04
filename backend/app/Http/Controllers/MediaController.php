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

        if (!$id) {
            return response()->json(['error' => 'Invalid media type or ID'], 400);
        }

        $model = MediaItem::where('external_id', $id)->first();

        // Case 1: Exists and recently updated → just return
        if ($model && $model->updated_at->gt(now()->subDays(3))) {
            return response()->json($model);
        }

        // Case 2: Doesn't exist or is stale → fetch from external
        $externalRes = Http::withToken(config('services.tmdb.token'))
            ->get('https://api.themoviedb.org/3/movie/'.$id);

        if ($externalRes->failed()) {
            return response()->json(['error' => 'Not found in external API'], 404);
        }

        $externalData = $externalRes->json();

        // Return external data immediately
        response()->json($externalData)->send();
        
        if (!$model || $model->updated_at->lt(now()->subDays(3))) {
            StoreMediaFromApi::dispatch($type, $externalData);
        }

        exit;
    }
}
