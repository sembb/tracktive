<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserProfile;

class UserProfileController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'birth_date' => 'nullable|date',
            'country' => 'nullable|string',
            'gender' => 'nullable|string',
            'bio' => 'nullable|string',
        ]);

        $validatedfile = $request->validate([
            'avatar_url' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('avatar_url')) {
            $path = $request->file('avatar_url')->store('avatar_url', 'public');
        } else {
            // Handle no file uploaded case, e.g. set $path to null or default
            $path = null;
        }

        $profile = new UserProfile($validated);
        $profile->avatar_url = $path;
        $profile->user_id = auth()->id(); // set the logged in user's ID
        $profile->save();

        return response()->json($profile, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
