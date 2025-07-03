<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class AuthenticateWithCookieToken
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->cookie('auth_token');

        if ($token) {
            // Find the token in the database
            $accessToken = PersonalAccessToken::findToken($token);

            if ($accessToken && $accessToken->tokenable) {
                // Authenticate the user for this request
                $request->setUserResolver(function () use ($accessToken) {
                    return $accessToken->tokenable;
                });
                auth()->setUser($accessToken->tokenable);
            }
        }

        return $next($request);
    }
}