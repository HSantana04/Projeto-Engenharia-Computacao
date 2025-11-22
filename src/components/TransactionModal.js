import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import './TransactionModal.css';
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
function TransactionModal({ isOpen, onClose, onAddTransaction, onEditTransaction, transactionToEdit, mode }) {
    const [formData, setFormData] = useState({
        type: 'receita',
        title: '',
        subcategory: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [errors, setErrors] = useState({});
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
        }
        else {
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
    const validateForm = () => {
        const newErrors = {};
        // Validação do título/subcategoria
        if (formData.type === 'receita') {
            if (!formData.title.trim()) {
                newErrors.title = 'Título é obrigatório';
            }
            else if (formData.title.trim().length < 2) {
                newErrors.title = 'Título deve ter pelo menos 2 caracteres';
            }
        }
        else if (formData.type === 'despesa') {
            if (formData.category && !formData.subcategory) {
                newErrors.title = 'Subcategoria é obrigatória';
            }
            else if (!formData.category) {
                newErrors.title = 'Categoria deve ser selecionada primeiro';
            }
        }
        if (!formData.amount) {
            newErrors.amount = 'Valor é obrigatório';
        }
        else {
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
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpar erro do campo quando o usuário começa a digitar
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
        // Resetar categoria e subcategoria quando mudar o tipo
        if (name === 'type') {
            setFormData(prev => ({
                ...prev,
                type: value,
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
    const handleSubmit = async (e) => {
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
            }
            else {
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
        }
        catch (error) {
            console.error('Erro ao processar transação:', error);
        }
        finally {
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
    if (!isOpen)
        return null;
    const isEditMode = mode === 'edit';
    const modalTitle = isEditMode ? 'Editar Transação' : 'Nova Transação';
    const submitButtonText = isEditMode ? 'Salvar Alterações' : `Adicionar ${formData.type === 'receita' ? 'Receita' : 'Despesa'}`;
    return (_jsx("div", { className: "transaction-modal-overlay", onClick: handleClose, children: _jsxs("div", { className: "transaction-modal", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "transaction-modal__header", children: [_jsx("h2", { children: modalTitle }), _jsx("button", { className: "transaction-modal__close", onClick: handleClose, disabled: isLoading, children: "\u2715" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "transaction-modal__form", children: [_jsxs("div", { className: "transaction-type-selector", children: [_jsxs("label", { className: "transaction-type-option", children: [_jsx("input", { type: "radio", name: "type", value: "receita", checked: formData.type === 'receita', onChange: handleInputChange, disabled: isLoading }), _jsx("span", { className: "transaction-type-button transaction-type-button--receita", children: "\uD83D\uDCC8 Receita" })] }), _jsxs("label", { className: "transaction-type-option", children: [_jsx("input", { type: "radio", name: "type", value: "despesa", checked: formData.type === 'despesa', onChange: handleInputChange, disabled: isLoading }), _jsx("span", { className: "transaction-type-button transaction-type-button--despesa", children: "\uD83D\uDCC9 Despesa" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: formData.type === 'despesa' && formData.category ? 'subcategory' : 'title', children: formData.type === 'despesa' && formData.category ? 'Subcategoria' : 'Título da Transação' }), formData.type === 'receita' || !formData.category ? (_jsx("input", { type: "text", id: "title", name: "title", value: formData.title, onChange: handleInputChange, placeholder: formData.type === 'receita' ? 'Ex: Salário, Freelance...' : 'Selecione uma categoria primeiro', className: errors.title ? 'error' : '', disabled: isLoading || (formData.type === 'despesa' && !formData.category) })) : (_jsxs("select", { id: "subcategory", name: "subcategory", value: formData.subcategory, onChange: handleInputChange, className: errors.title ? 'error' : '', disabled: isLoading, children: [_jsx("option", { value: "", children: "Selecione uma subcategoria" }), SUBCATEGORIES[formData.category]?.map(subcategory => (_jsx("option", { value: subcategory, children: subcategory }, subcategory)))] })), errors.title && _jsx("span", { className: "error-message", children: errors.title })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "amount", children: "Valor (R$)" }), _jsxs("div", { className: "amount-input-container", children: [_jsx("span", { className: "amount-prefix", children: "R$" }), _jsx("input", { type: "number", id: "amount", name: "amount", value: formData.amount, onChange: handleInputChange, placeholder: "0,00", step: "0.01", min: "0.01", className: errors.amount ? 'error' : '', disabled: isLoading })] }), errors.amount && _jsx("span", { className: "error-message", children: errors.amount })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "category", children: "Categoria" }), _jsxs("select", { id: "category", name: "category", value: formData.category, onChange: handleInputChange, className: errors.category ? 'error' : '', disabled: isLoading, children: [_jsx("option", { value: "", children: "Selecione uma categoria" }), CATEGORIES[formData.type].map(category => (_jsxs("option", { value: category, children: [" ", category] }, category)))] }), errors.category && _jsx("span", { className: "error-message", children: errors.category })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "date", children: "Data" }), _jsx("input", { type: "date", id: "date", name: "date", value: formData.date, onChange: handleInputChange, className: errors.date ? 'error' : '', disabled: isLoading }), errors.date && _jsx("span", { className: "error-message", children: errors.date })] }), _jsxs("div", { className: "transaction-modal__actions", children: [_jsx("button", { type: "button", className: "btn btn-outline", onClick: handleClose, disabled: isLoading, children: "Cancelar" }), _jsx("button", { type: "submit", className: "btn btn-primary", disabled: isLoading, children: isLoading ? (_jsxs("div", { className: "loading-spinner", children: [_jsx("div", { className: "spinner" }), _jsx("span", { children: isEditMode ? 'Salvando...' : 'Adicionando...' })] })) : (submitButtonText) })] })] })] }) }));
}
export default TransactionModal;
