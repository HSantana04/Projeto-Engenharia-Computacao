import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './Transactions.css';
import TransactionModal from '../components/TransactionModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import transactionService, { type Transaction } from '../services/transactionService';

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

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Categorias únicas das transações
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(transactions.map(t => t.category)));
    return ['todas', ...uniqueCategories.sort()];
  }, [transactions]);

  // Subcategorias baseadas na categoria selecionada
  const subcategories = useMemo(() => {
    if (selectedCategory === 'todas') {
      const allDescriptions = transactions.map(t => t.description);
      return ['todas', ...Array.from(new Set(allDescriptions)).sort()];
    }

    const categoryTransactions = transactions.filter(t => t.category === selectedCategory);
    const descriptions = categoryTransactions.map(t => t.description);
    return ['todas', ...Array.from(new Set(descriptions)).sort()];
  }, [transactions, selectedCategory]);

  // Transações filtradas e ordenadas
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      // Filtro por categoria
      if (selectedCategory !== 'todas' && transaction.category !== selectedCategory) {
        return false;
      }

      // Filtro por subcategoria (descrição)
      if (selectedSubcategory !== 'todas' && transaction.description !== selectedSubcategory) {
        return false;
      }

      // Filtro por termo de busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          transaction.description.toLowerCase().includes(searchLower) ||
          transaction.category.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
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

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [transactions, selectedCategory, selectedSubcategory, searchTerm, sortBy, sortOrder]);

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

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;

    try {
      setIsLoading(true);
      setError(null);

      // Chamar API do backend
      const response = await transactionService.deleteTransaction(transactionToDelete.id);

      if (response.success) {
        // Remover transação do estado local
        setTransactions(prev =>
          prev.filter(t => t.id !== transactionToDelete.id)
        );
        setIsDeleteModalOpen(false);
        setTransactionToDelete(null);
      } else {
        throw new Error(response.error || 'Erro ao excluir transação');
      }
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');

      // Fallback: remover localmente se a API falhar
      setTransactions(prev =>
        prev.filter(t => t.id !== transactionToDelete.id)
      );
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setTransactionToEdit(null);
    setIsTransactionModalOpen(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setModalMode('edit');
    setTransactionToEdit(transaction);
    setIsTransactionModalOpen(true);
  };

  const openDeleteModal = (transaction: Transaction) => {
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

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory('todas'); // Reset subcategory when category changes
  };

  const toggleSort = (column: 'date' | 'amount' | 'description') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <div className="transactions">
      <div className="transactions__container">
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

        {/* Mensagem de erro */}
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Filtros */}
        <div className="filters">
          <div className="filters__search">
            <input
              type="text"
              placeholder="Buscar por descrição ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters__selects">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="filter-select"
            >
              <option value="todas">Todas as categorias</option>
              {categories.filter(cat => cat !== 'todas').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="filter-select"
              disabled={selectedCategory === 'todas'}
            >
              <option value="todas">Todas as subcategorias</option>
              {subcategories.filter(sub => sub !== 'todas').map(subcategory => (
                <option key={subcategory} value={subcategory}>{subcategory}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabela de Transações */}
        <div className="transactions-table">
          <div className="table-header">
            <div
              className="table-cell table-header-cell clickable"
              onClick={() => toggleSort('description')}
            >
              Descrição
              {sortBy === 'description' && (
                <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </div>
            <div
              className="table-cell table-header-cell clickable"
              onClick={() => toggleSort('date')}
            >
              Data
              {sortBy === 'date' && (
                <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </div>
            <div className="table-cell table-header-cell">Categoria</div>
            <div
              className="table-cell table-header-cell clickable amount-header"
              onClick={() => toggleSort('amount')}
            >
              Valor
              {sortBy === 'amount' && (
                <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </div>
            <div className="table-cell table-header-cell">Ações</div>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Carregando transações...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma transação encontrada</p>
              <button className="btn btn-primary" onClick={openCreateModal}>
                Adicionar primeira transação
              </button>
            </div>
          ) : (
            <div className="table-body">
              {filteredTransactions.map(t => (
                <div key={t.id} className="table-row">
                  <div className="table-cell">
                    <div className="transaction-description">
                      <div className={classNames('transaction-icon', t.amount >= 0 ? 'icon--green' : 'icon--red')}>
                        {t.amount >= 0 ? '📈' : '📉'}
                      </div>
                      <span className="transaction-text">{t.description}</span>
                    </div>
                  </div>
                  <div className="table-cell">
                    {new Date(t.date).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="table-cell">
                    <span className="category-badge">{t.category}</span>
                  </div>
                  <div className="table-cell">
                    <span className={classNames('amount', t.amount >= 0 ? 'positive' : 'negative')}>
                      {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="table-cell">
                    <div className="action-buttons">
                      <button
                        className="action-btn action-btn--edit"
                        onClick={() => openEditModal(t)}
                        title="Editar transação"
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn action-btn--delete"
                        onClick={() => openDeleteModal(t)}
                        title="Excluir transação"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumo */}
        <div className="transactions-summary">
          <div className="summary-item">
            <span className="summary-label">Total de Receitas:</span>
            <span className="summary-value positive">
              {filteredTransactions
                .filter(t => t.amount > 0)
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total de Despesas:</span>
            <span className="summary-value negative">
              {filteredTransactions
                .filter(t => t.amount < 0)
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Saldo:</span>
            <span className={classNames('summary-value', filteredTransactions.reduce((sum, t) => sum + t.amount, 0) >= 0 ? 'positive' : 'negative')}>
              {filteredTransactions
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>
      </div>

      {/* Modal de Nova/Edição de Transação */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={closeTransactionModal}
        onAddTransaction={handleAddTransaction}
        onEditTransaction={handleEditTransaction}
        transactionToEdit={transactionToEdit}
        mode={modalMode}
      />

      {/* Modal de Confirmação de Exclusão */}
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
