<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ClientController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'cin' => 'nullable|string|max:50',
            'ice' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $client = Client::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'cin' => $request->cin,
            'ice' => $request->ice,
        ]);

        return response()->json($client, 201);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'cin' => 'nullable|string|max:50',
            'ice' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $client = $user->clients()->find($id);

        if (!$client) {
            return response()->json(['message' => 'Client not found.'], 404);
        }

        $client->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'cin' => $request->cin,
            'ice' => $request->ice,
        ]);

        return response()->json($client);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $client = $user->clients()->find($id);

        if (!$client) {
            return response()->json(['message' => 'Client not found.'], 404);
        }

        $client->delete();

        return response()->json(null, 204);
    }

    public function portal($clientId)
    {
        $client = Client::find($clientId);

        if (!$client) {
            return response()->json(['message' => 'Client not found.'], 404);
        }

        $user = $client->user;
        $invoices = $client->invoices()->with('items')->get()->map(function ($invoice) use ($client) {
            $invoice->customer = $client;
            return $invoice;
        });

        return response()->json([
            'client' => $client,
            'invoices' => $invoices,
            'settings' => $user->companySettings
        ]);
    }
}