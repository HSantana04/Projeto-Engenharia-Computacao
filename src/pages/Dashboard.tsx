import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import './Dashboard.css';
import ThemeToggle from '../components/ThemeToggle';
import TransactionModal from '../components/TransactionModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import transactionService, { type Transaction } from '../services/transactionService';

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function Dashboard() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========== CARREGAR TRANSAÇÕES DO BACKEND ==========
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('accessToken');

        // Se não tem token, redirecionar para login
        if (!token) {
          navigate('/login');
          return;
        }

        // Chamar API do backend
        const response = await fetch('http://localhost:5217/api/Transactions', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Response status:', response);

        if (response.status === 401) {
          // Token expirou, redirecionar para login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/login');
          return;
        }

        if (!response.ok) {
          throw new Error(`Erro ao carregar transações: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Mapear dados da API para o formato esperado
        const mappedTransactions = data.map((t: any) => ({
          id: t.id,
          date: t.date,
          description: t.description,
          amount: t.amount,
          category: t.category
        }));

        setTransactions(mappedTransactions);
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
        setError(error instanceof Error ? error.message : 'Erro ao carregar transações');
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [navigate]);

  // ========== CALCULAR RESUMO ==========
  const summary = useMemo(() => {
    const totalReceitas = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalDespesas = Math.abs(transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
    const saldo = totalReceitas - totalDespesas;
    return { saldo, totalReceitas, totalDespesas };
  }, [transactions]);

  // ========== GERAR DADOS DO GRÁFICO ==========
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

  // ========== CRIAR TRANSAÇÃO ==========
  const handleAddTransaction = async (transactionData: {
    type: 'receita' | 'despesa';
    title: string;
    amount: number;
    category: string;
    date: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5217/api/Transactions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: transactionData.type,
          title: transactionData.title,
          amount: transactionData.amount,
          category: transactionData.category,
          date: transactionData.date
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar transação');
      }

      const newTransaction = await response.json();

      // Mapear resposta
      const mappedTransaction: Transaction = {
        id: newTransaction.id,
        date: newTransaction.date,
        description: newTransaction.description,
        amount: newTransaction.amount,
        category: newTransaction.category
      };

      setTransactions(prev => [mappedTransaction, ...prev]);
      setIsTransactionModalOpen(false);
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  // ========== EDITAR TRANSAÇÃO ==========
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

      const token = localStorage.getItem('accessToken');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5217/api/Transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: transactionData.type,
          title: transactionData.title,
          amount: transactionData.amount,
          category: transactionData.category,
          date: transactionData.date
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar transação');
      }

      const updatedTransaction = await response.json();

      const mappedTransaction: Transaction = {
        id: updatedTransaction.id,
        date: updatedTransaction.date,
        description: updatedTransaction.description,
        amount: updatedTransaction.amount,
        category: updatedTransaction.category
      };

      setTransactions(prev => 
        prev.map(t => t.id === id ? mappedTransaction : t)
      );
      setIsTransactionModalOpen(false);
    } catch (error) {
      console.error('Erro ao editar transação:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  // ========== DELETAR TRANSAÇÃO ==========
  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;

    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5217/api/Transactions/${transactionToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar transação');
      }

      setTransactions(prev => 
        prev.filter(t => t.id !== transactionToDelete.id)
      );
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
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

  // ========== RENDER ==========
  if (isLoading && transactions.length === 0) {
    return (
      <div className="dashboard">
        <div className="dashboard__container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando transações...</p>
          </div>
        </div>
      </div>
    );
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
            <Link to="/profile" className="btn btn-primary">
              👤 Perfil
            </Link>
          </div>
        </header>

        {/* Mensagem de erro */}
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
              {chartData.length > 0 ? (
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
              ) : (
                <div className="empty-chart">
                  <p>Nenhuma transação para exibir no gráfico</p>
                </div>
              )}
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
            {transactions.length === 0 && (
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

      {/* Modal de Nova/Edição de Transação */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={closeTransactionModal}
        onAddTransaction={handleAddTransaction}
        onEditTransaction={handleEditTransaction}
        transactionToEdit={transactionToEdit}
        mode={modalMode}
      />

      {/* Modal de Confirmação de Exclusão */}
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