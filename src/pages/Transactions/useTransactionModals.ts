import { useState } from 'react';
import { type Transaction } from '../../services/transactionService';
import { type ModalState, type ModalMode } from './types/index';

export const useTransactionModals = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isTransactionModalOpen: false,
    isDeleteModalOpen: false,
    transactionToEdit: null,
    transactionToDelete: null,
    modalMode: 'create',
    error: null,
    isLoading: false
  });

  const openCreateModal = () => {
    setModalState(prev => ({
      ...prev,
      modalMode: 'create',
      transactionToEdit: null,
      isTransactionModalOpen: true,
      error: null
    }));
  };

  const openEditModal = (transaction: Transaction) => {
    setModalState(prev => ({
      ...prev,
      modalMode: 'edit',
      transactionToEdit: transaction,
      isTransactionModalOpen: true,
      error: null
    }));
  };

  const openDeleteModal = (transaction: Transaction) => {
    setModalState(prev => ({
      ...prev,
      transactionToDelete: transaction,
      isDeleteModalOpen: true
    }));
  };

  const closeTransactionModal = () => {
    setModalState(prev => ({
      ...prev,
      isTransactionModalOpen: false,
      transactionToEdit: null,
      error: null
    }));
  };

  const closeDeleteModal = () => {
    setModalState(prev => ({
      ...prev,
      isDeleteModalOpen: false,
      transactionToDelete: null
    }));
  };

  const setLoading = (loading: boolean) => {
    setModalState(prev => ({
      ...prev,
      isLoading: loading
    }));
  };

  const setError = (error: string | null) => {
    setModalState(prev => ({
      ...prev,
      error
    }));
  };

  const handleDeleteConfirm = async (deleteTransaction: (id: string) => Promise<void>) => {
    if (!modalState.transactionToDelete) return;

    try {
      await deleteTransaction(modalState.transactionToDelete.id);
      closeDeleteModal();
    } catch (error) {
      // Error is handled in the deleteTransaction function
    }
  };

  return {
    modalState,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeTransactionModal,
    closeDeleteModal,
    setLoading,
    setError,
    handleDeleteConfirm
  };
};
