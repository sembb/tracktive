<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Models\MediaItem;
use Exception;

class StoreMediaFromApi implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    protected string $type;
    protected array $data;

    /**
     * Create a new job instance.
     */
    public function __construct(string $type, array $data)
    {
        $this->type = $type;
        $this->data = $data;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            if ($this->type === 'movies') {
                Log::error("Failed to store media data from API".$this->data['poster_path']);
                MediaItem::updateOrCreate(
                    ['external_id' => $this->data['id']],
                    [
                        'external_id' => $this->data['id'],
                        'external_source' => 'TMDB',
                        'type' => 'Movie',
                        'title' => $this->data['title'] ?? 'Untitled',
                        'description' => '',
                        'image_url' => $this->data['poster_path'],
                        'release_date' => $this->data['release_date'],
                        'metadata_json' => json_encode(new \stdClass()),
                        'last_synced_at' => now(),
                    ]
                );
            } elseif ($this->type === 'tv') {
                MediaItem::updateOrCreate(
                    ['id' => $this->data['id']],
                    [
                        'name' => $this->data['name'] ?? 'Untitled',
                        'overview' => $this->data['overview'] ?? '',
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
                'data' => $this->data,
            ]);

            throw $e; // Optional: Let Laravel mark the job as failed
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(Exception $exception): void
    {
        Log::alert("StoreMediaFromApi job failed", [
            'type' => $this->type,
            'message' => $exception->getMessage(),
            'data' => $this->data['id'] ?? null,
        ]);

        // Optional: trigger alert/notification
    }
}