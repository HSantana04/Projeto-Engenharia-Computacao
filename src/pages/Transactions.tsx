import { Link } from 'react-router-dom';
import './Transactions.css';
import TransactionModal from '../components/TransactionModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { TransactionTable } from './Transactions/TransactionTable';
import { TransactionSummary } from './Transactions/TransactionSummary';
import { TransactionEmptyState } from './Transactions/TransactionEmptyState';
import { TransactionLoadingState } from './Transactions/TransactionLoadingState';
import { TransactionErrorBanner } from './Transactions/TransactionErrorBanner';
import { useAuth } from '../contexts/AuthContext';
import transactionService, { type Transaction } from '../services/transactionService';
import { useEffect, useState, useMemo } from 'react';

function Transactions() {
  const { user, isLoading: authLoading } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega transações quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const result = await transactionService.getTransactions(user.id);
      if (result.success) setTransactions(result.data || []);
      else setError(result.error || 'Erro ao carregar transações');
    } catch (err) {
      setError('Erro ao carregar transações');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransaction = async (data: { type: 'receita' | 'despesa'; title: string; amount: number; category: string; date: string }) => {
    if (!user) return;
    try {
      setIsLoading(true);
      const response = await transactionService.createTransaction(user.id, data);
      if (response.success && response.data) {
        setTransactions(prev => [response.data!, ...prev]);
        setIsTransactionModalOpen(false);
      } else setError(response.error || 'Erro ao criar transação');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTransaction = async (id: string, data: { type: 'receita' | 'despesa'; title: string; amount: number; category: string; date: string }) => {
    try {
      setIsLoading(true);
      const response = await transactionService.updateTransaction(id, data);
      if (response.success && response.data) {
        setTransactions(prev => prev.map(t => t.id === id ? response.data! : t));
        setIsTransactionModalOpen(false);
      } else setError(response.error || 'Erro ao atualizar transação');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    try {
      setIsLoading(true);
      const response = await transactionService.deleteTransaction(transactionToDelete.id);
      if (response.success) {
        setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
        setIsDeleteModalOpen(false);
        setTransactionToDelete(null);
      } else setError(response.error || 'Erro ao excluir transação');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const summary = useMemo(() => {
    const totalReceitas = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalDespesas = Math.abs(transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
    return { saldo: totalReceitas - totalDespesas, totalReceitas, totalDespesas };
  }, [transactions]);

  // Modais
  const openCreateModal = () => { setModalMode('create'); setTransactionToEdit(null); setIsTransactionModalOpen(true); };
  const openEditModal = (t: Transaction) => { setModalMode('edit'); setTransactionToEdit(t); setIsTransactionModalOpen(true); };
  const openDeleteModal = (t: Transaction) => { setTransactionToDelete(t); setIsDeleteModalOpen(true); };
  const closeTransactionModal = () => { setIsTransactionModalOpen(false); setTransactionToEdit(null); setError(null); };
  const closeDeleteModal = () => { setIsDeleteModalOpen(false); setTransactionToDelete(null); };

  if (authLoading || isLoading) return <TransactionLoadingState />;

  return (
    <div className="transactions">
      <div className="transactions__container">
        <header className="transactions__header">
          <div className="transactions__heading">
            <Link to="/dashboard" className="back-link">← Voltar ao Dashboard</Link>
            <h1 className="transactions__title">Todas as Transações</h1>
            <p className="transactions__subtitle">{transactions.length} transações</p>
          </div>
          <button className="btn btn-primary" onClick={openCreateModal}>+ Nova transação</button>
        </header>

        {error && <TransactionErrorBanner error={error} onDismiss={() => setError(null)} />}

        {transactions.length === 0 ? (
          <TransactionEmptyState onAddTransaction={openCreateModal} />
        ) : (
          <>
            <TransactionTable
              transactions={transactions}
              onEditTransaction={openEditModal}
              onDeleteTransaction={openDeleteModal}
            />
            <TransactionSummary summary={summary} filteredCount={transactions.length} totalCount={transactions.length} />
          </>
        )}
      </div>

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={closeTransactionModal}
        onAddTransaction={handleAddTransaction}
        onEditTransaction={handleEditTransaction}
        transactionToEdit={transactionToEdit}
        mode={modalMode}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteTransaction}
        transactionTitle={transactionToDelete?.description || ''}
        isLoading={isLoading}
      />
    </div>
  );
}

export default Transactions;
