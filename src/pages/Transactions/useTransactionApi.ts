import { useState, useEffect, useMemo } from 'react';
import transactionService, { type Transaction } from '../../services/transactionService';
import { useAuth } from '../../contexts/AuthContext';
import { type FinancialSummary } from './types/index';

export const useTransactionApi = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar transações reais do backend
  useEffect(() => {
    if (!user) return;

    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await transactionService.getTransactions(user.id);

        if (response.success && response.data) {
          setTransactions(response.data);
        } else {
          setError(response.error || 'Erro ao carregar transações');
        }
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
        setError('Erro ao carregar transações');
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [user]);

  const handleAddTransaction = async (transactionData: {
    type: 'receita' | 'despesa';
    title: string;
    amount: number;
    category: string;
    date: string;
  }) => {
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await transactionService.createTransaction(user.id, transactionData);

      if (response.success && response.data) {
        setTransactions(prev => [response.data!, ...prev]);
      } else {
        setError(response.error || 'Erro ao criar transação');
      }
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTransaction = async (id: string, transactionData: {
    type: 'receita' | 'despesa';
    title: string;
    amount: number;
    category: string;
    date: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await transactionService.updateTransaction(id, transactionData);

      if (response.success && response.data) {
        setTransactions(prev =>
          prev.map(t => t.id === id ? response.data! : t)
        );
      } else {
        setError(response.error || 'Erro ao atualizar transação');
      }
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await transactionService.deleteTransaction(transactionId);

      if (response.success) {
        setTransactions(prev =>
          prev.filter(t => t.id !== transactionId)
        );
      } else {
        setError(response.error || 'Erro ao excluir transação');
      }
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  // Resumo financeiro
  const summary: FinancialSummary = useMemo(() => {
    const totalReceitas = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalDespesas = Math.abs(transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));

    const saldo = totalReceitas - totalDespesas;

    return {
      totalReceitas: Math.round(totalReceitas * 100) / 100,
      totalDespesas: Math.round(totalDespesas * 100) / 100,
      saldo: Math.round(saldo * 100) / 100
    };
  }, [transactions]);

  return {
    transactions,
    isLoading,
    error,
    summary,
    handleAddTransaction,
    handleEditTransaction,
    handleDeleteTransaction,
    setError
  };
};