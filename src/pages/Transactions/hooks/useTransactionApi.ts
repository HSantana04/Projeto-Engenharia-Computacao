import { useState, useEffect, useMemo } from 'react';
import transactionService, { type Transaction } from '../../../services/transactionService';
import { type FinancialSummary } from '../types/index';
import { useAuth } from '../../../contexts/AuthContext';

export const useTransactionApi = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar transações do backend quando o usuário estiver disponível
  useEffect(() => {
    const loadTransactions = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const response = await transactionService.getTransactions(user.id);

        if (response.success && response.data) {
          setTransactions(response.data);
        } else {
          setError(response.error || 'Erro ao carregar transações');
          console.warn('Falha ao carregar transações do backend:', response.error);
        }
      } catch (err) {
        console.error('Erro ao carregar transações:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar transações');
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

      // Chamar API do backend (passando user id)
      const response = await transactionService.createTransaction(user.id, transactionData);

      if (response.success && response.data) {
        // Adicionar nova transação ao estado local
        setTransactions(prev => [response.data!, ...prev]);
      } else {
        throw new Error(response.error || 'Erro ao criar transação');
      }
    } catch (err) {
      console.error('Erro ao criar transação:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');

      // Fallback: adicionar localmente se a API falhar
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        date: transactionData.date,
        description: transactionData.title,
        amount: transactionData.type === 'receita' ? transactionData.amount : -transactionData.amount,
        category: transactionData.category,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setTransactions(prev => [newTransaction, ...prev]);
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

      // Chamar API do backend
      const response = await transactionService.updateTransaction(id, transactionData);

      if (response.success && response.data) {
        // Atualizar transação no estado local
        setTransactions(prev =>
          prev.map(t => t.id === id ? response.data! : t)
        );
      } else {
        throw new Error(response.error || 'Erro ao atualizar transação');
      }
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');

      // Fallback: atualizar localmente se a API falhar
      const updatedTransaction: Transaction = {
        id,
        date: transactionData.date,
        description: transactionData.title,
        amount: transactionData.type === 'receita' ? transactionData.amount : -transactionData.amount,
        category: transactionData.category,
        user_id: user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setTransactions(prev =>
        prev.map(t => t.id === id ? updatedTransaction : t)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Chamar API do backend
      const response = await transactionService.deleteTransaction(transactionId);

      if (response.success) {
        // Remover transação do estado local
        setTransactions(prev =>
          prev.filter(t => t.id !== transactionId)
        );
      } else {
        throw new Error(response.error || 'Erro ao excluir transação');
      }
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');

      // Fallback: remover localmente se a API falhar
      setTransactions(prev =>
        prev.filter(t => t.id !== transactionId)
      );
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
