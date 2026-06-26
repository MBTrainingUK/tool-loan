import emailjs from '@emailjs/browser';
import type { LoanRequest } from '@/lib/types';

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

export async function sendRequestNotification(
  input: Omit<LoanRequest, 'id' | 'status' | 'createdAt' | 'toolId' | 'toolName'>
) {
  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      retailer_name: input.retailerName,
      company_name: input.companyName,
      email: input.email,
      phone: input.phone,
      department: input.department ?? '',
      vin_number: input.vinNumber ?? '',
      vehicle_model: input.vehicleModel,
      mileage: input.mileage ?? '',
      job_type: input.jobType,
      job_number: input.jobNumber ?? '',
      wis_tool_reference: input.wisToolReference ?? '',
      tool_part_number: input.toolPartNumber ?? '',
      tool_description: input.toolDescription,
      needed_from: input.neededFrom,
      needed_until: input.neededUntil,
      notes: input.notes ?? '',
    },
    PUBLIC_KEY
  );
}
