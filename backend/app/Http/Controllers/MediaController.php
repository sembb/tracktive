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

    public function handleAction(Request $request)
    {
        $data = $request->json()->all();
        $mediaId = $data['mediaId'] ?? null;
        $action = $data['action'] ?? null;

        if (!$mediaId || !$action) {
            return response()->json(['error' => 'Missing parameters'], 400);
        }
        log::info("Handling action", ['mediaId' => $mediaId, 'action' => $action, 'userId' => auth()->id()]);
        $mediaItem = MediaItem::where('id', $mediaId)->first();
        if (!$mediaItem) {
            return response()->json(['error' => 'Media item not found'], 404);
        }

        switch ($action) {
            case 'like':
                $process = $mediaItem->likes()->where('user_id', auth()->id());

                if ($process->exists()) {
                    // If it exists, remove it
                    $process->delete();
                } else {
                    // If it doesn't exist, create it
                    $mediaItem->likes()->create([
                        'user_id' => auth()->id(),
                        // add any other required columns here
                    ]);
                }
                break;
            case 'consumed':
                $process = $mediaItem->consumed()->where('user_id', auth()->id());

                if ($process->exists()) {
                    // If it exists, remove it
                    $process->delete();
                } else {
                    // If it doesn't exist, create it
                    $mediaItem->consumed()->create([
                        'user_id' => auth()->id(),
                        // add any other required columns here
                    ]);
                }
                break;
            case 'wishlist':
                $process = $mediaItem->wishlist()->where('user_id', auth()->id());

                if ($process->exists()) {
                    // If it exists, remove it
                    $process->delete();
                } else {
                    // If it doesn't exist, create it
                    $mediaItem->wishlist()->create([
                        'user_id' => auth()->id(),
                        // add any other required columns here
                    ]);
                }
                break;
            default:
                return response()->json(['error' => 'Invalid action'], 400);
        }

        return response()->json(['success' => true, 'liked' => $action === 'like']);
    }

    public function createReview(Request $request)
    {
        $data = $request->json()->all();
        $mediaId = $data['mediaId'] ?? null;
        $reviewText = $data['review'] ?? null;
        $rating = $data['score'] ?? null;

        if (!$mediaId || !$reviewText || !$rating) {
            return response()->json(['error' => 'Missing parameters'], 400);
        }

        $mediaItem = MediaItem::where('id', $mediaId)->first();
        if (!$mediaItem) {
            return response()->json(['error' => 'Media item not found'], 404);
        }

        // Create the review
        $mediaItem->reviews()->updateOrCreate(
            ['user_id' => auth()->id()],
            [
            'user_id' => auth()->id(),
            'review_text' => $reviewText,
            'rating' => $rating,
            ]
            // add any other required columns here
        );

        return response()->json(['success' => true]);
    }
}
