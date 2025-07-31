<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Cookie;

class LogQueuedCookies
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);

        $queued = Cookie::getQueuedCookies();

        foreach ($queued as $cookie) {
            \Log::warning('QUEUED COOKIE', [
                'name' => $cookie->getName(),
                'value' => $cookie->getValue(),
                'class' => get_class($cookie),
                'trace' => debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 5),
            ]);
        }

        return $response;
    }
}