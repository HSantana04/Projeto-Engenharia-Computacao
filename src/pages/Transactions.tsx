import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import './Transactions.css';
import TransactionModal from '../components/TransactionModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { TransactionFilters } from './Transactions/TransactionFilters';
import { TransactionTable } from './Transactions/TransactionTable';
import { TransactionSummary } from './Transactions/TransactionSummary';
import { TransactionEmptyState } from './Transactions/TransactionEmptyState';
import { TransactionLoadingState } from './Transactions/TransactionLoadingState';
import { TransactionErrorBanner } from './Transactions/TransactionErrorBanner';

function Transactions() {
  const navigate = useNavigate();

  // ========== STATES ==========
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [modalMode, setModalMode] = useState('create');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // ========== CARREGAR TRANSAÇÕES DO BACKEND ==========
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('accessToken');

        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:5217/api/Transactions', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/login');
          return;
        }

        if (!response.ok) {
          throw new Error(`Erro ao carregar transações: ${response.statusText}`);
        }

        const data = await response.json();

        const mappedTransactions = data.map((t) => ({
          id: t.id,
          date: t.date,
          description: t.description,
          amount: t.amount,
          category: t.category
        }));

        setTransactions(mappedTransactions);
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
        setError(error instanceof Error ? error.message : 'Erro ao carregar transações');
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [navigate]);

  // ========== CALCULAR RESUMO ==========
  const summary = useMemo(() => {
    const totalReceitas = transactions
      .filter(t => t.amount > 0)
      .reduce((s, t) => s + t.amount, 0);
    const totalDespesas = Math.abs(
      transactions
        .filter(t => t.amount < 0)
        .reduce((s, t) => s + t.amount, 0)
    );
    const saldo = totalReceitas - totalDespesas;
    return { saldo, totalReceitas, totalDespesas };
  }, [transactions]);

  // ========== EXTRAIR CATEGORIAS E SUBCATEGORIAS ==========
  const { categories, subcategories } = useMemo(() => {
    const cats = [...new Set(transactions.map(t => t.category))].filter(Boolean);
    const subcats = selectedCategory
      ? [...new Set(
          transactions
            .filter(t => t.category === selectedCategory)
            .map(t => t.subcategory)
        )].filter(Boolean)
      : [];

    return {
      categories: cats.sort(),
      subcategories: subcats.sort()
    };
  }, [transactions, selectedCategory]);

  // ========== FILTRAR TRANSAÇÕES ==========
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoria
    if (selectedCategory) {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Filtro por subcategoria
    if (selectedSubcategory) {
      filtered = filtered.filter(t => t.subcategory === selectedSubcategory);
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aValue, bValue;

      if (sortBy === 'date') {
        aValue = new Date(a.date);
        bValue = new Date(b.date);
      } else if (sortBy === 'amount') {
        aValue = a.amount;
        bValue = b.amount;
      } else {
        aValue = a.description;
        bValue = b.description;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [transactions, searchTerm, selectedCategory, selectedSubcategory, sortBy, sortOrder]);

  // ========== CRIAR TRANSAÇÃO ==========
  const handleAddTransaction = async (transactionData) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5217/api/Transactions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionData)
      });

      if (!response.ok) {
        throw new Error('Erro ao criar transação');
      }

      const newTransaction = await response.json();

      const mappedTransaction = {
        id: newTransaction.id,
        date: newTransaction.date,
        description: newTransaction.description,
        amount: newTransaction.amount,
        category: newTransaction.category
      };

      setTransactions(prev => [mappedTransaction, ...prev]);
      setIsTransactionModalOpen(false);
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  // ========== EDITAR TRANSAÇÃO ==========
  const handleEditTransaction = async (id, transactionData) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5217/api/Transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionData)
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar transação');
      }

      const updatedTransaction = await response.json();

      const mappedTransaction = {
        id: updatedTransaction.id,
        date: updatedTransaction.date,
        description: updatedTransaction.description,
        amount: updatedTransaction.amount,
        category: updatedTransaction.category
      };

      setTransactions(prev =>
        prev.map(t => t.id === id ? mappedTransaction : t)
      );
      setIsTransactionModalOpen(false);
    } catch (error) {
      console.error('Erro ao editar transação:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  // ========== DELETAR TRANSAÇÃO ==========
  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;

    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5217/api/Transactions/${transactionToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar transação');
      }

      setTransactions(prev =>
        prev.filter(t => t.id !== transactionToDelete.id)
      );
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  // ========== FUNÇÕES DE MODAL ==========
  const openCreateModal = () => {
    setModalMode('create');
    setTransactionToEdit(null);
    setIsTransactionModalOpen(true);
  };

  const openEditModal = (transaction) => {
    setModalMode('edit');
    setTransactionToEdit(transaction);
    setIsTransactionModalOpen(true);
  };

  const openDeleteModal = (transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteModalOpen(true);
  };

  const closeTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setTransactionToEdit(null);
    setError(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTransactionToDelete(null);
  };

  // ========== CONFIRMAR EXCLUSÃO ==========
  const confirmDeleteTransaction = async () => {
    if (!transactionToDelete) return;

    try {
      await handleDeleteTransaction();
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  // ========== RENDER ==========
  return (
    <div className="transactions">
      <div className="transactions__container">
        {/* HEADER */}
        <header className="transactions__header">
          <div className="transactions__heading">
            <Link to="/dashboard" className="back-link">
              ← Voltar ao Dashboard
            </Link>
            <h1 className="transactions__title">Todas as Transações</h1>
            <p className="transactions__subtitle">
              {filteredTransactions.length} de {transactions.length} transações
            </p>
          </div>
          <button className="btn btn-primary" onClick={openCreateModal}>
            + Nova transação
          </button>
        </header>

        {/* BANNER DE ERRO */}
        {error && (
          <TransactionErrorBanner
            error={error}
            onDismiss={() => setError(null)}
          />
        )}

        {/* FILTROS */}
        <TransactionFilters
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          categories={categories}
          subcategories={subcategories}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSearchChange={setSearchTerm}
          onCategoryChange={(cat) => {
            setSelectedCategory(cat);
            setSelectedSubcategory('');
          }}
          onSubcategoryChange={setSelectedSubcategory}
          onToggleSort={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        />

        {/* CONTEÚDO DINÂMICO */}
        {isLoading ? (
          <TransactionLoadingState />
        ) : filteredTransactions.length === 0 ? (
          <TransactionEmptyState onAddTransaction={openCreateModal} />
        ) : (
          <>
            <TransactionTable
              transactions={filteredTransactions}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onToggleSort={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              onEditTransaction={openEditModal}
              onDeleteTransaction={openDeleteModal}
            />

            <TransactionSummary
              summary={summary}
              filteredCount={filteredTransactions.length}
              totalCount={transactions.length}
            />
          </>
        )}
      </div>

      {/* MODAL DE CRIAR/EDITAR */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={closeTransactionModal}
        onAddTransaction={handleAddTransaction}
        onEditTransaction={handleEditTransaction}
        transactionToEdit={transactionToEdit}
        mode={modalMode}
      />

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteTransaction}
        transactionTitle={transactionToDelete?.description || ''}
        isLoading={isLoading}
      />
    </div>
  );
}

export default Transactions;