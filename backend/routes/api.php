<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\MediaController;
use App\Models\MediaItem;

Route::middleware('auth:sanctum')->get('/user', function(Request $request) {
    \Log::info('Session cookie name:', [config('session.cookie')]);
    return $request->user()->load('profile');
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

Route::get('/search/{origin}', function (Request $request, $origin) {
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
                'source' => 'cached',
            ];
        });
    $localExternalIds = $localResults->pluck('id')->filter()->toArray();

    if($origin === 'movies') {

        // 2. Fetch external TMDB results
        $externalResponse = Http::withToken(config('services.tmdb.token'))
            ->get('https://api.themoviedb.org/3/search/movie', [
                'query' => $query
            ]);

        $externalRaw = $externalResponse->json()['results'] ?? [];

        $externalResults = collect($externalRaw)->filter(function ($item) use ($localExternalIds) {
            return !in_array((string) ($item['id'] ?? ''), $localExternalIds);
        })->map(function ($item) {
            return [
                'id' => $item['id'],
                'title' => $item['title'] ?? 'Untitled',
                'source' => 'external',
            ];
        });

    }else if($origin === 'tv') {

    }else if($origin === 'anime') {
        $gqlquery = '
            query ($search: String, $page: Int) {
                Page(page: $page, perPage: 25) {
                    media(search: $search, type: ANIME) {
                        id
                        title {
                            romaji
                            english
                            native
                        }
                        description
                        episodes
                        coverImage {
                            large
                        }
                        genres
                        status
                    }
                }
            }
        ';

        $variables = [
            'search' => $query,
        ];

        $externalResponse = Http::post('https://graphql.anilist.co', [
            'query' => $gqlquery,
            'variables' => $variables,
        ]);

        if ($externalResponse->successful()) {
            $externalRaw = $externalResponse->json()['data']['Page']['media'] ?? [];

            $externalResults = collect($externalRaw)->filter(function ($item) use ($localExternalIds) {
                return !in_array((string) ($item['id'] ?? ''), $localExternalIds);
            })->map(function ($item) {
                return [
                    'id' => $item['id'],
                    'title' => $item['title']['english'] ?? $item['title']['romaji'] ?? $item['title']['native'] ?? 'Untitled',
                    'source' => 'external',
                ];
            });
        } else {
            return response()->json(['error' => 'Failed to fetch data'], 500);
        }
    }

    // 4. Merge results (cached first)
    $combined = $localResults->concat($externalResults)->values();

    // 5. Log output safely
    Log::debug('Local results:', ['local' => $localResults->toArray()]);
    Log::debug('External results:', ['external' => $externalResults->toArray()]);
    Log::debug('Combined results:', ['combined' => $combined->toArray()]);

    return response()->json($combined);
});

Route::get('/media/{type}', [MediaController::class, 'show']);