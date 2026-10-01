export interface Student {
  id: string;
  full_name: string;
  student_id: string;
  house_name: string;
  post_office: string;
  extra_address?: string;
  district: string;
  state: string;
  pincode: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  student_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

export interface StudentFinancials {
  student: Student;
  total_income: number;
  total_expense: number;
  balance: number;
  transaction_count: number;
  last_transaction_date?: string;
}

export interface DarsSettings {
  dars_name: string;
  dars_address: string;
  phone: string;
  email: string;
  other_details: string;
  logo?: string;
  theme: 'light' | 'dark';
  currency: string;
  date_format: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY';
}

export interface DashboardStats {
  total_students: number;
  total_income: number;
  total_expenses: number;
  total_balance: number;
  this_month_income: number;
  this_month_expenses: number;
  monthly_data: {
    month: string;
    income: number;
    expense: number;
    balance: number;
  }[];
  recent_activities: RecentActivity[];
}

export interface RecentActivity {
  id: string;
  type: 'income' | 'expense' | 'student';
  student_id?: string;
  student_name: string;
  amount?: number;
  description: string;
  date: string;
}

export interface BulkIncomeInput {
  total_amount: number;
  student_ids: string[];
  description: string;
  date: string;
}

export interface AdminUser {
  username: string;
  name: string;
  is_authenticated: boolean;
}
