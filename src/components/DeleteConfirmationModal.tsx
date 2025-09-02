import './DeleteConfirmationModal.css';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transactionTitle: string;
  isLoading?: boolean;
}

function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  transactionTitle, 
  isLoading = false 
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay" onClick={onClose}>
      <div className="delete-modal" onClick={e => e.stopPropagation()}>
        <div className="delete-modal__header">
          <div className="delete-modal__icon">🗑️</div>
          <h2>Confirmar Exclusão</h2>
        </div>

        <div className="delete-modal__content">
          <p>
            Tem certeza que deseja excluir a transação <strong>"{transactionTitle}"</strong>?
          </p>
          <p className="delete-modal__warning">
            Esta ação não pode ser desfeita.
          </p>
        </div>

        <div className="delete-modal__actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>Excluindo...</span>
              </div>
            ) : (
              'Excluir Transação'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;
