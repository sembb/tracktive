<?php

use Illuminate\Support\Facades\Route;

Route::get('/films', function () {
    return ['title' => 'Inception', 'year' => 2010];
});