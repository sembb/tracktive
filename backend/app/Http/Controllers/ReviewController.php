<?php

namespace App\Http\Controllers;

use App\Models\MediaItem;
use App\Jobs\StoreMediaFromApi;
use App\Services\MediaDetailFetcherFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReviewController extends Controller
{
    public function createReview(Request $request)
    {
        $data = $request->json()->all();
        $mediaId = $data['mediaId'] ?? null;
        $reviewText = $data['review_text'] ?? null;
        $rating = $data['rating'] ?? null;

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

    public function listReviews(string $mediaid)
    {
        $mediaItem = MediaItem::where('id', $mediaid)->first();
        if (!$mediaItem) {
            return response()->json(['error' => 'Media item not found'], 404);
        }

        $reviews = $mediaItem->reviews()
            ->with(['user:id,name', 'user.profile:avatar_url,user_id'])
            ->paginate(1);

        return response()->json($reviews);
    }
}