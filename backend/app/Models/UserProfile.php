<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Http\Models\User;

class UserProfile extends Model
{
    protected $fillable = [
        'avatar_url',
        'birth_date',
        'country',
        'gender',
        'bio',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
