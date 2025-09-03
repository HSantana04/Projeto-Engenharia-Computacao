import { Link } from 'react-router-dom';
import './Transactions.css';
import TransactionModal from '../components/TransactionModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { TransactionFilters } from './Transactions/TransactionFilters';
import { TransactionTable } from './Transactions/TransactionTable';
import { TransactionSummary } from './Transactions/TransactionSummary';
import { TransactionEmptyState } from './Transactions/TransactionEmptyState';
import { TransactionLoadingState } from './Transactions/TransactionLoadingState';
import { TransactionErrorBanner } from './Transactions/TransactionErrorBanner';

// Import hooks directly
import { 
  useTransactionFilters,
  useTransactionModals,
  useTransactionApi
} from './Transactions/hooks/index';

function Transactions() {
  // Hooks customizados para gerenciar estado
  const { transactions, isLoading, error, summary, handleAddTransaction, handleEditTransaction, handleDeleteTransaction, setError } = useTransactionApi();
  const { modalState, openCreateModal, openEditModal, openDeleteModal, closeTransactionModal, closeDeleteModal } = useTransactionModals();
  const {
    filters,
    categories,
    subcategories,
    filteredTransactions,
    updateCategory,
    updateSubcategory,
    updateSearchTerm,
    toggleSort
  } = useTransactionFilters(transactions);

  // Função para confirmar exclusão
  const confirmDeleteTransaction = async () => {
    if (!modalState.transactionToDelete) return;

    try {
      await handleDeleteTransaction(modalState.transactionToDelete.id);
      closeDeleteModal();
    } catch (error) {
      // Error is handled in the deleteTransaction function
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

        {/* Banner de erro */}
        {error && (
          <TransactionErrorBanner
            error={error}
            onDismiss={() => setError(null)}
          />
        )}

        {/* Componente de filtros */}
        <TransactionFilters
          searchTerm={filters.searchTerm}
          selectedCategory={filters.selectedCategory}
          selectedSubcategory={filters.selectedSubcategory}
          categories={categories}
          subcategories={subcategories}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSearchChange={updateSearchTerm}
          onCategoryChange={updateCategory}
          onSubcategoryChange={updateSubcategory}
          onToggleSort={toggleSort}
        />

        {/* Conteúdo dinâmico baseado no estado */}
        {isLoading ? (
          <TransactionLoadingState />
        ) : filteredTransactions.length === 0 ? (
          <TransactionEmptyState onAddTransaction={openCreateModal} />
        ) : (
          <>
            {/* Componente da tabela */}
            <TransactionTable
              transactions={filteredTransactions}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onToggleSort={toggleSort}
              onEditTransaction={openEditModal}
              onDeleteTransaction={openDeleteModal}
            />

            {/* Componente de resumo financeiro */}
            <TransactionSummary
              summary={summary}
              filteredCount={filteredTransactions.length}
              totalCount={transactions.length}
            />
          </>
        )}
      </div>

      {/* Modal de Nova/Edição de Transação */}
      <TransactionModal
        isOpen={modalState.isTransactionModalOpen}
        onClose={closeTransactionModal}
        onAddTransaction={handleAddTransaction}
        onEditTransaction={handleEditTransaction}
        transactionToEdit={modalState.transactionToEdit}
        mode={modalState.modalMode}
      />

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmationModal
        isOpen={modalState.isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteTransaction}
        transactionTitle={modalState.transactionToDelete?.description || ''}
        isLoading={modalState.isLoading}
      />
    </div>
  );
}

export default Transactions;
