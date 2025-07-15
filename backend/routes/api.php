<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\AuthenticateWithCookieToken;
use App\Http\Controllers\UserProfileController;

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

Route::middleware([AuthenticateWithCookieToken::class])->get('/user', function(Request $request) {
    return $request->user()->load('profile');
});

Route::middleware([AuthenticateWithCookieToken::class])->group(function () {
    Route::apiResource('profiles', UserProfileController::class);
});

Route::middleware([AuthenticateWithCookieToken::class])->post('/logout', function(Request $request) {
    $request->user()->currentAccessToken()->delete();

    return response()->json(['message' => 'Logged out']);
});

Route::post('/register', function(Request $request) {
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'password' => 'required|string|min:8|confirmed', // verwacht password_confirmation ook
    ]);

    $user = User::create([
        'name' => $validated['name'],
        'email' => $validated['email'],
        'password' => Hash::make($validated['password']),
    ]);

    return response()->json(['message' => 'Registratie gelukt!'], 201);
});