import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}
export const TransactionSummary = ({ summary, filteredCount, totalCount }) => {
    return (_jsxs("div", { className: "transactions-summary", children: [_jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "Total de Receitas:" }), _jsx("span", { className: "summary-value positive", children: summary.totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) })] }), _jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "Total de Despesas:" }), _jsx("span", { className: "summary-value negative", children: summary.totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) })] }), _jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "Saldo:" }), _jsx("span", { className: classNames('summary-value', summary.saldo >= 0 ? 'positive' : 'negative'), children: summary.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) })] })] }));
};
