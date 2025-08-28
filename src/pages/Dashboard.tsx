import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import './Dashboard.css';
import ThemeToggle from '../components/ThemeToggle';

const mockRevenueExpense = [
  { month: 'Jan', receita: 3200, despesa: 2100 },
  { month: 'Fev', receita: 2800, despesa: 1900 },
  { month: 'Mar', receita: 3500, despesa: 2400 },
  { month: 'Abr', receita: 3000, despesa: 2200 },
  { month: 'Mai', receita: 3800, despesa: 2600 },
  { month: 'Jun', receita: 4000, despesa: 2700 },
];

const mockTransactions = [
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
  const summary = useMemo(() => {
    const totalReceitas = mockTransactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalDespesas = Math.abs(mockTransactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
    const saldo = totalReceitas - totalDespesas;
    return { saldo, totalReceitas, totalDespesas };
  }, []);

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
            <button className="btn btn-outline">+ Nova transação</button>
            <button className="btn btn-primary">Exportar</button>
          </div>
        </header>

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
                <AreaChart data={mockRevenueExpense}>
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
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
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
              {mockTransactions.map(t => (
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
                  <div className={classNames('amount', t.amount >= 0 ? 'positive' : 'negative')}>
                    {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
