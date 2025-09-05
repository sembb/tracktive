<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\MediaController;
use App\Models\MediaItem;
use App\Http\Controllers\SearchController;

Route::middleware('api')->group(function () {
    Route::middleware('auth:sanctum')->get('/user', function(Request $request) {
        if($request->mediaid && $request->user()){
            return response()->json([
                'liked' => $request->user()->checkLiked($request->mediaid), 
                'consumed' => $request->user()->checkConsumed($request->mediaid),
                'wishlist' => $request->user()->checkWishlist($request->mediaid),
                'reviewdetails' => [
                    'score' => $request->user()->reviews()->where('media_item_id', $request->mediaid)->first()?->rating ?? null,
                    'review' => $request->user()->reviews()->where('media_item_id', $request->mediaid)->first()?->review_text ?? null,
                    'date' => $request->user()->reviews()->where('media_item_id', $request->mediaid)->first()?->created_at ?? null,
                ],
                'user' => $request->user()->load('profile')
            ]);
        }else{
            return $request->user()->load('profile');
        }
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('profiles', UserProfileController::class);
    });

    Route::middleware('auth:sanctum')->post('/logout', function(Request $request) {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    });

    Route::get('/user/{slug}', function(string $slug){
        return User::where('name', $slug)->firstOrFail()->load('profile');
    });

    Route::post('/register', function(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed', // verwacht password_confirmation ook
        ]);

        \Log::info('Register request received', $request->all());

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);
        

        return response()->json(['message' => 'Registratie gelukt!'], 201);
    });

    Route::post('/login', function (Request $request) {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user->tokens()->delete(); // optional — only if you want 1 active token per user
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    });

    Route::get('/search/{origin}', [SearchController::class, 'search']);

    Route::prefix('media')->group(function () {
        Route::post('/action', [MediaController::class, 'handleAction'])->middleware('auth:sanctum');
        Route::post('/createreview', [MediaController::class, 'createReview'])->middleware('auth:sanctum');
        Route::get('/{type}', [MediaController::class, 'show'])
            ->where('type', 'movie|anime|album|track|artist');
    });
});