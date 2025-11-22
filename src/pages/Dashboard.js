import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import './Dashboard.css';
import ThemeToggle from '../components/ThemeToggle';
import TransactionModal from '../components/TransactionModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useAuth } from '../contexts/AuthContext';
import transactionService from '../services/transactionService';
function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}
function Dashboard() {
    const { user, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState(null);
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [modalMode, setModalMode] = useState('create');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    // Redirecionar se não autenticado
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [authLoading, user, navigate]);
    // Carregar transações do usuário
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
            if (result.success) {
                setTransactions(result.data || []);
            }
            else {
                setError(result.error || 'Erro ao carregar transações');
            }
        }
        catch (err) {
            setError('Erro ao carregar transações');
            console.error(err);
        }
        finally {
            setIsLoading(false);
        }
    };
    const summary = useMemo(() => {
        const totalReceitas = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
        const totalDespesas = Math.abs(transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
        const saldo = totalReceitas - totalDespesas;
        return { saldo, totalReceitas, totalDespesas };
    }, [transactions]);
    const chartData = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const month = new Date(currentYear, currentMonth - i, 1);
            const monthKey = month.toLocaleDateString('pt-BR', { month: 'short' });
            const monthTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getMonth() === month.getMonth() &&
                    transactionDate.getFullYear() === month.getFullYear();
            });
            const receita = monthTransactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
            const despesa = Math.abs(monthTransactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
            months.push({
                month: monthKey,
                receita: Math.round(receita * 100) / 100,
                despesa: Math.round(despesa * 100) / 100
            });
        }
        return months;
    }, [transactions]);
    const handleAddTransaction = async (transactionData) => {
        if (!user)
            return;
        try {
            setIsLoading(true);
            setError(null);
            const response = await transactionService.createTransaction(user.id, transactionData);
            if (response.success && response.data) {
                setTransactions(prev => [response.data, ...prev]);
                setIsTransactionModalOpen(false);
            }
            else {
                setError(response.error || 'Erro ao criar transação');
            }
        }
        catch (error) {
            console.error('Erro ao criar transação:', error);
            setError(error instanceof Error ? error.message : 'Erro desconhecido');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleEditTransaction = async (id, transactionData) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await transactionService.updateTransaction(id, transactionData);
            if (response.success && response.data) {
                setTransactions(prev => prev.map(t => t.id === id ? response.data : t));
                setIsTransactionModalOpen(false);
            }
            else {
                setError(response.error || 'Erro ao atualizar transação');
            }
        }
        catch (error) {
            console.error('Erro ao atualizar transação:', error);
            setError(error instanceof Error ? error.message : 'Erro desconhecido');
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
            setError(null);
            const response = await transactionService.deleteTransaction(transactionToDelete.id);
            if (response.success) {
                setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
                setIsDeleteModalOpen(false);
                setTransactionToDelete(null);
            }
            else {
                setError(response.error || 'Erro ao excluir transação');
            }
        }
        catch (error) {
            console.error('Erro ao excluir transação:', error);
            setError(error instanceof Error ? error.message : 'Erro desconhecido');
        }
        finally {
            setIsLoading(false);
        }
    };
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
    if (authLoading) {
        return _jsx("div", { className: "dashboard__loading", children: "Carregando..." });
    }
    return (_jsxs("div", { className: "dashboard", children: [_jsxs("div", { className: "dashboard__container", children: [_jsxs("header", { className: "dashboard__header", children: [_jsxs("div", { className: "dashboard__heading", children: [_jsx("h1", { className: "dashboard__title", children: "FinanSmartAI" }), _jsx("p", { className: "dashboard__subtitle", children: "Seu resumo financeiro, em um s\u00F3 lugar" })] }), _jsxs("div", { className: "dashboard__actions", children: [_jsx(ThemeToggle, {}), _jsx("button", { className: "btn btn-outline", onClick: openCreateModal, children: "+ Nova transa\u00E7\u00E3o" }), _jsx("button", { className: "btn btn-primary", children: "Exportar" })] })] }), error && (_jsxs("div", { className: "error-banner", children: [_jsxs("span", { children: ["\u26A0\uFE0F ", error] }), _jsx("button", { onClick: () => setError(null), children: "\u2715" })] })), _jsxs("section", { className: "kpis", children: [_jsxs("div", { className: "card", children: [_jsxs("div", { className: "card__row", children: [_jsxs("div", { children: [_jsx("p", { className: "card__label", children: "Saldo" }), _jsx("p", { className: classNames('card__value', summary.saldo >= 0 ? 'positive' : 'negative'), children: summary.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) })] }), _jsx("div", { className: "card__icon", children: "\uD83D\uDCB0" })] }), _jsx("div", { className: "card__blur card__blur--green" })] }), _jsxs("div", { className: "card", children: [_jsxs("div", { className: "card__row", children: [_jsxs("div", { children: [_jsx("p", { className: "card__label", children: "Receitas" }), _jsx("p", { className: "card__value positive", children: summary.totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) })] }), _jsx("div", { className: "card__icon", children: "\uD83D\uDCC8" })] }), _jsx("div", { className: "card__blur card__blur--green" })] }), _jsxs("div", { className: "card", children: [_jsxs("div", { className: "card__row", children: [_jsxs("div", { children: [_jsx("p", { className: "card__label", children: "Despesas" }), _jsx("p", { className: "card__value negative", children: summary.totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) })] }), _jsx("div", { className: "card__icon", children: "\uD83D\uDCC9" })] }), _jsx("div", { className: "card__blur card__blur--red" })] })] }), _jsxs("section", { className: "content", children: [_jsxs("div", { className: "panel panel--chart", children: [_jsxs("div", { className: "panel__head", children: [_jsx("h2", { className: "panel__title", children: "Evolu\u00E7\u00E3o de receitas e despesas" }), _jsxs("div", { className: "legend", children: [_jsx("span", { className: "legend__pill legend__pill--green", children: "Receitas" }), _jsx("span", { className: "legend__pill legend__pill--red", children: "Despesas" })] })] }), _jsx("div", { className: "chart", children: _jsx(ResponsiveContainer, { children: _jsxs(AreaChart, { data: chartData, children: [_jsxs("defs", { children: [_jsxs("linearGradient", { id: "receita", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#10b981", stopOpacity: 0.3 }), _jsx("stop", { offset: "95%", stopColor: "#10b981", stopOpacity: 0 })] }), _jsxs("linearGradient", { id: "despesa", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#ef4444", stopOpacity: 0.3 }), _jsx("stop", { offset: "95%", stopColor: "#ef4444", stopOpacity: 0 })] })] }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }), _jsx(XAxis, { dataKey: "month", stroke: "#9ca3af" }), _jsx(YAxis, { stroke: "#9ca3af" }), _jsx(Tooltip, { contentStyle: { borderRadius: 12, border: '1px solid #e5e7eb' }, formatter: (value) => [
                                                            value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                                                            'Valor'
                                                        ] }), _jsx(Area, { type: "monotone", dataKey: "receita", stroke: "#10b981", fillOpacity: 1, fill: "url(#receita)" }), _jsx(Area, { type: "monotone", dataKey: "despesa", stroke: "#ef4444", fillOpacity: 1, fill: "url(#despesa)" })] }) }) })] }), _jsxs("div", { className: "panel", children: [_jsxs("div", { className: "panel__head", children: [_jsx("h2", { className: "panel__title", children: "\u00DAltimas transa\u00E7\u00F5es" }), _jsx(Link, { className: "link", to: "/transactions", children: "Ver todas" })] }), _jsx("ul", { className: "list", children: transactions.slice(0, 5).map(t => (_jsxs("li", { className: "list__item", children: [_jsxs("div", { className: "list__left", children: [_jsx("div", { className: classNames('list__avatar', t.amount >= 0 ? 'avatar--green' : 'avatar--red'), children: t.amount >= 0 ? '⬆️' : '⬇️' }), _jsxs("div", { children: [_jsx("p", { className: "list__title", children: t.description }), _jsxs("div", { className: "list__meta", children: [_jsx("span", { className: "list__date", children: new Date(t.date).toLocaleDateString('pt-BR') }), _jsx("span", { className: "badge", children: t.category })] })] })] }), _jsxs("div", { className: "list__right", children: [_jsx("div", { className: classNames('amount', t.amount >= 0 ? 'positive' : 'negative'), children: t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }), _jsxs("div", { className: "list__actions", children: [_jsx("button", { className: "action-btn action-btn--edit", onClick: () => openEditModal(t), title: "Editar transa\u00E7\u00E3o", children: "\u270F\uFE0F" }), _jsx("button", { className: "action-btn action-btn--delete", onClick: () => openDeleteModal(t), title: "Excluir transa\u00E7\u00E3o", children: "\uD83D\uDDD1\uFE0F" })] })] })] }, t.id))) }), transactions.length === 0 && !isLoading && (_jsxs("div", { className: "empty-state", children: [_jsx("p", { children: "Nenhuma transa\u00E7\u00E3o encontrada" }), _jsx("button", { className: "btn btn-primary", onClick: openCreateModal, children: "Adicionar primeira transa\u00E7\u00E3o" })] }))] })] })] }), _jsx(TransactionModal, { isOpen: isTransactionModalOpen, onClose: closeTransactionModal, onAddTransaction: handleAddTransaction, onEditTransaction: handleEditTransaction, transactionToEdit: transactionToEdit, mode: modalMode }), _jsx(DeleteConfirmationModal, { isOpen: isDeleteModalOpen, onClose: closeDeleteModal, onConfirm: handleDeleteTransaction, transactionTitle: transactionToDelete?.description || '', isLoading: isLoading })] }));
}
export default Dashboard;
