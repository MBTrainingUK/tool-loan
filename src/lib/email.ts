import emailjs from '@emailjs/browser';

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

export async function sendRequestNotification(input: {
  retailerName: string;
  companyName: string;
  email: string;
  phone: string;
  toolDescription: string;
  neededFrom: string;
  neededUntil: string;
  notes?: string;
}) {
  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      retailer_name: input.retailerName,
      company_name: input.companyName,
      email: input.email,
      phone: input.phone,
      tool_description: input.toolDescription,
      needed_from: input.neededFrom,
      needed_until: input.neededUntil,
      notes: input.notes ?? '',
    },
    PUBLIC_KEY
  );
}
