<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class AuthenticateWithCookieToken
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->cookie('auth_token');

        \Log::info('Cookie header:', [$request->header('Cookie')]);
\Log::info('Parsed cookies:', $request->cookies->all());

        if ($token) {
            $accessToken = PersonalAccessToken::findToken($token);

            if ($accessToken && $accessToken->tokenable) {
                $user = $accessToken->tokenable;

                // 🔐 Koppel de user aan de token
                $user->withAccessToken($accessToken);

                // Stel de gebruiker in via Laravel's authenticatie
                Auth::setUser($user);

                // Stel user-resolver in zodat $request->user() correct werkt
                $request->setUserResolver(fn () => $user);
            }
        }else{
            echo 'Auth token not found in cookies.';
        }

        return $next($request);
    }
}