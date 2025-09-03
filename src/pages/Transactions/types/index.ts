import type { Transaction } from '../../../services/transactionService';

// Tipos para filtros
export type FilterCategory = 'todas' | string;
export type FilterSubcategory = 'todas' | string;

// Tipos para ordenação
export type SortField = 'date' | 'amount' | 'description';
export type SortOrder = 'asc' | 'desc';

// Tipos para modais
export type ModalMode = 'create' | 'edit';

// Interface para estado de filtros
export interface TransactionFilters {
  selectedCategory: FilterCategory;
  selectedSubcategory: FilterSubcategory;
  searchTerm: string;
  sortBy: SortField;
  sortOrder: SortOrder;
}

// Interface para dados do formulário de transação
export interface TransactionFormData {
  type: 'receita' | 'despesa';
  title: string;
  subcategory: string;
  amount: string;
  category: string;
  date: string;
}

// Interface para erros do formulário
export interface TransactionFormErrors {
  title?: string;
  amount?: string;
  category?: string;
  date?: string;
}

// Interface para estado de modais
export interface ModalState {
  isTransactionModalOpen: boolean;
  isDeleteModalOpen: boolean;
  transactionToEdit: Transaction | null;
  transactionToDelete: Transaction | null;
  modalMode: ModalMode;
  error: string | null;
  isLoading: boolean;
}

// Interface para dados do gráfico
export interface ChartDataPoint {
  month: string;
  receita: number;
  despesa: number;
}

// Interface para resumo financeiro
export interface FinancialSummary {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

// Constantes para tipos de transação (substituindo enum)
export const TransactionType = {
  RECEITA: 'receita',
  DESPESA: 'despesa'
} as const;

// Constantes para campos de ordenação (substituindo enum)
export const SortFieldEnum = {
  DATE: 'date',
  AMOUNT: 'amount',
  DESCRIPTION: 'description'
} as const;

// Constantes para ordem de ordenação (substituindo enum)
export const SortOrderEnum = {
  ASC: 'asc',
  DESC: 'desc'
} as const;

// Tipos utilitários
export type TransactionTypeUnion = 'receita' | 'despesa';
export type SortFieldUnion = 'date' | 'amount' | 'description';
export type SortOrderUnion = 'asc' | 'desc';
