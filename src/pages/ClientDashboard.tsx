import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Target, TrendingUp, Wallet, ArrowDownCircle, ArrowUpCircle, Plus, X, Pencil, Trash2, Save, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';
import { useAuthRole } from '../hooks/useAuthRole';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Input } from '../components/ui/Input';
import { formatCurrency } from '../utils/formatCurrency';
import { SchoolFundsPanel } from '../components/SchoolFundsPanel';

type PositionRow = Database['public']['Tables']['positions']['Row'];

// ========== REVOLUT DESIGN SYSTEM ==========
const REVOLUT_COLORS = {
  primary: '#494fdf',
  canvasDark: '#000000',
  canvasLight: '#ffffff',
  ink: '#191c1f',
  body: '#1f2226',
  onDark: '#ffffff',
  onDarkMute: 'rgba(255,255,255,0.72)',
  surfaceElevated: '#16181a',
  surfaceSoft: '#f4f4f4',
  hairlineLight: '#e2e2e7',
  hairlineDark: 'rgba(255,255,255,0.12)',
  accentTeal: '#00a87e',
  accentBlue: '#007bc2',
  accentPink: '#e61e49',
  accentGreen: '#428619',
  accentWarning: '#ec7e00',
};

const CHART_COLORS = [
  REVOLUT_COLORS.accentBlue,
  REVOLUT_COLORS.accentTeal,
  REVOLUT_COLORS.accentPink,
  REVOLUT_COLORS.accentGreen,
  REVOLUT_COLORS.accentWarning,
  REVOLUT_COLORS.primary,
];

// Revolut Button Component
const RevolutButton = ({ children, variant = 'primary', size = 'md', ...props }: any) => {
  const baseClasses = 'rounded-full font-medium transition-all duration-200 flex items-center justify-center gap-2';
  const variants = {
    primary: 'bg-white text-black hover:bg-slate-100',
    dark: 'bg-black text-white hover:bg-slate-900 border border-white/10',
    soft: 'bg-slate-100 text-black hover:bg-slate-200',
    ghost: 'bg-transparent text-white hover:bg-white/10 border border-white/20',
  };
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-7 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  return (
    <button className={`${baseClasses} ${variants[variant]} ${sizes[size]}`} {...props}>
      {children}
    </button>
  );
};

