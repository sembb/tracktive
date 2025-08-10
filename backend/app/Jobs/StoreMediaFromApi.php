<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use App\Models\MediaItem;
use App\Models\Person;
use Throwable;

class StoreMediaFromApi implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    protected string $type;
    protected array $mediaitem;
    protected Collection $crew;
    protected Collection $cast;

    /**
     * Create a new job instance.
     */
    public function __construct(string $type, array $mediaitem, Collection $crew, Collection $cast)
    {
        $this->type = $type;
        $this->mediaitem = $mediaitem;
        $this->crew = $crew;
        $this->cast = $cast;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            if ($this->type === 'movies') {
                $metadata = new \stdClass();
                $metadata->tagline = $this->mediaitem['tagline'] ?? '';
                $metadata->runtime = $this->mediaitem['runtime'] ?? 0;
                $newitem = MediaItem::updateOrCreate(
                    ['external_id' => $this->mediaitem['id']],
                    [
                        'external_id' => $this->mediaitem['id'],
                        'external_source' => 'TMDB',
                        'type' => 'Movie',
                        'title' => $this->mediaitem['title'] ?? 'Untitled',
                        'description' => $this->mediaitem['overview'] ?? '',
                        'image_url' => $this->mediaitem['poster_path'],
                        'release_date' => $this->mediaitem['release_date'],
                        'metadata_json' => json_encode($metadata),
                        'last_synced_at' => now(),
                    ]
                );
                foreach($this->cast as $castmember){
                    Log::error("Trying to store ".$castmember['original_name']);
                    $person = Person::updateOrCreate(
                        ['name' => $castmember['original_name'], 'type' => 'actor'],
                        [
                        'name' => $castmember['original_name'],
                        'type' => 'actor',
                        ]
                    );

                    $newitem->people()->syncWithoutDetaching([
                        $person->id => [
                            'role' => 'actor',
                            'character_name' => $castmember['character'],
                        ]
                    ]);
                }
                
            } elseif ($this->type === 'tv') {
                MediaItem::updateOrCreate(
                    ['id' => $this->mediaitem['id']],
                    [
                        'name' => $this->mediaitem['name'] ?? 'Untitled',
                        'overview' => $this->mediaitem['overview'] ?? '',
                        // Add more fields safely
                    ]
                );
            } else {
                throw new Exception("Unsupported media type: {$this->type}");
            }
        } catch (Exception $e) {
            Log::error("Failed to store media data from API", [
                'type' => $this->type,
                'error' => $e->getMessage(),
                'data' => $this->mediaitem,
            ]);

            throw $e; // Optional: Let Laravel mark the job as failed
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(Throwable $exception): void
    {
        Log::alert("StoreMediaFromApi job failed", [
            'type' => $this->type,
            'message' => $exception->getMessage(),
            'data' => $this->mediaitem['id'] ?? null,
        ]);

        // Optional: trigger alert/notification
    }
}