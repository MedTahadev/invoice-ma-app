import { Invoice, Language } from '../types';

// This function now calls our own secure backend endpoint.
// The backend is responsible for adding the secret API key.
const generateAiContent = async (payload: object) => {
  const response = await fetch('/api/generate-ai-content', { // Your secure backend endpoint
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // We could add an auth token here too
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'AI generation failed' }));
    throw new Error(errorData.message);
  }
  return response.json();
};

export const generateItemDescription = async (itemName: string, language: Language): Promise<string> => {
  try {
    const response = await generateAiContent({
      type: 'generate_description',
      itemName,
      language,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating item description:", error);
    return ""; // Return empty on error
  }
};

export const generateInvoiceEmail = async (invoice: Invoice, language: Language): Promise<{ subject: string, body: string }> => {
  try {
    const response = await generateAiContent({
      type: 'generate_email',
      invoice,
      language,
    });
    return {
      subject: response.subject || `Invoice ${invoice.invoiceNumber}`,
      body: response.body || `Please find attached invoice.`,
    };
  } catch (error) {
    console.error("Error generating invoice email:", error);
    return { subject: `Invoice ${invoice.invoiceNumber}`, body: "Error generating email content." };
  }
};
