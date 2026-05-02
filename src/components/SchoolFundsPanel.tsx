import { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../utils/formatCurrency';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';

interface SubFund {
  id?: string;
  name: string;
  amount: number;
}

interface Fund {
  id: string;
  name: string;
  category: 'capital' | 'custeio';
  amount: number;
  sub_funds: SubFund[];
}

interface SchoolFundsPanelProps {
  clientId: string;
}

const COLORS = ['#8B5CF6', '#10B981'];

export const SchoolFundsPanel = ({ clientId }: SchoolFundsPanelProps) => {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [filter, setFilter] = useState<'todos' | 'capital' | 'custeio'>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados do Modal
  const [fundName, setFundName] = useState('');
  const [category, setCategory] = useState<'capital' | 'custeio'>('custeio');
  const [fundAmount, setFundAmount] = useState<number | ''>('');
  const [subFunds, setSubFunds] = useState<SubFund[]>([]);
  const [newSubName, setNewSubName] = useState('');
  const [newSubAmount, setNewSubAmount] = useState<number | ''>('');

  useEffect(() => {
    if (clientId) {
      fetchFunds();
    }
  }, [clientId]);

  const fetchFunds = async () => {
    const { data: fundsData, error: fundsError } = await supabase
      .from('funds')
      .select('*, sub_funds(*)')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (fundsError) {
      console.error('Erro ao buscar verbas', fundsError);
      return;
    }
    setFunds(fundsData || []);
  };

  const totalSubFunds = subFunds.reduce((acc, curr) => acc + curr.amount, 0);
  const currentFundAmount = Number(fundAmount) || 0;
  const canAddMoreSubFunds = currentFundAmount > 0 && totalSubFunds < currentFundAmount;

  const handleAddSubFund = () => {
    if (!newSubName || !newSubAmount) return;
    if (totalSubFunds + Number(newSubAmount) > currentFundAmount) {
      alert('A soma das subverbas não pode ultrapassar o valor total da verba.');
      return;
    }
    setSubFunds([...subFunds, { name: newSubName, amount: Number(newSubAmount) }]);
    setNewSubName('');
    setNewSubAmount('');
  };

  const handleRemoveSubFund = (index: number) => {
    setSubFunds(subFunds.filter((_, i) => i !== index));
  };

  const handleSaveFund = async () => {
    if (!fundName || !fundAmount) return;

    const { data: newFund, error: fundError } = await supabase
      .from('funds')
      .insert([{ client_id: clientId, name: fundName, category, amount: Number(fundAmount) }])
      .select()
      .single();

    if (fundError) {
      alert('Erro ao salvar a verba.');
      return;
    }

    if (subFunds.length > 0) {
      const subFundsToInsert = subFunds.map(sf => ({
        fund_id: newFund.id,
        name: sf.name,
        amount: sf.amount
      }));
      await supabase.from('sub_funds').insert(subFundsToInsert);
    }

    setIsModalOpen(false);
    resetModal();
    fetchFunds();
  };

  const resetModal = () => {
    setFundName('');
    setCategory('custeio');
    setFundAmount('');
    setSubFunds([]);
    setNewSubName('');
    setNewSubAmount('');
  };

  const filteredFunds = filter === 'todos' ? funds : funds.filter(f => f.category === filter);

  const pieData = [
    { name: 'Capital', value: funds.filter(f => f.category === 'capital').reduce((acc, f) => acc + Number(f.amount), 0) },
    { name: 'Custeio', value: funds.filter(f => f.category === 'custeio').reduce((acc, f) => acc + Number(f.amount), 0) },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {pieData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Verbas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle>Gestão de Verbas</CardTitle>
            <div className="flex items-center gap-3">
              <select
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
              >
                <option value="todos">Todas Categorias</option>
                <option value="capital">Capital</option>
                <option value="custeio">Custeio</option>
              </select>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Registrar Verba
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFunds.map(fund => (
              <div key={fund.id} className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-800 text-lg leading-tight">{fund.name}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                    fund.category === 'capital' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {fund.category}
                  </span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{formatCurrency(fund.amount)}</p>
                
                {fund.sub_funds && fund.sub_funds.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Subverbas</p>
                    <ul className="space-y-2.5">
                      {fund.sub_funds.map(sf => (
                        <li key={sf.id} className="flex justify-between items-center text-sm">
                          <span className="text-slate-600 truncate mr-2">{sf.name}</span>
                          <span className="font-medium text-slate-900 bg-slate-50 px-2 py-0.5 rounded-md">{formatCurrency(sf.amount)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            {filteredFunds.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Nenhuma verba encontrada para este filtro.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Registro */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Registrar Nova Verba</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Verba</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all" 
                  value={fundName} 
                  onChange={e => setFundName(e.target.value)} 
                  placeholder="Ex: Reforma do laboratório"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all" 
                    value={category} 
                    onChange={e => setCategory(e.target.value as any)}
                  >
                    <option value="custeio">Custeio</option>
                    <option value="capital">Capital</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Total (R$)</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all" 
                    value={fundAmount} 
                    onChange={e => setFundAmount(Number(e.target.value))} 
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 mt-2">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-800">Divisão em Subverbas (Opcional)</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Saldo disponível: <span className="font-medium text-slate-700">{formatCurrency(currentFundAmount - totalSubFunds)}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <input 
                    type="text" 
                    placeholder="Nome da subverba" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={newSubName} 
                    onChange={e => setNewSubName(e.target.value)} 
                  />
                  <input 
                    type="number" 
                    placeholder="Valor" 
                    className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={newSubAmount} 
                    onChange={e => setNewSubAmount(Number(e.target.value))} 
                  />
                  <button 
                    onClick={handleAddSubFund}
                    disabled={!canAddMoreSubFunds}
                    className="bg-slate-100 p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                    title="Adicionar Subverba"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {subFunds.length > 0 && (
                  <ul className="space-y-2 mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {subFunds.map((sf, idx) => (
                      <li key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm text-sm">
                        <span className="font-medium text-slate-700">{sf.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{formatCurrency(sf.amount)}</span>
                          <button 
                            onClick={() => handleRemoveSubFund(idx)} 
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3 shrink-0">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveFund} disabled={!fundName || !fundAmount}>Salvar Verba</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};