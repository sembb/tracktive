<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use App\Models\Person;

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

    public function people()
    {
        return $this->belongsToMany(Person::class, 'media_item_person', 'media_item_id', 'person_id')
            ->withPivot('role', 'character_name') // optional: if you're storing extra data
            ->withTimestamps();
    }
}
