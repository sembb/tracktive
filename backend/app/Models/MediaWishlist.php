<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MediaWishlist extends Model
{
    protected $fillable = [
        'user_id',
        'media_id',
    ];
    
    public $incrementing = false;      // no auto-increment
    protected $primaryKey = null;      // no single primary key
    protected $keyType = 'string';     // if you're using UUIDs
    public $timestamps = true;         // or false if you don't want them
}
