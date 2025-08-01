<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\AuthenticateWithCookieToken;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\MediaController;
use App\Models\MediaItem;

Route::middleware('api.stateful')->group(function () {
    Route::middleware([AuthenticateWithCookieToken::class])->get('/user', function(Request $request) {
        \Log::info('Session cookie name:', [config('session.cookie')]);
        return $request->user()->load('profile');
    });

    Route::middleware([AuthenticateWithCookieToken::class])->group(function () {
        Route::apiResource('profiles', UserProfileController::class);
    });

    Route::middleware([AuthenticateWithCookieToken::class])->post('/logout', function(Request $request) {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    });

    Route::get('/user/{slug}', function(string $slug){
        return User::where('name', $slug)->firstOrFail()->load('profile');
    });
});

Route::middleware('api.stateless')->group(function () {
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

    Route::post('/login', function(Request $request) {
        $domain = config('session.domain');
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'user' => $user,
        ])->cookie(
            'auth_token', 
            $token, 
            60 * 24,        // minuten
            '/',            // path
            $domain,           // domain, kan eventueel je ip of localhost zijn
            false,          // secure false voor lokaal HTTP, true voor productie HTTPS
            true            // httpOnly
        );
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

        // 2. Fetch external TMDB results
        $externalResponse = Http::withToken(config('services.tmdb.token'))
            ->get('https://api.themoviedb.org/3/search/movie', [
                'query' => $query
            ]);

        $externalRaw = $externalResponse->json()['results'] ?? [];

        // 3. Deduplicate using external_id from local and id from external
        $localExternalIds = $localResults->pluck('id')->filter()->toArray();

        $externalResults = collect($externalRaw)->filter(function ($item) use ($localExternalIds) {
            return !in_array((string) ($item['id'] ?? ''), $localExternalIds);
        })->map(function ($item) {
            return [
                'id' => $item['id'],
                'title' => $item['title'] ?? 'Untitled',
                'source' => 'external',
            ];
        });

        // 4. Merge results (cached first)
        $combined = $localResults->concat($externalResults)->values();

        // 5. Log output safely
        Log::debug('Local results:', ['local' => $localResults->toArray()]);
        Log::debug('External results:', ['external' => $externalResults->toArray()]);
        Log::debug('Combined results:', ['combined' => $combined->toArray()]);

        return response()->json($combined);
    });

    Route::get('/media/{type}', [MediaController::class, 'show']);
});