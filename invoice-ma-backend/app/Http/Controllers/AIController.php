<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class AIController extends Controller
{
    public function generate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:generate_description,generate_email',
            'language' => 'required|in:fr,ar',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $apiKey = env('GEMINI_API_KEY');
        if (!$apiKey) {
            return response()->json(['message' => 'AI service not configured'], 500);
        }

        try {
            $prompt = $this->buildPrompt($request);
            
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ]
            ]);

            if ($response->failed()) {
                return response()->json(['message' => 'AI service unavailable'], 503);
            }

            $result = $response->json();
            $generatedText = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';

            if ($request->type === 'generate_email') {
                // Parse email format
                $lines = explode("\n", $generatedText);
                $subject = '';
                $body = '';
                $inBody = false;

                foreach ($lines as $line) {
                    $line = trim($line);
                    if (str_starts_with($line, 'Subject:') || str_starts_with($line, 'Sujet:')) {
                        $subject = trim(substr($line, strpos($line, ':') + 1));
                    } elseif (str_starts_with($line, 'Body:') || str_starts_with($line, 'Corps:')) {
                        $inBody = true;
                    } elseif ($inBody && !empty($line)) {
                        $body .= $line . "\n";
                    }
                }

                return response()->json([
                    'subject' => $subject ?: 'Invoice ' . ($request->invoice['invoiceNumber'] ?? ''),
                    'body' => trim($body) ?: 'Please find attached invoice.'
                ]);
            }

            return response()->json([
                'text' => trim($generatedText)
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'AI generation failed'], 500);
        }
    }

    private function buildPrompt(Request $request)
    {
        $type = $request->type;
        $language = $request->language;

        if ($type === 'generate_description') {
            $itemName = $request->itemName ?? 'service';
            
            if ($language === 'ar') {
                return "اكتب وصفاً مهنياً وموجزاً لخدمة أو منتج يسمى '{$itemName}' باللغة العربية. يجب أن يكون الوصف مناسباً لفاتورة تجارية ولا يتجاوز 100 كلمة.";
            } else {
                return "Write a professional and concise description for a service or product called '{$itemName}' in French. The description should be suitable for a business invoice and not exceed 100 words.";
            }
        }

        if ($type === 'generate_email') {
            $invoice = $request->invoice ?? [];
            $invoiceNumber = $invoice['invoiceNumber'] ?? 'N/A';
            $customerName = $invoice['customer']['name'] ?? 'Client';
            $total = $invoice['total'] ?? 0;
            $currency = $invoice['currency'] ?? 'MAD';

            if ($language === 'ar') {
                return "اكتب بريداً إلكترونياً مهنياً باللغة العربية لإرسال فاتورة. تفاصيل الفاتورة:
- رقم الفاتورة: {$invoiceNumber}
- اسم العميل: {$customerName}
- المبلغ الإجمالي: {$total} {$currency}

يجب أن يتضمن البريد:
Subject: [موضوع البريد]
Body: [نص البريد الإلكتروني]

اجعل النبرة مهنية ومهذبة.";
            } else {
                return "Write a professional email in French for sending an invoice. Invoice details:
- Invoice Number: {$invoiceNumber}
- Customer Name: {$customerName}
- Total Amount: {$total} {$currency}

The email should include:
Subject: [email subject]
Body: [email body text]

Keep the tone professional and polite.";
            }
        }

        return '';
    }
}