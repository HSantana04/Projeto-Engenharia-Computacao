interface TransactionEmptyStateProps {
  onAddTransaction: () => void;
}

export const TransactionEmptyState = ({ onAddTransaction }: TransactionEmptyStateProps) => {
  return (
    <div className="empty-state">
      <p>Nenhuma transação encontrada</p>
      <button className="btn btn-primary" onClick={onAddTransaction}>
        Adicionar primeira transação
      </button>
    </div>
  );
};
