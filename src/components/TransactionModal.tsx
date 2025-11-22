import { useState, type FormEvent, useEffect } from 'react';
import './TransactionModal.css';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: {
    type: 'receita' | 'despesa';
    title: string;
    amount: number;
    category: string;
    date: string;
  }) => void;
  onEditTransaction: (id: string, transaction: {
    type: 'receita' | 'despesa';
    title: string;
    amount: number;
    category: string;
    date: string;
  }) => void;
  transactionToEdit?: Transaction | null;
  mode: 'create' | 'edit';
}

interface TransactionFormData {
  type: 'receita' | 'despesa';
  title: string;
  subcategory: string;
  amount: string;
  category: string;
  date: string;
}

interface TransactionFormErrors {
  title?: string;
  amount?: string;
  category?: string;
  date?: string;
}

const CATEGORIES = {
  receita: ['Salário', 'Freelance', 'Investimentos', 'Vendas', 'Outros'],
  despesa: ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Contas', 'Serviços Financeiros', 'Outros']
};

const SUBCATEGORIES = {
  'Alimentação': [
    'Restaurante',
    'Mercado',
    'Delivery',
    'Café',
    'Lanche',
    'Supermercado',
    'Outros'
  ],
  'Transporte': [
    'Combustível',
    'Ônibus',
    'Metrô',
    'Táxi/Uber',
    'Estacionamento',
    'Manutenção',
    'Seguro',
    'Multas',
    'Outros'
  ],
  'Moradia': [
    'Aluguel',
    'Financiamento',
    'Condomínio',
    'IPTU',
    'Água',
    'Luz',
    'Gás',
    'Internet',
    'Telefone',
    'Manutenção',
    'Outros'
  ],
  'Saúde': [
    'Plano de Saúde',
    'Médico',
    'Dentista',
    'Farmácia',
    'Exames',
    'Terapia',
    'Academia',
    'Outros'
  ],
  'Educação': [
    'Mensalidade',
    'Material',
    'Cursos',
    'Livros',
    'Certificações',
    'Outros'
  ],
  'Lazer': [
    'Cinema',
    'Teatro',
    'Shows',
    'Viagens',
    'Hobbies',
    'Esportes',
    'Restaurantes',
    'Outros'
  ],
  'Contas': [
    'Água',
    'Luz',
    'Gás',
    'Internet',
    'Telefone',
    'Celular',
    'TV por assinatura',
    'Segurança',
    'Outros'
  ],
  'Serviços Financeiros': [
    'Empréstimo',
    'Financiamento',
    'Juros',
    'Tarifas bancárias',
    'Seguro',
    'Investimentos',
    'Outros'
  ],
  'Outros': [
    'Diversos',
    'Imprevistos',
    'Doações',
    'Outros'
  ]
};

