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
            
        $model->liked = $model->checkLiked(auth('sanctum')->user());

        

        // Return cached if fresh
        if ($model && $model->updated_at->gt(now()->subDays(3))) {
            return response()->json($model);
        }

        try {
            $fetcher = MediaDetailFetcherFactory::make($type);
            $mediaitem = $fetcher->fetch($id);

            if(auth()->check()) {

                $mediaitem['details']['liked'] = MediaItem::where('external_id', $id)
                    ->whereHas('likes', function ($query) {
                        $query->where('user_id', auth()->id());
                    })
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
        $mediaId = $data['mediaId'] ?? null;
        $action = $data['action'] ?? null;

        if (!$mediaId || !$action) {
            return response()->json(['error' => 'Missing parameters'], 400);
        }

        $mediaItem = MediaItem::where('id', $mediaId)->first();
        if (!$mediaItem) {
            return response()->json(['error' => 'Media item not found'], 404);
        }

        switch ($action) {
            case 'like':
                $like = $mediaItem->likes()->where('user_id', auth()->id());

                if ($like->exists()) {
                    // If it exists, remove it
                    $like->delete();
                } else {
                    // If it doesn't exist, create it
                    $mediaItem->likes()->create([
                        'user_id' => auth()->id(),
                        // add any other required columns here
                    ]);
                }
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
