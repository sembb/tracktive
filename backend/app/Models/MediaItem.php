<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class MediaItem extends Model
{
    //
    public $incrementing = false;        // Geen auto-increment
    protected $keyType = 'string';       // UUID als string

    protected $fillable = [
    'id',
    'external_id',
    'external_source',
    'type',
    'title',
    'description',
    'image_url',
    'release_date',
    'metadata_json',
    'last_synced_at',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->getKey()) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }
}
