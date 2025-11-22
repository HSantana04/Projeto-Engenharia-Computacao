import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
import transactionService from '../services/transactionService';
import { useEffect, useState, useMemo } from 'react';
function Transactions() {
    const { user, isLoading: authLoading } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState(null);
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [modalMode, setModalMode] = useState('create');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    // Carrega transações quando o usuário estiver disponível
    useEffect(() => {
        if (user) {
            loadTransactions();
        }
    }, [user]);
    const loadTransactions = async () => {
        if (!user)
            return;
        try {
            setIsLoading(true);
            const result = await transactionService.getTransactions(user.id);
            if (result.success)
                setTransactions(result.data || []);
            else
                setError(result.error || 'Erro ao carregar transações');
        }
        catch (err) {
            setError('Erro ao carregar transações');
            console.error(err);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleAddTransaction = async (data) => {
        if (!user)
            return;
        try {
            setIsLoading(true);
            const response = await transactionService.createTransaction(user.id, data);
            if (response.success && response.data) {
                setTransactions(prev => [response.data, ...prev]);
                setIsTransactionModalOpen(false);
            }
            else
                setError(response.error || 'Erro ao criar transação');
        }
        catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleEditTransaction = async (id, data) => {
        try {
            setIsLoading(true);
            const response = await transactionService.updateTransaction(id, data);
            if (response.success && response.data) {
                setTransactions(prev => prev.map(t => t.id === id ? response.data : t));
                setIsTransactionModalOpen(false);
            }
            else
                setError(response.error || 'Erro ao atualizar transação');
        }
        catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleDeleteTransaction = async () => {
        if (!transactionToDelete)
            return;
        try {
            setIsLoading(true);
            const response = await transactionService.deleteTransaction(transactionToDelete.id);
            if (response.success) {
                setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
                setIsDeleteModalOpen(false);
                setTransactionToDelete(null);
            }
            else
                setError(response.error || 'Erro ao excluir transação');
        }
        catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        }
        finally {
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
    const openEditModal = (t) => { setModalMode('edit'); setTransactionToEdit(t); setIsTransactionModalOpen(true); };
    const openDeleteModal = (t) => { setTransactionToDelete(t); setIsDeleteModalOpen(true); };
    const closeTransactionModal = () => { setIsTransactionModalOpen(false); setTransactionToEdit(null); setError(null); };
    const closeDeleteModal = () => { setIsDeleteModalOpen(false); setTransactionToDelete(null); };
    if (authLoading || isLoading)
        return _jsx(TransactionLoadingState, {});
    return (_jsxs("div", { className: "transactions", children: [_jsxs("div", { className: "transactions__container", children: [_jsxs("header", { className: "transactions__header", children: [_jsxs("div", { className: "transactions__heading", children: [_jsx(Link, { to: "/dashboard", className: "back-link", children: "\u2190 Voltar ao Dashboard" }), _jsx("h1", { className: "transactions__title", children: "Todas as Transa\u00E7\u00F5es" }), _jsxs("p", { className: "transactions__subtitle", children: [transactions.length, " transa\u00E7\u00F5es"] })] }), _jsx("button", { className: "btn btn-primary", onClick: openCreateModal, children: "+ Nova transa\u00E7\u00E3o" })] }), error && _jsx(TransactionErrorBanner, { error: error, onDismiss: () => setError(null) }), transactions.length === 0 ? (_jsx(TransactionEmptyState, { onAddTransaction: openCreateModal })) : (_jsxs(_Fragment, { children: [_jsx(TransactionTable, { transactions: transactions, onEditTransaction: openEditModal, onDeleteTransaction: openDeleteModal }), _jsx(TransactionSummary, { summary: summary, filteredCount: transactions.length, totalCount: transactions.length })] }))] }), _jsx(TransactionModal, { isOpen: isTransactionModalOpen, onClose: closeTransactionModal, onAddTransaction: handleAddTransaction, onEditTransaction: handleEditTransaction, transactionToEdit: transactionToEdit, mode: modalMode }), _jsx(DeleteConfirmationModal, { isOpen: isDeleteModalOpen, onClose: closeDeleteModal, onConfirm: handleDeleteTransaction, transactionTitle: transactionToDelete?.description || '', isLoading: isLoading })] }));
}
export default Transactions;
