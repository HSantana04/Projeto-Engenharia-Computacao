import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Target, TrendingUp, Wallet, ArrowDownCircle, ArrowUpCircle, Plus, X, Pencil, Trash2, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';
import { useAuthRole } from '../hooks/useAuthRole';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Input } from '../components/ui/Input';
import { formatCurrency } from '../utils/formatCurrency';

type PositionRow = Database['public']['Tables']['positions']['Row'];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, role, clientProfile } = useAuthRole();
  const [positions, setPositions] = useState<PositionRow[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!clientProfile) {
    return (
      <div className="text-center py-12 text-slate-600">
        Não foi possível carregar seu perfil de cliente.
      </div>
    );
  }

  const totalValue = positions.reduce((sum, p) => sum + Number(p.amount), 0);

  const assetTypeData = positions.reduce(
    (acc, p) => {
      const existing = acc.find((item) => item.name === p.asset_type);
      if (existing) existing.value += Number(p.amount);
      else acc.push({ name: p.asset_type, value: Number(p.amount) });
      return acc;
    },
    [] as { name: string; value: number }[]
  );

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
      
      // Recarregar os dados
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
      
      // Recarregar os dados
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

  const totalReceitas = transactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalDespesas = transactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + Number(t.amount), 0);
  const saldoTransactions = totalReceitas - totalDespesas;

  const monthlyDataMap = transactions.reduce((acc, t) => {
    if (!t.date) return acc;
    const monthKey = t.date.substring(0, 7); // Extrai "YYYY-MM"
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
    .sort((a, b) => a.name.localeCompare(b.name)) // Ordena cronologicamente
    .map((item) => {
      const [year, month] = item.name.split('-');
      return {
        ...item,
        name: `${month}/${year.slice(2)}`, // Formata para "MM/YY"
        Saldo: item.Receitas - item.Despesas,
      };
    });

  return (
    <div className="space-y-8 pb-8">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl shadow-xl p-8 text-white">
        <p className="text-emerald-100 text-sm font-medium">Meu patrimônio</p>
        <h1 className="text-3xl font-bold mt-1">Olá, {clientProfile.name.split(' ')[0]}</h1>
        <div className="mt-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-sm text-emerald-100">Total investido</p>
            <p className="text-4xl font-bold mt-1">{formatCurrency(totalValue)}</p>
            <p className="text-xs text-emerald-200 mt-2">{positions.length} posição(ões) cadastrada(s)</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/15 hover:bg-white/25 text-white border-0"
              onClick={() => navigate(`/client/${clientProfile.id}/goals`)}
            >
              <Target className="h-4 w-4 mr-2" />
              Minhas metas
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/15 hover:bg-white/25 text-white border-0"
              onClick={() => navigate(`/client/${clientProfile.id}`)}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Detalhes completos
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Patrimônio</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totalValue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-violet-100">
              <Wallet className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Posições</p>
              <p className="text-xl font-bold text-slate-900">{positions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-100">
              <Target className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Tipos de ativo</p>
              <p className="text-xl font-bold text-slate-900">{assetTypeData.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-100">
              <ArrowUpCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Receitas</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalReceitas)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-100">
              <ArrowDownCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Despesas</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(totalDespesas)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-100">
              <Wallet className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Saldo no Período</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(saldoTransactions)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal (Receitas, Despesas e Saldo)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="Receitas" stroke="#10B981" strokeWidth={2} name="Receitas" />
                <Line type="monotone" dataKey="Despesas" stroke="#EF4444" strokeWidth={2} name="Despesas" />
                <Line type="monotone" dataKey="Saldo" stroke="#3B82F6" strokeWidth={2} name="Saldo (Investível)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      {assetTypeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por tipo de ativo</CardTitle>
          </CardHeader>
          <CardContent>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Meus investimentos</CardTitle>
            <Button size="sm" onClick={() => setIsPosModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ativo</TableHead>
                <TableHead>Instituição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.asset_name}</TableCell>
                  <TableCell>{p.institution}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {p.asset_type}
                    </span>
                  </TableCell>
                  <TableCell>{p.quantity}</TableCell>
                  <TableCell className="font-semibold text-green-600">{formatCurrency(Number(p.amount))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {positions.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              Nenhum investimento cadastrado ainda. Peça ao seu consultor para incluir posições ou envie um extrato em{' '}
              <button type="button" className="text-blue-600 font-medium" onClick={() => navigate('/upload')}>
                Inserir dados
              </button>
              .
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transações (Receitas e Despesas)</CardTitle>
            <Button size="sm" onClick={() => setIsTxModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  {editingTxId === t.id ? (
                    <>
                      <TableCell>
                        <Input type="date" value={editTxValues.date || ''} onChange={(e) => setEditTxValues({...editTxValues, date: e.target.value})} />
                      </TableCell>
                      <TableCell>
                        <Input value={editTxValues.description || ''} onChange={(e) => setEditTxValues({...editTxValues, description: e.target.value})} />
                      </TableCell>
                      <TableCell>
                        <Input value={editTxValues.category || ''} onChange={(e) => setEditTxValues({...editTxValues, category: e.target.value})} />
                      </TableCell>
                      <TableCell>
                        <select
                          className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-transparent"
                          value={editTxValues.type || 'receita'}
                          onChange={(e) => setEditTxValues({...editTxValues, type: e.target.value})}
                        >
                          <option value="receita">Receita</option>
                          <option value="despesa">Despesa</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        <Input type="number" step="0.01" value={editTxValues.amount || ''} onChange={(e) => setEditTxValues({...editTxValues, amount: e.target.value})} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleSaveTxEdit(t.id)}>
                            <Save className="h-4 w-4 text-emerald-600" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingTxId(null)}>
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{t.date ? new Date(t.date).toLocaleDateString('pt-BR') : '-'}</TableCell>
                      <TableCell className="font-medium">{t.description}</TableCell>
                      <TableCell>{t.category || '-'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.type === 'receita' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {t.type}
                        </span>
                      </TableCell>
                      <TableCell className={`font-semibold ${t.type === 'receita' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.type === 'receita' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleEditTx(t)}>
                            <Pencil className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteTx(t.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {transactions.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              Nenhuma transação cadastrada ainda. Envie um extrato que contenha receitas e despesas.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Nova Transação */}
      {isTxModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-semibold text-slate-900">Nova Transação</h2>
              <button onClick={() => setIsTxModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                <select
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={txForm.type}
                  onChange={e => setTxForm({...txForm, type: e.target.value})}
                >
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <Input required value={txForm.description} onChange={e => setTxForm({...txForm, description: e.target.value})} placeholder="Ex: Salário, Aluguel..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <Input value={txForm.category} onChange={e => setTxForm({...txForm, category: e.target.value})} placeholder="Ex: Alimentação, Renda..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                  <Input required type="number" step="0.01" min="0" value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})} placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                  <Input required type="date" value={txForm.date} onChange={e => setTxForm({...txForm, date: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsTxModalOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo Investimento */}
      {isPosModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-semibold text-slate-900">Novo Investimento</h2>
              <button onClick={() => setIsPosModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddPosition} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ativo</label>
                <Input required value={posForm.asset_name} onChange={e => setPosForm({...posForm, asset_name: e.target.value})} placeholder="Ex: PETR4, Tesouro Selic..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Instituição</label>
                <Input required value={posForm.institution} onChange={e => setPosForm({...posForm, institution: e.target.value})} placeholder="Ex: XP Investimentos, BTG..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Ativo</label>
                <Input required value={posForm.asset_type} onChange={e => setPosForm({...posForm, asset_type: e.target.value})} placeholder="Ex: Ação, FII, Renda Fixa..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade</label>
                  <Input required type="number" step="0.01" min="0" value={posForm.quantity} onChange={e => setPosForm({...posForm, quantity: e.target.value})} placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Total (R$)</label>
                  <Input required type="number" step="0.01" min="0" value={posForm.amount} onChange={e => setPosForm({...posForm, amount: e.target.value})} placeholder="0.00" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsPosModalOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
