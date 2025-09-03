import { useState, useEffect, useMemo } from 'react';
import transactionService, { type Transaction } from '../../services/transactionService';
import { type FinancialSummary } from './types/index';

const initialTransactions: Transaction[] = [
  { id: '1', date: '2025-06-10', description: 'Salário', amount: 4000, category: 'Salário' },
  { id: '2', date: '2025-06-12', description: 'Mercado', amount: -320, category: 'Alimentação' },
  { id: '3', date: '2025-06-13', description: 'Restaurante', amount: -85.5, category: 'Alimentação' },
  { id: '4', date: '2025-06-14', description: 'Freelance', amount: 1200, category: 'Freelance' },
  { id: '5', date: '2025-06-15', description: 'Transporte', amount: -50, category: 'Transporte' },
  { id: '6', date: '2025-06-16', description: 'Combustível', amount: -120, category: 'Transporte' },
  { id: '7', date: '2025-06-17', description: 'Aluguel', amount: -800, category: 'Moradia' },
  { id: '8', date: '2025-06-18', description: 'Plano de Saúde', amount: -150, category: 'Saúde' },
  { id: '9', date: '2025-06-19', description: 'Cinema', amount: -40, category: 'Lazer' },
  { id: '10', date: '2025-06-20', description: 'Vendas Online', amount: 500, category: 'Vendas' },
];

export const useTransactionApi = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar transações do backend quando disponível
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        const response = await transactionService.getTransactions();

        if (response.success && response.data) {
          setTransactions(response.data);
        } else {
          console.warn('Usando dados mockados:', response.error);
        }
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
        // Manter dados mockados em caso de erro
      } finally {
        setIsLoading(false);
      }
    };

    // Comentar esta linha para usar apenas dados mockados durante desenvolvimento
    // loadTransactions();
  }, []);

  const handleAddTransaction = async (transactionData: {
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
      const response = await transactionService.createTransaction(transactionData);

      if (response.success && response.data) {
        // Adicionar nova transação ao estado local
        setTransactions(prev => [response.data!, ...prev]);
      } else {
        throw new Error(response.error || 'Erro ao criar transação');
      }
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');

      // Fallback: adicionar localmente se a API falhar
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        date: transactionData.date,
        description: transactionData.title,
        amount: transactionData.amount,
        category: transactionData.category
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
        amount: transactionData.amount,
        category: transactionData.category
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
