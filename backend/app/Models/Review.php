<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    //
    public $incrementing = false;        // Geen auto-increment
    protected $keyType = 'string';       // UUID als string

    protected $fillable = ['rating', 'review_text', 'user_id', 'media_item_id', 'id'];

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
