export interface BankTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  balance: number;
}

export interface AnalysisResult {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netCashFlow: number;
    periodStart: string;
    periodEnd: string;
  };
  categoryBreakdown: Array<{
    category: string;
    totalAmount: number;
    percentage: number;
    transactionCount: number;
    transactions: Array<{
      date: string;
      description: string;
      amount: number;
    }>;
  }>;
  monthlyComparison: Array<{
    month: string;
    income: number;
    expenses: number;
    netCashFlow: number;
    topCategories: Array<{
      category: string;
      amount: number;
    }>;
  }>;
  recurringExpenses: Array<{
    description: string;
    frequency: string;
    averageAmount: number;
    category: string;
    occurrences: number;
  }>;
  oneTimeExpenses: Array<{
    date: string;
    description: string;
    amount: number;
    category: string;
  }>;
  insights: Array<{
    type: 'warning' | 'suggestion' | 'positive';
    title: string;
    description: string;
    impact: string;
    actionable: string;
  }>;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}
