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


        // $externalId = $externalData['id'] ?? null;
        // if (!$externalId) {
        //     throw new \Exception('Missing external ID');
        // }
        // if ($type === 'movies') {
        //     MediaItem::updateOrCreate(
        //         ['external_id' => $externalData['id']],
        //         [
        //             'external_id' => $externalData['id'],
        //             'external_source' => 'TMDB',
        //             'type' => 'Movie',
        //             'title' => $externalData['title'] ?? 'Untitled',
        //             'description' => '',
        //             'image_url' => '',
        //             'release_date' => $externalData['release_date'],
        //             'metadata_json' => json_encode(new \stdClass()),
        //             'last_synced_at' => now(),
        //         ]
        //     );
        // }

        // Only dispatch job if:
        // - model doesn't exist OR
        // - last update is older than 3 days
        if (!$model || $model->updated_at->lt(now()->subDays(3))) {
            StoreMediaFromApi::dispatch($type, $externalData);
        }

        exit;
    }
}
