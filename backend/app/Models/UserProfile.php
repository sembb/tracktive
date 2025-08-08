<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Http\Models\User;
use Illuminate\Support\Str;

class UserProfile extends Model
{

    public $incrementing = false;        // Geen auto-increment
    protected $keyType = 'string';       // UUID als string
    
    protected $fillable = [
        'avatar_url',
        'birth_date',
        'country',
        'gender',
        'bio',
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

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
