import { useState, useMemo } from 'react';
import { type Transaction } from '../../services/transactionService';
import {
  type TransactionFilters,
  type FilterCategory,
  type FilterSubcategory,
  type SortField,
  type SortOrder
} from './types/index';

export const useTransactionFilters = (transactions: Transaction[]) => {
  const [filters, setFilters] = useState<TransactionFilters>({
    selectedCategory: 'todas',
    selectedSubcategory: 'todas',
    searchTerm: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Categorias únicas das transações
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(transactions.map(t => t.category)));
    return ['todas', ...uniqueCategories.sort()] as FilterCategory[];
  }, [transactions]);

  // Subcategorias baseadas na categoria selecionada
  const subcategories = useMemo(() => {
    if (filters.selectedCategory === 'todas') {
      const allDescriptions = transactions.map(t => t.description);
      return ['todas', ...Array.from(new Set(allDescriptions)).sort()] as FilterSubcategory[];
    }

    const categoryTransactions = transactions.filter(t => t.category === filters.selectedCategory);
    const descriptions = categoryTransactions.map(t => t.description);
    return ['todas', ...Array.from(new Set(descriptions)).sort()] as FilterSubcategory[];
  }, [transactions, filters.selectedCategory]);

  // Transações filtradas e ordenadas
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      // Filtro por categoria
      if (filters.selectedCategory !== 'todas' && transaction.category !== filters.selectedCategory) {
        return false;
      }

      // Filtro por subcategoria (descrição)
      if (filters.selectedSubcategory !== 'todas' && transaction.description !== filters.selectedSubcategory) {
        return false;
      }

      // Filtro por termo de busca
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          transaction.description.toLowerCase().includes(searchLower) ||
          transaction.category.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (filters.sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'amount':
          aValue = Math.abs(a.amount);
          bValue = Math.abs(b.amount);
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [transactions, filters]);

  // Funções de atualização dos filtros
  const updateCategory = (category: FilterCategory) => {
    setFilters(prev => ({
      ...prev,
      selectedCategory: category,
      selectedSubcategory: 'todas' // Reset subcategory when category changes
    }));
  };

  const updateSubcategory = (subcategory: FilterSubcategory) => {
    setFilters(prev => ({
      ...prev,
      selectedSubcategory: subcategory
    }));
  };

  const updateSearchTerm = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      searchTerm
    }));
  };

  const toggleSort = (column: SortField) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  return {
    filters,
    categories,
    subcategories,
    filteredTransactions,
    updateCategory,
    updateSubcategory,
    updateSearchTerm,
    toggleSort
  };
};
