<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use App\Models\Person;
use App\Models\Review;
use App\Models\MediaLike;
use App\Models\MediaConsumed;
use App\Models\MediaWishlist;
use Illuminate\Support\Facades\Log;

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

    public function checkLiked(?User $user)
    {
        if (!$user) return false;

        return $this->likes()->where('user_id', $user->id)->exists();
    }

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
            ->withPivot('role', 'character_name', 'image_url') // optional: if you're storing extra data
            ->withTimestamps();
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function likes()
    {   
        return $this->hasMany(MediaLike::class, 'media_id');
    }
}
