interface TransactionErrorBannerProps {
  error: string;
  onDismiss: () => void;
}

export const TransactionErrorBanner = ({ error, onDismiss }: TransactionErrorBannerProps) => {
  return (
    <div className="error-banner">
      <span>⚠️ {error}</span>
      <button onClick={onDismiss}>✕</button>
    </div>
  );
};
