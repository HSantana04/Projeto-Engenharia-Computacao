import { useMemo, useState, useEffect } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import './Dashboard.css';
import ThemeToggle from '../components/ThemeToggle';
import TransactionModal from '../components/TransactionModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import transactionService, { type Transaction } from '../services/transactionService';

const initialTransactions: Transaction[] = [
  { id: '1', date: '2025-06-10', description: 'Salário', amount: 4000, category: 'Renda' },
  { id: '2', date: '2025-06-12', description: 'Mercado', amount: -320, category: 'Alimentação' },
  { id: '3', date: '2025-06-13', description: 'Restaurante', amount: -85.5, category: 'Alimentação' },
  { id: '4', date: '2025-06-14', description: 'Freelance', amount: 1200, category: 'Renda' },
  { id: '5', date: '2025-06-15', description: 'Transporte', amount: -50, category: 'Transporte' },
];

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => {
    const totalReceitas = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalDespesas = Math.abs(transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
    const saldo = totalReceitas - totalDespesas;
    return { saldo, totalReceitas, totalDespesas };
  }, [transactions]);

  // Gerar dados do gráfico baseados nas transações reais
  const chartData = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Criar array dos últimos 6 meses
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentYear, currentMonth - i, 1);
      const monthKey = month.toLocaleDateString('pt-BR', { month: 'short' });
      
      // Filtrar transações do mês
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

  // Carregar transações do backend quando disponível
  useEffect(() => {
    const loadTransactions = async () => {
      try {
       setIsLoading(true);
        const response = await transactionService.getTransactions();
        
        if (response.success && response.data) {
          setTransactions(response.data);
        } else {
          console.warn('Usando dados mockados:', response.error);
        }
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
        // Manter dados mockados em caso de erro
      } finally {
        setIsLoading(false);
      }
    };

    // Comentar esta linha para usar apenas dados mockados durante desenvolvimento
    // loadTransactions();
  }, []);

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

      // Chamar API do backend
      const response = await transactionService.createTransaction(transactionData);
      
      if (response.success && response.data) {
        // Adicionar nova transação ao estado local
        setTransactions(prev => [response.data!, ...prev]);
      } else {
        throw new Error(response.error || 'Erro ao criar transação');
      }
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      
      // Fallback: adicionar localmente se a API falhar
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        date: transactionData.date,
        description: transactionData.title,
        amount: transactionData.amount,
        category: transactionData.category
      };
      setTransactions(prev => [newTransaction, ...prev]);
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

      // Chamar API do backend
      const response = await transactionService.updateTransaction(id, transactionData);
      
      if (response.success && response.data) {
        // Atualizar transação no estado local
        setTransactions(prev => 
          prev.map(t => t.id === id ? response.data! : t)
        );
      } else {
        throw new Error(response.error || 'Erro ao atualizar transação');
      }
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      
      // Fallback: atualizar localmente se a API falhar
      const updatedTransaction: Transaction = {
        id,
        date: transactionData.date,
        description: transactionData.title,
        amount: transactionData.amount,
        category: transactionData.category
      };
      setTransactions(prev => 
        prev.map(t => t.id === id ? updatedTransaction : t)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;

    try {
      setIsLoading(true);
      setError(null);

      // Chamar API do backend
      const response = await transactionService.deleteTransaction(transactionToDelete.id);
      
      if (response.success) {
        // Remover transação do estado local
        setTransactions(prev => 
          prev.filter(t => t.id !== transactionToDelete.id)
        );
        setIsDeleteModalOpen(false);
        setTransactionToDelete(null);
      } else {
        throw new Error(response.error || 'Erro ao excluir transação');
      }
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      
      // Fallback: remover localmente se a API falhar
      setTransactions(prev => 
        prev.filter(t => t.id !== transactionToDelete.id)
      );
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
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

  return (
    <div className="dashboard">
      <div className="dashboard__container">
        <header className="dashboard__header">
          <div className="dashboard__heading">
            <h1 className="dashboard__title">FinanSmartAI </h1>
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
              <a className="link" href="#">Ver todas</a>
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
