interface TransactionLoadingStateProps {
  message?: string;
}

export const TransactionLoadingState = ({
  message = "Carregando transações..."
}: TransactionLoadingStateProps) => {
  return (
    <div className="loading-state">
      <div className="loading-spinner"></div>
      <p>{message}</p>
    </div>
  );
};