function TransactionModal({ 
  isOpen, 
  onClose, 
  onAddTransaction, 
  onEditTransaction, 
  transactionToEdit, 
  mode 
}: TransactionModalProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'receita',
    title: '',
    subcategory: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<TransactionFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Atualizar formulário quando transactionToEdit mudar
  useEffect(() => {
    if (transactionToEdit && mode === 'edit') {
      const isExpense = transactionToEdit.amount < 0;
      setFormData({
        type: isExpense ? 'despesa' : 'receita',
        title: transactionToEdit.description,
        subcategory: '', // Será determinado pela lógica posterior se necessário
        amount: Math.abs(transactionToEdit.amount).toString(),
        category: transactionToEdit.category,
        date: transactionToEdit.date
      });
    } else {
      // Reset para modo de criação
      setFormData({
        type: 'receita',
        title: '',
        subcategory: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setErrors({});
  }, [transactionToEdit, mode]);

  const validateForm = (): boolean => {
    const newErrors: TransactionFormErrors = {};

    // Validação do título/subcategoria
    if (formData.type === 'receita') {
      if (!formData.title.trim()) {
        newErrors.title = 'Título é obrigatório';
      } else if (formData.title.trim().length < 2) {
        newErrors.title = 'Título deve ter pelo menos 2 caracteres';
      }
    } else if (formData.type === 'despesa') {
      if (formData.category && !formData.subcategory) {
        newErrors.title = 'Subcategoria é obrigatória';
      } else if (!formData.category) {
        newErrors.title = 'Categoria deve ser selecionada primeiro';
      }
    }

    if (!formData.amount) {
      newErrors.amount = 'Valor é obrigatório';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Valor deve ser um número positivo';
      }
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpar erro do campo quando o usuário começa a digitar
    if (errors[name as keyof TransactionFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Resetar categoria e subcategoria quando mudar o tipo
    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        type: value as 'receita' | 'despesa',
        category: '',
        subcategory: '',
        title: ''
      }));
    }

    // Resetar subcategoria quando mudar a categoria
    if (name === 'category') {
      setFormData(prev => ({
        ...prev,
        category: value,
        subcategory: '',
        title: prev.type === 'receita' ? prev.title : ''
      }));
    }

    // Atualizar título baseado na subcategoria para despesas
    if (name === 'subcategory' && formData.type === 'despesa') {
      setFormData(prev => ({
        ...prev,
        subcategory: value,
        title: value
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));

      const finalTitle = formData.type === 'despesa' ? formData.subcategory : formData.title.trim();

      const transactionData = {
        type: formData.type,
        title: finalTitle,
        amount: formData.type === 'receita' ? parseFloat(formData.amount) : -parseFloat(formData.amount),
        category: formData.category,
        date: formData.date
      };

      if (mode === 'edit' && transactionToEdit) {
        onEditTransaction(transactionToEdit.id, transactionData);
      } else {
        onAddTransaction(transactionData);
      }
      
      // Resetar formulário
      setFormData({
        type: 'receita',
        title: '',
        subcategory: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao processar transação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        type: 'receita',
        title: '',
        subcategory: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  const isEditMode = mode === 'edit';
  const modalTitle = isEditMode ? 'Editar Transação' : 'Nova Transação';
  const submitButtonText = isEditMode ? 'Salvar Alterações' : `Adicionar ${formData.type === 'receita' ? 'Receita' : 'Despesa'}`;

  return (
    <div className="transaction-modal-overlay" onClick={handleClose}>
      <div className="transaction-modal" onClick={e => e.stopPropagation()}>
        <div className="transaction-modal__header">
          <h2>{modalTitle}</h2>
          <button 
            className="transaction-modal__close" 
            onClick={handleClose}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="transaction-modal__form">
          {/* Tipo de Transação */}
          <div className="transaction-type-selector">
            <label className="transaction-type-option">
              <input
                type="radio"
                name="type"
                value="receita"
                checked={formData.type === 'receita'}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <span className="transaction-type-button transaction-type-button--receita">
                📈 Receita
              </span>
            </label>
            
            <label className="transaction-type-option">
              <input
                type="radio"
                name="type"
                value="despesa"
                checked={formData.type === 'despesa'}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <span className="transaction-type-button transaction-type-button--despesa">
                📉 Despesa
              </span>
            </label>
          </div>

          {/* Título/Subcategoria */}
          <div className="form-group">
            <label htmlFor={formData.type === 'despesa' && formData.category ? 'subcategory' : 'title'}>
              {formData.type === 'despesa' && formData.category ? 'Subcategoria' : 'Título da Transação'}
            </label>

            {formData.type === 'receita' || !formData.category ? (
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={formData.type === 'receita' ? 'Ex: Salário, Freelance...' : 'Selecione uma categoria primeiro'}
                className={errors.title ? 'error' : ''}
                disabled={isLoading || (formData.type === 'despesa' && !formData.category)}
              />
            ) : (
              <select
                id="subcategory"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                className={errors.title ? 'error' : ''}
                disabled={isLoading}
              >
                <option value="">Selecione uma subcategoria</option>
                {SUBCATEGORIES[formData.category as keyof typeof SUBCATEGORIES]?.map(subcategory => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            )}
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          {/* Valor */}
          <div className="form-group">
            <label htmlFor="amount">Valor (R$)</label>
            <div className="amount-input-container">
              <span className="amount-prefix">R$</span>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0,00"
                step="0.01"
                min="0.01"
                className={errors.amount ? 'error' : ''}
                disabled={isLoading}
              />
            </div>
            {errors.amount && <span className="error-message">{errors.amount}</span>}
          </div>

          {/* Categoria */}
          <div className="form-group">
            <label htmlFor="category">Categoria</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={errors.category ? 'error' : ''}
              disabled={isLoading}
            >
              <option value="">Selecione uma categoria</option>
              {CATEGORIES[formData.type].map(category => (
                <option key={category} value={category}> {/* Isso aqui tá gerando o dropdown de categorias */}
                  {category}
                </option>
              ))}
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>

          {/* Data */}
          <div className="form-group">
            <label htmlFor="date">Data</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={errors.date ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.date && <span className="error-message">{errors.date}</span>}
          </div>

          {/* Botões */}
          <div className="transaction-modal__actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <span>{isEditMode ? 'Salvando...' : 'Adicionando...'}</span>
                </div>
              ) : (
                submitButtonText
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionModal;
