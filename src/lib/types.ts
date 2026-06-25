// Tool statuses
export type ToolStatus = 'available' | 'on_loan' | 'maintenance';
export type ToolCondition = 'new' | 'good' | 'fair' | 'poor';

// Request statuses
export type RequestStatus = 'pending' | 'approved' | 'rejected';

// Loan statuses
export type LoanStatus = 'active' | 'returned' | 'overdue';

// ----- Collections -----

export interface Tool {
  id: string;
  name: string;
  description: string;
  serialNumber?: string;
  category?: string;
  imageUrl?: string;
  status: ToolStatus;
  createdAt: string; // ISO date string
}

export interface LoanRequest {
  id: string;
  // What the retailer described
  toolPartNumber?: string;
  toolDescription: string;
  // Set by admin when approving
  toolId?: string;
  toolName?: string;
  // Retailer contact details
  retailerName: string;
  companyName: string;
  email: string;
  phone: string;
  department?: string;
  // Vehicle details
  vehicleRegistration: string;
  vinNumber?: string;
  vehicleModel: string;
  mileage?: string;
  // Job details
  jobType: string;
  jobNumber?: string;
  wisToolReference?: string;
  // Dates
  neededFrom: string; // ISO date
  neededUntil: string; // ISO date
  // Terms
  acceptedTerms: boolean;
  // Admin
  status: RequestStatus;
  notes?: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  toolId: string;
  toolName: string;
  // Copied from the request
  retailerName: string;
  companyName: string;
  email: string;
  phone: string;
  // Dates
  loanedAt: string;
  dueDate: string;
  returnedAt?: string;
  // Condition
  conditionOnLoan: ToolCondition;
  conditionOnReturn?: ToolCondition;
  // Status
  status: LoanStatus;
  returnNotes?: string;
  requestId: string;
}
