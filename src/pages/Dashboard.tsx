import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import './Dashboard.css';
import ThemeToggle from '../components/ThemeToggle';
import TransactionModal from '../components/TransactionModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useAuth } from '../contexts/AuthContext';
import transactionService, { type Transaction } from '../services/transactionService';

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!user) return;
    
    try {
      setIsLoading(true);
      const result = await transactionService.getTransactions(user.id);
      
      if (result.success) {
        setTransactions(result.data || []);
      } else {
        setError(result.error || 'Erro ao carregar transações');
      }
    } catch (err) {
      setError('Erro ao carregar transações');
      console.error(err);
    } finally {
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

  const handleAddTransaction = async (transactionData: {
    type: 'receita' | 'despesa';
    title: string;
    amount: number;
    category: string;
    date: string;
  }) => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await transactionService.createTransaction(user.id, transactionData);
      
      if (response.success && response.data) {
        setTransactions(prev => [response.data!, ...prev]);
        setIsTransactionModalOpen(false);
      } else {
        setError(response.error || 'Erro ao criar transação');
      }
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
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

      const response = await transactionService.updateTransaction(id, transactionData);
      
      if (response.success && response.data) {
        setTransactions(prev => 
          prev.map(t => t.id === id ? response.data! : t)
        );
        setIsTransactionModalOpen(false);
      } else {
        setError(response.error || 'Erro ao atualizar transação');
      }
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await transactionService.deleteTransaction(transactionToDelete.id);
      
      if (response.success) {
        setTransactions(prev => 
          prev.filter(t => t.id !== transactionToDelete.id)
        );
        setIsDeleteModalOpen(false);
        setTransactionToDelete(null);
      } else {
        setError(response.error || 'Erro ao excluir transação');
      }
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
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

  if (authLoading) {
    return <div className="dashboard__loading">Carregando...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard__container">
        <header className="dashboard__header">
          <div className="dashboard__heading">
            <h1 className="dashboard__title">FinanSmartAI</h1>
            <p className="dashboard__subtitle">Seu resumo financeiro, em um só lugar</p>
          </div>
          <div className="dashboard__actions">
            <ThemeToggle />
            <button className="btn btn-outline" onClick={openCreateModal}>
              + Nova transação
            </button>
            <button className="btn btn-primary">Exportar</button>
          </div>
        </header>

        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <section className="kpis">
          <div className="card">
            <div className="card__row">
              <div>
                <p className="card__label">Saldo</p>
                <p className={classNames('card__value', summary.saldo >= 0 ? 'positive' : 'negative')}>
                  {summary.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <div className="card__icon">💰</div>
            </div>
            <div className="card__blur card__blur--green" />
          </div>

          <div className="card">
            <div className="card__row">
              <div>
                <p className="card__label">Receitas</p>
                <p className="card__value positive">
                  {summary.totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <div className="card__icon">📈</div>
            </div>
            <div className="card__blur card__blur--green" />
          </div>

          <div className="card">
            <div className="card__row">
              <div>
                <p className="card__label">Despesas</p>
                <p className="card__value negative">
                  {summary.totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <div className="card__icon">📉</div>
            </div>
            <div className="card__blur card__blur--red" />
          </div>
        </section>

        <section className="content">
          <div className="panel panel--chart">
            <div className="panel__head">
              <h2 className="panel__title">Evolução de receitas e despesas</h2>
              <div className="legend">
                <span className="legend__pill legend__pill--green">Receitas</span>
                <span className="legend__pill legend__pill--red">Despesas</span>
              </div>
            </div>
            <div className="chart">
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="receita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="despesa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }}
                    formatter={(value: number) => [
                      value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                      'Valor'
                    ]}
                  />
                  <Area type="monotone" dataKey="receita" stroke="#10b981" fillOpacity={1} fill="url(#receita)" />
                  <Area type="monotone" dataKey="despesa" stroke="#ef4444" fillOpacity={1} fill="url(#despesa)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel">
            <div className="panel__head">
              <h2 className="panel__title">Últimas transações</h2>
              <Link className="link" to="/transactions">Ver todas</Link>
            </div>
            <ul className="list">
              {transactions.slice(0, 5).map(t => (
                <li key={t.id} className="list__item">
                  <div className="list__left">
                    <div className={classNames('list__avatar', t.amount >= 0 ? 'avatar--green' : 'avatar--red')}>
                      {t.amount >= 0 ? '⬆️' : '⬇️'}
                    </div>
                    <div>
                      <p className="list__title">{t.description}</p>
                      <div className="list__meta">
                        <span className="list__date">{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                        <span className="badge">{t.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="list__right">
                    <div className={classNames('amount', t.amount >= 0 ? 'positive' : 'negative')}>
                      {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                    <div className="list__actions">
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
                </li>
              ))}
            </ul>
            {transactions.length === 0 && !isLoading && (
              <div className="empty-state">
                <p>Nenhuma transação encontrada</p>
                <button className="btn btn-primary" onClick={openCreateModal}>
                  Adicionar primeira transação
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={closeTransactionModal}
        onAddTransaction={handleAddTransaction}
        onEditTransaction={handleEditTransaction}
        transactionToEdit={transactionToEdit}
        mode={modalMode}
      />

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

export default Dashboard;