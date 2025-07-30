<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class InvoiceController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'client_id' => 'required|exists:clients,id',
            'invoice_number' => 'required|string|max:100',
            'issue_date' => 'required|date',
            'due_date' => 'required|date',
            'status' => 'required|in:draft,sent,paid,overdue',
            'currency' => 'required|in:MAD,EUR,USD',
            'notes' => 'nullable|string',
            'sub_total' => 'required|numeric|min:0',
            'tax_amount' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'payment_date' => 'nullable|date',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'required|numeric|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Check if user has enough credits
        if ($user->credits <= 0) {
            return response()->json([
                'message' => 'Insufficient credits. Please purchase more credits to create a new invoice.'
            ], 403);
        }

        // Verify client belongs to user
        $client = $user->clients()->find($request->client_id);
        if (!$client) {
            return response()->json(['message' => 'Client not found.'], 404);
        }

        // Check for duplicate invoice number for this user
        if ($user->invoices()->where('invoice_number', $request->invoice_number)->exists()) {
            return response()->json(['message' => 'Invoice number already exists.'], 409);
        }

        DB::beginTransaction();
        try {
            // Create invoice
            $invoice = Invoice::create([
                'user_id' => $user->id,
                'client_id' => $request->client_id,
                'invoice_number' => $request->invoice_number,
                'issue_date' => $request->issue_date,
                'due_date' => $request->due_date,
                'status' => $request->status,
                'currency' => $request->currency,
                'notes' => $request->notes,
                'sub_total' => $request->sub_total,
                'tax_amount' => $request->tax_amount,
                'total' => $request->total,
                'payment_date' => $request->payment_date,
            ]);

            // Create invoice items
            foreach ($request->items as $item) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'tax_rate' => $item['tax_rate'],
                ]);
            }

            // Deduct credit
            $user->decrement('credits');

            DB::commit();

            $invoice->load(['client', 'items']);
            $invoice->customer = $invoice->client;

            return response()->json($invoice, 201);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Failed to create invoice.'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'client_id' => 'required|exists:clients,id',
            'invoice_number' => 'required|string|max:100',
            'issue_date' => 'required|date',
            'due_date' => 'required|date',
            'status' => 'required|in:draft,sent,paid,overdue',
            'currency' => 'required|in:MAD,EUR,USD',
            'notes' => 'nullable|string',
            'sub_total' => 'required|numeric|min:0',
            'tax_amount' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'payment_date' => 'nullable|date',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'required|numeric|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $invoice = $user->invoices()->find($id);

        if (!$invoice) {
            return response()->json(['message' => 'Invoice not found.'], 404);
        }

        // Check if this edit requires credits
        if ($invoice->edit_count > 0) {
            if ($user->credits <= 0) {
                return response()->json([
                    'message' => 'Insufficient credits. Please purchase more credits to edit this invoice.'
                ], 403);
            }
        }

        // Verify client belongs to user
        $client = $user->clients()->find($request->client_id);
        if (!$client) {
            return response()->json(['message' => 'Client not found.'], 404);
        }

        // Check for duplicate invoice number (excluding current invoice)
        if ($user->invoices()->where('invoice_number', $request->invoice_number)
                ->where('id', '!=', $id)->exists()) {
            return response()->json(['message' => 'Invoice number already exists.'], 409);
        }

        DB::beginTransaction();
        try {
            // Update invoice
            $invoice->update([
                'client_id' => $request->client_id,
                'invoice_number' => $request->invoice_number,
                'issue_date' => $request->issue_date,
                'due_date' => $request->due_date,
                'status' => $request->status,
                'currency' => $request->currency,
                'notes' => $request->notes,
                'sub_total' => $request->sub_total,
                'tax_amount' => $request->tax_amount,
                'total' => $request->total,
                'payment_date' => $request->payment_date,
            ]);

            // Delete existing items and create new ones
            $invoice->items()->delete();
            foreach ($request->items as $item) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'tax_rate' => $item['tax_rate'],
                ]);
            }

            // Increment edit count and deduct credit if needed
            if ($invoice->edit_count > 0) {
                $user->decrement('credits');
            }
            $invoice->increment('edit_count');

            DB::commit();

            $invoice->load(['client', 'items']);
            $invoice->customer = $invoice->client;

            return response()->json($invoice);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Failed to update invoice.'], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $invoice = $user->invoices()->find($id);

        if (!$invoice) {
            return response()->json(['message' => 'Invoice not found.'], 404);
        }

        $invoice->delete();

        return response()->json(null, 204);
    }
}