<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Person extends Model
{
    use HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $fillable = ['name', 'type'];

    public function mediaItems()
    {
        return $this->belongsToMany(MediaItem::class, 'media_item_person')
                    ->withPivot('role', 'character_name', 'credit_order')
                    ->withTimestamps();
    }
}
