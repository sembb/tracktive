<?php

namespace App\Services;

interface MediaDetailFetcherInterface
{
    public function fetch(string|int $id, string $subtype): array;
}
