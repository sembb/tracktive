<?php

namespace App\Services;

use InvalidArgumentException;

class MediaDetailFetcherFactory
{
    public static function make(string $type): MediaDetailFetcherInterface
    {
        return match ($type) {
            'movie' => new TmdbDetailFetchService(),
            'anime' => new AnilistDetailFetchService(),
            'music' => new MusicDetailFetchService(),
            default => throw new InvalidArgumentException("Unknown media type: $type"),
        };
    }
}
