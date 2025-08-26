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

            if(auth()->check()) {
                $mediaitem['details']['liked'] = MediaItem::where('user_id', auth()->id())
                    ->where('media_id', $mediaItem->id)
                    ->exists();
            } else {
                $mediaitem['details']['liked'] = false;
            }

        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }

        if (!$model || $model->updated_at->lt(now()->subDays(3))) {
            StoreMediaFromApi::dispatch($type, $mediaitem['details'], collect($mediaitem['crew']), collect($mediaitem['cast']));
        }

        return response()->json($mediaitem['details']);
    }

    public function handleAction(Request $request)
    {
        $data = $request->json()->all();
        echo 'wtf';
        die();
        $mediaId = $data['mediaId'] ?? null;
        $action = $data['action'] ?? null;

        if (!$mediaId || !$action) {
            return response()->json(['error' => 'Missing parameters'], 400);
        }

        $mediaItem = MediaItem::where('external_id', $mediaId)->first();
        if (!$mediaItem) {
            return response()->json(['error' => 'Media item not found'], 404);
        }

        switch ($action) {
            case 'like':
                $like = $mediaItem->likes()->firstOrNew(['user_id' => auth()->id()]);
                $like->liked = ! $like->liked;
                $like->save();
                break;
            case 'unlike':
                $mediaItem->likes()->where('user_id', auth()->id())->delete();
                break;
            default:
                return response()->json(['error' => 'Invalid action'], 400);
        }

        return response()->json(['success' => true, 'liked' => $action === 'like']);
    }
}
