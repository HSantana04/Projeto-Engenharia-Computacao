import { type Transaction } from '../../../services/transactionService';
import { type SortField } from '../types/index';

interface TransactionTableProps {
  transactions: Transaction[];
  sortBy: SortField;
  sortOrder: 'asc' | 'desc';
  onToggleSort: (column: SortField) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transaction: Transaction) => void;
}

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export const TransactionTable = ({
  transactions,
  sortBy,
  sortOrder,
  onToggleSort,
  onEditTransaction,
  onDeleteTransaction
}: TransactionTableProps) => {
  return (
    <div className="transactions-table">
      <div className="table-header">
        <div
          className="table-cell table-header-cell clickable"
          onClick={() => onToggleSort('description')}
        >
          Descrição
          {sortBy === 'description' && (
            <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
          )}
        </div>
        <div
          className="table-cell table-header-cell clickable"
          onClick={() => onToggleSort('date')}
        >
          Data
          {sortBy === 'date' && (
            <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
          )}
        </div>
        <div className="table-cell table-header-cell">Categoria</div>
        <div
          className="table-cell table-header-cell clickable amount-header"
          onClick={() => onToggleSort('amount')}
        >
          Valor
          {sortBy === 'amount' && (
            <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
          )}
        </div>
        <div className="table-cell table-header-cell">Ações</div>
      </div>

      <div className="table-body">
        {transactions.map(t => (
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
                  onClick={() => onEditTransaction(t)}
                  title="Editar transação"
                >
                  ✏️
                </button>
                <button
                  className="action-btn action-btn--delete"
                  onClick={() => onDeleteTransaction(t)}
                  title="Excluir transação"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
