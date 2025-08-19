<?php

namespace App\Http\Controllers;

use App\Models\MediaItem;
use App\Jobs\StoreMediaFromApi;
use App\Services\MediaDetailFetcherFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MediaController extends Controller
{
    public function show(Request $request, string $type)
    {
        $id = $request->query('id');
        if (!$id) {
            return response()->json(['error' => 'Missing ID'], 400);
        }

        $model = MediaItem::with('people')
            ->where('external_id', $id)
            ->where('type', $type)
            ->first();

        // Return cached if fresh
        if ($model && $model->updated_at->gt(now()->subDays(3))) {
            return response()->json($model);
        }

        try {
            $fetcher = MediaDetailFetcherFactory::make($type);
            $mediaitem = $fetcher->fetch($id);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }

        if (!$model || $model->updated_at->lt(now()->subDays(3))) {
            StoreMediaFromApi::dispatch($type, $mediaitem['details'], collect($mediaitem['crew']), collect($mediaitem['cast']));
        }

        return response()->json($mediaitem['details']);
    }
}