// ========== MAIN COMPONENT ==========
export const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, role, clientProfile } = useAuthRole();
  const [positions, setPositions] = useState<PositionRow[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [classification, setClassification] = useState<'gestao_financeira' | 'escola'>('gestao_financeira');

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txForm, setTxForm] = useState({ description: '', amount: '', type: 'receita', category: '', date: '' });
  const [posForm, setPosForm] = useState({ asset_name: '', institution: '', asset_type: '', amount: '', quantity: '' });
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [editTxValues, setEditTxValues] = useState<any>({});

  useEffect(() => {
    if (authLoading) return;

    if (!user || role !== 'cliente' || !clientProfile) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const { data: clientData } = await supabase
          .from('clients')
          .select('classification')
          .eq('id', clientProfile.id)
          .single();
        if (clientData) {
          setClassification(clientData.classification as any);
        }
        const { data } = await supabase
          .from('positions')
          .select('*')
          .eq('client_id', clientProfile.id)
          .order('amount', { ascending: false })
          .returns<PositionRow[]>();
        setPositions(data ?? []);

        const { data: txData } = await supabase
          .from('transactions')
          .select('*')
          .eq('client_id', clientProfile.id)
          .order('date', { ascending: false });
        setTransactions(txData ?? []);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [authLoading, user, role, clientProfile]);

  useEffect(() => {
    if (authLoading || loading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (role === 'consultor') {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, loading, user, role, navigate]);

  if (authLoading || loading) {
    return (
      <div style={{ backgroundColor: REVOLUT_COLORS.canvasDark }} className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  if (!clientProfile) {
    return (
      <div style={{ color: REVOLUT_COLORS.body }} className="text-center py-12">
        Não foi possível carregar seu perfil de cliente.
      </div>
    );
  }

  const totalValue = positions.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalReceitas = transactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalDespesas = transactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + Number(t.amount), 0);
  const saldoTransactions = totalReceitas - totalDespesas;

  const assetTypeData = positions.reduce(
    (acc, p) => {
      const existing = acc.find((item) => item.name === p.asset_type);
      if (existing) existing.value += Number(p.amount);
      else acc.push({ name: p.asset_type, value: Number(p.amount) });
      return acc;
    },
    [] as { name: string; value: number }[]
  );

  const monthlyDataMap = transactions.reduce((acc, t) => {
    if (!t.date) return acc;
    const monthKey = t.date.substring(0, 7);
    if (!acc[monthKey]) {
      acc[monthKey] = { name: monthKey, Receitas: 0, Despesas: 0, Saldo: 0 };
    }
    if (t.type === 'receita') {
      acc[monthKey].Receitas += Number(t.amount);
    } else if (t.type === 'despesa') {
      acc[monthKey].Despesas += Number(t.amount);
    }
    return acc;
  }, {} as Record<string, { name: string; Receitas: number; Despesas: number; Saldo: number }>);

  const monthlyData = Object.values(monthlyDataMap)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((item) => {
      const [year, month] = item.name.split('-');
      return {
        ...item,
        name: `${month}/${year.slice(2)}`,
        Saldo: item.Receitas - item.Despesas,
      };
    });

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientProfile) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('transactions').insert([{
        client_id: clientProfile.id,
        description: txForm.description,
        amount: Number(txForm.amount),
        type: txForm.type,
        category: txForm.category,
        date: txForm.date || new Date().toISOString().split('T')[0]
      }]);
      if (error) throw error;
      setIsTxModalOpen(false);
      setTxForm({ description: '', amount: '', type: 'receita', category: '', date: '' });
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('client_id', clientProfile.id)
        .order('date', { ascending: false });
      setTransactions(data ?? []);
    } catch (err: any) {
      console.error('Error adding transaction:', err);
      alert('Erro ao adicionar transação: ' + (err?.message || 'Erro desconhecido'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientProfile) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('positions').insert([{
        client_id: clientProfile.id,
        asset_name: posForm.asset_name,
        institution: posForm.institution,
        asset_type: posForm.asset_type,
        amount: Number(posForm.amount),
        quantity: Number(posForm.quantity),
        date: new Date().toISOString().split('T')[0]
      }]);
      if (error) throw error;
      setIsPosModalOpen(false);
      setPosForm({ asset_name: '', institution: '', asset_type: '', amount: '', quantity: '' });
      const { data } = await supabase
        .from('positions')
        .select('*')
        .eq('client_id', clientProfile.id)
        .order('amount', { ascending: false })
        .returns<PositionRow[]>();
      setPositions(data ?? []);
    } catch (err: any) {
      console.error('Error adding position:', err);
      alert('Erro ao adicionar investimento: ' + (err?.message || 'Erro desconhecido'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTx = (tx: any) => {
    setEditingTxId(tx.id);
    setEditTxValues({ ...tx });
  };

  const handleSaveTxEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          description: editTxValues.description,
          amount: Number(editTxValues.amount),
          type: editTxValues.type,
          category: editTxValues.category,
          date: editTxValues.date
        })
        .eq('id', id);
      if (error) throw error;
      setTransactions(transactions.map(t => t.id === id ? { ...t, ...editTxValues } : t));
      setEditingTxId(null);
      setEditTxValues({});
    } catch (err: any) {
      console.error('Error updating transaction:', err);
      alert('Erro ao atualizar transação: ' + (err?.message || 'Erro desconhecido'));
    }
  };

  const handleDeleteTx = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir esta transação?')) return;
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (err: any) {
      console.error('Error deleting transaction:', err);
      alert('Erro ao excluir transação: ' + (err?.message || 'Erro desconhecido'));
    }
  };

  // ========== SCHOOL CLASSIFICATION ==========
  if (classification === 'escola') {
    return (
      <div style={{ backgroundColor: REVOLUT_COLORS.canvasDark }}>
        {/* Hero Band */}
        <div style={{ backgroundColor: REVOLUT_COLORS.canvasDark }} className="pt-16 pb-24">
          <div className="max-w-5xl mx-auto px-6 sm:px-8">
            <p style={{ color: REVOLUT_COLORS.onDarkMute }} className="text-sm font-medium tracking-wide">GESTÃO ESCOLAR</p>
            <h1 style={{ color: REVOLUT_COLORS.onDark, fontFamily: 'Aeonik Pro, sans-serif', fontSize: '80px', fontWeight: 500, letterSpacing: '-0.8px', lineHeight: 1.0 }} className="mt-4">
              Olá,<br />{clientProfile.name.split(' ')[0]}
            </h1>
          </div>
        </div>

        {/* Light Canvas */}
        <div style={{ backgroundColor: REVOLUT_COLORS.canvasLight }} className="py-16">
          <div className="max-w-5xl mx-auto px-6 sm:px-8">
            <SchoolFundsPanel clientId={clientProfile.id} />
          </div>
        </div>
      </div>
    );
  }

  // ========== FINANCIAL CLASSIFICATION ==========
  return (
    <div style={{ backgroundColor: REVOLUT_COLORS.canvasDark }}>
      {/* ========== HERO BAND (DARK) ========== */}
      <div style={{ backgroundColor: REVOLUT_COLORS.canvasDark }} className="pt-16 pb-24">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <p style={{ color: REVOLUT_COLORS.onDarkMute }} className="text-sm font-medium tracking-wide">MEU PATRIMÔNIO</p>
          <h1 style={{ color: REVOLUT_COLORS.onDark, fontFamily: 'Aeonik Pro, sans-serif', fontSize: '80px', fontWeight: 500, letterSpacing: '-0.8px', lineHeight: 1.0 }} className="mt-4">
            Olá,<br />{clientProfile.name.split(' ')[0]}
          </h1>

          <div className="mt-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
            <div>
              <p style={{ color: REVOLUT_COLORS.onDarkMute }} className="text-sm font-medium">Total investido</p>
              <p style={{ color: REVOLUT_COLORS.onDark, fontFamily: 'Aeonik Pro, sans-serif', fontSize: '48px', fontWeight: 500, letterSpacing: '-0.48px' }} className="mt-3">
                {formatCurrency(totalValue)}
              </p>
              <p style={{ color: REVOLUT_COLORS.onDarkMute }} className="text-xs mt-2 font-medium tracking-wide">
                {positions.length} POSIÇÃO{positions.length !== 1 ? 'ÕES' : ''} CADASTRADA{positions.length !== 1 ? 'S' : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <RevolutButton variant="primary" size="md" onClick={() => navigate(`/client/${clientProfile.id}/goals`)}>
                <Target className="h-4 w-4" />
                Metas
              </RevolutButton>
              <RevolutButton variant="ghost" size="md" onClick={() => navigate(`/client/${clientProfile.id}`)}>
                <Wallet className="h-4 w-4" />
                Detalhes
              </RevolutButton>
            </div>
          </div>
        </div>
      </div>

      {/* ========== KPI CARDS BAND (LIGHT) ========== */}
      <div style={{ backgroundColor: REVOLUT_COLORS.canvasLight }} className="py-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Patrimônio */}
            <div style={{ backgroundColor: REVOLUT_COLORS.canvasLight, borderColor: REVOLUT_COLORS.hairlineLight }} className="rounded-lg border p-6 transition-all hover:shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p style={{ color: REVOLUT_COLORS.body }} className="text-sm font-medium">Patrimônio Total</p>
                  <p style={{ color: REVOLUT_COLORS.ink, fontFamily: 'Aeonik Pro, sans-serif', fontSize: '32px', fontWeight: 500, letterSpacing: '-0.32px' }} className="mt-2">
                    {formatCurrency(totalValue)}
                  </p>
                </div>
                <div style={{ backgroundColor: REVOLUT_COLORS.primary }} className="rounded-full p-3">
                  <TrendingUp style={{ color: REVOLUT_COLORS.onDark }} className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Posições */}
            <div style={{ backgroundColor: REVOLUT_COLORS.canvasLight, borderColor: REVOLUT_COLORS.hairlineLight }} className="rounded-lg border p-6 transition-all hover:shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p style={{ color: REVOLUT_COLORS.body }} className="text-sm font-medium">Posições Ativas</p>
                  <p style={{ color: REVOLUT_COLORS.ink, fontFamily: 'Aeonik Pro, sans-serif', fontSize: '32px', fontWeight: 500, letterSpacing: '-0.32px' }} className="mt-2">
                    {positions.length}
                  </p>
                </div>
                <div style={{ backgroundColor: REVOLUT_COLORS.accentBlue }} className="rounded-full p-3">
                  <Wallet style={{ color: '#fff' }} className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Tipos */}
            <div style={{ backgroundColor: REVOLUT_COLORS.canvasLight, borderColor: REVOLUT_COLORS.hairlineLight }} className="rounded-lg border p-6 transition-all hover:shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p style={{ color: REVOLUT_COLORS.body }} className="text-sm font-medium">Tipos de Ativo</p>
                  <p style={{ color: REVOLUT_COLORS.ink, fontFamily: 'Aeonik Pro, sans-serif', fontSize: '32px', fontWeight: 500, letterSpacing: '-0.32px' }} className="mt-2">
                    {assetTypeData.length}
                  </p>
                </div>
                <div style={{ backgroundColor: REVOLUT_COLORS.accentTeal }} className="rounded-full p-3">
                  <Target style={{ color: '#fff' }} className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Receitas */}
            <div style={{ backgroundColor: REVOLUT_COLORS.canvasLight, borderColor: REVOLUT_COLORS.hairlineLight }} className="rounded-lg border p-6 transition-all hover:shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p style={{ color: REVOLUT_COLORS.body }} className="text-sm font-medium">Receitas</p>
                  <p style={{ color: REVOLUT_COLORS.accentGreen, fontFamily: 'Aeonik Pro, sans-serif', fontSize: '32px', fontWeight: 500, letterSpacing: '-0.32px' }} className="mt-2">
                    {formatCurrency(totalReceitas)}
                  </p>
                </div>
                <div style={{ backgroundColor: REVOLUT_COLORS.accentGreen }} className="rounded-full p-3">
                  <ArrowUpCircle style={{ color: '#fff' }} className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Despesas */}
            <div style={{ backgroundColor: REVOLUT_COLORS.canvasLight, borderColor: REVOLUT_COLORS.hairlineLight }} className="rounded-lg border p-6 transition-all hover:shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p style={{ color: REVOLUT_COLORS.body }} className="text-sm font-medium">Despesas</p>
                  <p style={{ color: REVOLUT_COLORS.accentPink, fontFamily: 'Aeonik Pro, sans-serif', fontSize: '32px', fontWeight: 500, letterSpacing: '-0.32px' }} className="mt-2">
                    {formatCurrency(totalDespesas)}
                  </p>
                </div>
                <div style={{ backgroundColor: REVOLUT_COLORS.accentPink }} className="rounded-full p-3">
                  <ArrowDownCircle style={{ color: '#fff' }} className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Saldo */}
            <div style={{ backgroundColor: REVOLUT_COLORS.canvasLight, borderColor: REVOLUT_COLORS.hairlineLight }} className="rounded-lg border p-6 transition-all hover:shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p style={{ color: REVOLUT_COLORS.body }} className="text-sm font-medium">Saldo Período</p>
                  <p style={{ color: REVOLUT_COLORS.primary, fontFamily: 'Aeonik Pro, sans-serif', fontSize: '32px', fontWeight: 500, letterSpacing: '-0.32px' }} className="mt-2">
                    {formatCurrency(saldoTransactions)}
                  </p>
                </div>
                <div style={{ backgroundColor: REVOLUT_COLORS.primary }} className="rounded-full p-3">
                  <Zap style={{ color: '#fff' }} className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== CHARTS BAND (DARK) ========== */}
      <div style={{ backgroundColor: REVOLUT_COLORS.canvasDark }} className="py-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Line Chart */}
            <div style={{ backgroundColor: REVOLUT_COLORS.surfaceElevated, borderColor: REVOLUT_COLORS.hairlineDark }} className="rounded-lg border p-8">
              <h3 style={{ color: REVOLUT_COLORS.onDark, fontFamily: 'Aeonik Pro, sans-serif', fontSize: '24px', fontWeight: 500, letterSpacing: '-0.32px' }} className="mb-8">
                Evolução Mensal
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={REVOLUT_COLORS.hairlineDark} />
                  <XAxis dataKey="name" stroke={REVOLUT_COLORS.onDarkMute} />
                  <YAxis stroke={REVOLUT_COLORS.onDarkMute} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: REVOLUT_COLORS.surfaceElevated,
                      border: `1px solid ${REVOLUT_COLORS.hairlineDark}`,
                      borderRadius: '12px',
                      color: REVOLUT_COLORS.onDark
                    }}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend wrapperStyle={{ color: REVOLUT_COLORS.onDarkMute }} />
                  <Line type="monotone" dataKey="Receitas" stroke={REVOLUT_COLORS.accentGreen} strokeWidth={3} name="Receitas" dot={false} />
                  <Line type="monotone" dataKey="Despesas" stroke={REVOLUT_COLORS.accentPink} strokeWidth={3} name="Despesas" dot={false} />
                  <Line type="monotone" dataKey="Saldo" stroke={REVOLUT_COLORS.primary} strokeWidth={3} name="Saldo" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            {assetTypeData.length > 0 && (
              <div style={{ backgroundColor: REVOLUT_COLORS.surfaceElevated, borderColor: REVOLUT_COLORS.hairlineDark }} className="rounded-lg border p-8">
                <h3 style={{ color: REVOLUT_COLORS.onDark, fontFamily: 'Aeonik Pro, sans-serif', fontSize: '24px', fontWeight: 500, letterSpacing: '-0.32px' }} className="mb-8">
                  Distribuição por Tipo
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={assetTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {assetTypeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: REVOLUT_COLORS.surfaceElevated,
                        border: `1px solid ${REVOLUT_COLORS.hairlineDark}`,
                        borderRadius: '12px',
                        color: REVOLUT_COLORS.onDark
                      }}
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== INVESTMENTS TABLE (LIGHT) ========== */}
      <div style={{ backgroundColor: REVOLUT_COLORS.canvasLight }} className="py-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 style={{ color: REVOLUT_COLORS.ink, fontFamily: 'Aeonik Pro, sans-serif', fontSize: '32px', fontWeight: 500, letterSpacing: '-0.32px' }}>
              Meus Investimentos
            </h2>
            <RevolutButton variant="primary" size="md" onClick={() => setIsPosModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Adicionar
            </RevolutButton>
          </div>

          <div style={{ backgroundColor: REVOLUT_COLORS.canvasLight, borderColor: REVOLUT_COLORS.hairlineLight }} className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: REVOLUT_COLORS.surfaceSoft, borderBottom: `1px solid ${REVOLUT_COLORS.hairlineLight}` }}>
                    <th style={{ color: REVOLUT_COLORS.body }} className="text-left px-6 py-4 text-sm font-semibold">Ativo</th>
                    <th style={{ color: REVOLUT_COLORS.body }} className="text-left px-6 py-4 text-sm font-semibold">Instituição</th>
                    <th style={{ color: REVOLUT_COLORS.body }} className="text-left px-6 py-4 text-sm font-semibold">Tipo</th>
                    <th style={{ color: REVOLUT_COLORS.body }} className="text-left px-6 py-4 text-sm font-semibold">Qtd</th>
                    <th style={{ color: REVOLUT_COLORS.body }} className="text-right px-6 py-4 text-sm font-semibold">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((p) => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${REVOLUT_COLORS.hairlineLight}` }} className="hover:bg-slate-50 transition-colors">
                      <td style={{ color: REVOLUT_COLORS.ink }} className="px-6 py-4 font-semibold text-sm">{p.asset_name}</td>
                      <td style={{ color: REVOLUT_COLORS.body }} className="px-6 py-4 text-sm">{p.institution}</td>
                      <td className="px-6 py-4">
                        <span style={{ backgroundColor: REVOLUT_COLORS.primary + '15', color: REVOLUT_COLORS.primary }} className="text-xs font-semibold px-3 py-1.5 rounded-full">
                          {p.asset_type}
                        </span>
                      </td>
                      <td style={{ color: REVOLUT_COLORS.body }} className="px-6 py-4 text-sm">{p.quantity}</td>
                      <td style={{ color: REVOLUT_COLORS.accentGreen }} className="px-6 py-4 text-right font-bold text-sm">{formatCurrency(Number(p.amount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {positions.length === 0 && (
              <div className="text-center py-16" style={{ color: REVOLUT_COLORS.body }}>
                <Wallet className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="text-sm font-medium mb-2">Nenhum investimento cadastrado</p>
                <button onClick={() => setIsPosModalOpen(true)} style={{ color: REVOLUT_COLORS.primary }} className="text-sm font-semibold hover:underline">
                  Adicione sua primeira posição
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== TRANSACTIONS TABLE (DARK) ========== */}
      <div style={{ backgroundColor: REVOLUT_COLORS.canvasDark }} className="py-20 pb-32">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 style={{ color: REVOLUT_COLORS.onDark, fontFamily: 'Aeonik Pro, sans-serif', fontSize: '32px', fontWeight: 500, letterSpacing: '-0.32px' }}>
              Transações
            </h2>
            <RevolutButton variant="primary" size="md" onClick={() => setIsTxModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Adicionar
            </RevolutButton>
          </div>

          <div style={{ backgroundColor: REVOLUT_COLORS.surfaceElevated, borderColor: REVOLUT_COLORS.hairlineDark }} className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: REVOLUT_COLORS.canvasDark, borderBottom: `1px solid ${REVOLUT_COLORS.hairlineDark}` }}>
                    <th style={{ color: REVOLUT_COLORS.onDarkMute }} className="text-left px-6 py-4 text-sm font-semibold">Data</th>
                    <th style={{ color: REVOLUT_COLORS.onDarkMute }} className="text-left px-6 py-4 text-sm font-semibold">Descrição</th>
                    <th style={{ color: REVOLUT_COLORS.onDarkMute }} className="text-left px-6 py-4 text-sm font-semibold">Categoria</th>
                    <th style={{ color: REVOLUT_COLORS.onDarkMute }} className="text-left px-6 py-4 text-sm font-semibold">Tipo</th>
                    <th style={{ color: REVOLUT_COLORS.onDarkMute }} className="text-right px-6 py-4 text-sm font-semibold">Valor</th>
                    <th style={{ color: REVOLUT_COLORS.onDarkMute }} className="text-right px-6 py-4 text-sm font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} style={{ borderBottom: `1px solid ${REVOLUT_COLORS.hairlineDark}` }} className="hover:bg-slate-800/50 transition-colors">
                      {editingTxId === t.id ? (
                        <>
                          <td className="px-6 py-4">
                            <input type="date" value={editTxValues.date || ''} onChange={(e) => setEditTxValues({ ...editTxValues, date: e.target.value })} style={{ backgroundColor: REVOLUT_COLORS.canvasDark, borderColor: REVOLUT_COLORS.hairlineDark, color: REVOLUT_COLORS.onDark }} className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                          </td>
                          <td className="px-6 py-4">
                            <input value={editTxValues.description || ''} onChange={(e) => setEditTxValues({ ...editTxValues, description: e.target.value })} style={{ backgroundColor: REVOLUT_COLORS.canvasDark, borderColor: REVOLUT_COLORS.hairlineDark, color: REVOLUT_COLORS.onDark }} className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                          </td>
                          <td className="px-6 py-4">
                            <input value={editTxValues.category || ''} onChange={(e) => setEditTxValues({ ...editTxValues, category: e.target.value })} style={{ backgroundColor: REVOLUT_COLORS.canvasDark, borderColor: REVOLUT_COLORS.hairlineDark, color: REVOLUT_COLORS.onDark }} className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                          </td>
                          <td className="px-6 py-4">
                            <select style={{ backgroundColor: REVOLUT_COLORS.canvasDark, borderColor: REVOLUT_COLORS.hairlineDark, color: REVOLUT_COLORS.onDark }} className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={editTxValues.type || 'receita'} onChange={(e) => setEditTxValues({ ...editTxValues, type: e.target.value })}>
                              <option value="receita">Receita</option>
                              <option value="despesa">Despesa</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <input type="number" step="0.01" value={editTxValues.amount || ''} onChange={(e) => setEditTxValues({ ...editTxValues, amount: e.target.value })} style={{ backgroundColor: REVOLUT_COLORS.canvasDark, borderColor: REVOLUT_COLORS.hairlineDark, color: REVOLUT_COLORS.onDark }} className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none text-right" />
                          </td>
                          <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                            <button onClick={() => handleSaveTxEdit(t.id)} className="p-2 hover:bg-slate-700 rounded-md transition-colors">
                              <Save style={{ color: REVOLUT_COLORS.accentGreen }} className="h-4 w-4" />
                            </button>
                            <button onClick={() => setEditingTxId(null)} className="p-2 hover:bg-slate-700 rounded-md transition-colors">
                              <X style={{ color: REVOLUT_COLORS.accentPink }} className="h-4 w-4" />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ color: REVOLUT_COLORS.onDarkMute }} className="px-6 py-4 text-sm">{t.date ? new Date(t.date).toLocaleDateString('pt-BR') : '-'}</td>
                          <td style={{ color: REVOLUT_COLORS.onDark }} className="px-6 py-4 text-sm font-semibold">{t.description}</td>
                          <td style={{ color: REVOLUT_COLORS.onDarkMute }} className="px-6 py-4 text-sm">{t.category || '-'}</td>
                          <td className="px-6 py-4">
                            <span style={{ backgroundColor: t.type === 'receita' ? REVOLUT_COLORS.accentGreen + '20' : REVOLUT_COLORS.accentPink + '20', color: t.type === 'receita' ? REVOLUT_COLORS.accentGreen : REVOLUT_COLORS.accentPink }} className="text-xs font-semibold px-3 py-1.5 rounded-full">
                              {t.type}
                            </span>
                          </td>
                          <td style={{ color: t.type === 'receita' ? REVOLUT_COLORS.accentGreen : REVOLUT_COLORS.accentPink }} className="px-6 py-4 text-right font-bold text-sm">
                            {t.type === 'receita' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                            <button onClick={() => handleEditTx(t)} className="p-2 hover:bg-slate-700 rounded-md transition-colors">
                              <Pencil style={{ color: REVOLUT_COLORS.accentBlue }} className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDeleteTx(t.id)} className="p-2 hover:bg-slate-700 rounded-md transition-colors">
                              <Trash2 style={{ color: REVOLUT_COLORS.accentPink }} className="h-4 w-4" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {transactions.length === 0 && (
              <div className="text-center py-16" style={{ color: REVOLUT_COLORS.onDarkMute }}>
                <ArrowUpCircle className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="text-sm font-medium mb-2">Nenhuma transação cadastrada</p>
                <button onClick={() => setIsTxModalOpen(true)} style={{ color: REVOLUT_COLORS.primary }} className="text-sm font-semibold hover:underline">
                  Adicione sua primeira transação
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== MODAL TRANSAÇÃO (LIGHT) ========== */}
      {isTxModalOpen && (
        <div style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div style={{ backgroundColor: REVOLUT_COLORS.canvasLight }} className="rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
            <div style={{ backgroundColor: REVOLUT_COLORS.canvasLight, borderBottom: `1px solid ${REVOLUT_COLORS.hairlineLight}` }} className="flex justify-between items-center p-6">
              <h2 style={{ color: REVOLUT_COLORS.ink, fontFamily: 'Aeonik Pro, sans-serif', fontSize: '24px', fontWeight: 500, letterSpacing: '-0.32px' }}>Nova Transação</h2>
              <button onClick={() => setIsTxModalOpen(false)} style={{ color: REVOLUT_COLORS.body }} className="hover:bg-slate-100 p-2 rounded-md transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              <div>
                <label style={{ color: REVOLUT_COLORS.body }} className="block text-sm font-semibold mb-2">Tipo</label>
                <select style={{ backgroundColor: REVOLUT_COLORS.canvasLight, borderColor: REVOLUT_COLORS.hairlineLight, color: REVOLUT_COLORS.ink }} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" value={txForm.type} onChange={e => setTxForm({ ...txForm, type: e.target.value })}>
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
              </div>
              <div>
                <label style={{ color: REVOLUT_COLORS.body }} className="block text-sm font-semibold mb-2">Descrição</label>
                <Input required value={txForm.description} onChange={e => setTxForm({ ...txForm, description: e.target.value })} placeholder="Ex: Salário, Aluguel..." />
              </div>
              <div>
                <label style={{ color: REVOLUT_COLORS.body }} className="block text-sm font-semibold mb-2">Categoria</label>
                <Input value={txForm.category} onChange={e => setTxForm({ ...txForm, category: e.target.value })} placeholder="Ex: Alimentação, Renda..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ color: REVOLUT_COLORS.body }} className="block text-sm font-semibold mb-2">Valor (R$)</label>
                  <Input required type="number" step="0.01" min="0" value={txForm.amount} onChange={e => setTxForm({ ...txForm, amount: e.target.value })} placeholder="0.00" />
                </div>
                <div>
                  <label style={{ color: REVOLUT_COLORS.body }} className="block text-sm font-semibold mb-2">Data</label>
                  <Input required type="date" value={txForm.date} onChange={e => setTxForm({ ...txForm, date: e.target.value })} />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <RevolutButton variant="soft" size="md" type="button" onClick={() => setIsTxModalOpen(false)}>
                  Cancelar
                </RevolutButton>
                <RevolutButton variant="primary" size="md" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </RevolutButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== MODAL INVESTIMENTO (LIGHT) ========== */}
      {isPosModalOpen && (
        <div style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div style={{ backgroundColor: REVOLUT_COLORS.canvasLight }} className="rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
            <div style={{ backgroundColor: REVOLUT_COLORS.canvasLight, borderBottom: `1px solid ${REVOLUT_COLORS.hairlineLight}` }} className="flex justify-between items-center p-6">
              <h2 style={{ color: REVOLUT_COLORS.ink, fontFamily: 'Aeonik Pro, sans-serif', fontSize: '24px', fontWeight: 500, letterSpacing: '-0.32px' }}>Novo Investimento</h2>
              <button onClick={() => setIsPosModalOpen(false)} style={{ color: REVOLUT_COLORS.body }} className="hover:bg-slate-100 p-2 rounded-md transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddPosition} className="p-6 space-y-4">
              <div>
                <label style={{ color: REVOLUT_COLORS.body }} className="block text-sm font-semibold mb-2">Ativo</label>
                <Input required value={posForm.asset_name} onChange={e => setPosForm({ ...posForm, asset_name: e.target.value })} placeholder="Ex: PETR4, Tesouro Selic..." />
              </div>
              <div>
                <label style={{ color: REVOLUT_COLORS.body }} className="block text-sm font-semibold mb-2">Instituição</label>
                <Input required value={posForm.institution} onChange={e => setPosForm({ ...posForm, institution: e.target.value })} placeholder="Ex: XP Investimentos, BTG..." />
              </div>
              <div>
                <label style={{ color: REVOLUT_COLORS.body }} className="block text-sm font-semibold mb-2">Tipo de Ativo</label>
                <Input required value={posForm.asset_type} onChange={e => setPosForm({ ...posForm, asset_type: e.target.value })} placeholder="Ex: Ação, FII, Renda Fixa..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ color: REVOLUT_COLORS.body }} className="block text-sm font-semibold mb-2">Quantidade</label>
                  <Input required type="number" step="0.01" min="0" value={posForm.quantity} onChange={e => setPosForm({ ...posForm, quantity: e.target.value })} placeholder="0" />
                </div>
                <div>
                  <label style={{ color: REVOLUT_COLORS.body }} className="block text-sm font-semibold mb-2">Valor Total (R$)</label>
                  <Input required type="number" step="0.01" min="0" value={posForm.amount} onChange={e => setPosForm({ ...posForm, amount: e.target.value })} placeholder="0.00" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <RevolutButton variant="soft" size="md" type="button" onClick={() => setIsPosModalOpen(false)}>
                  Cancelar
                </RevolutButton>
                <RevolutButton variant="primary" size="md" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </RevolutButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};