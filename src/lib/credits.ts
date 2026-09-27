export type PaymentMethod = 'bkash' | 'nagad' | 'rocket';

export interface CreditPackage {
  id: string;
  label: string;
  credits: number;
  price: string; // display only (demo)
  popular?: boolean;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'starter', label: 'Starter Pack', credits: 50, price: '৳49' },
  { id: 'standard', label: 'Standard Pack', credits: 150, price: '৳129', popular: true },
  { id: 'pro', label: 'Pro Pack', credits: 400, price: '৳299' },
  { id: 'unlimited', label: 'Power Pack', credits: 1000, price: '৳699' },
];

export interface CreditState {
  balance: number;
  plan: string;
  transactions: {
    id: string;
    amount: number;
    method: string | null;
    reference: string | null;
    status: string;
    description: string | null;
    created_at: string;
  }[];
}
