import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const TransactionEmptyState = ({ onAddTransaction }) => {
    return (_jsxs("div", { className: "empty-state", children: [_jsx("p", { children: "Nenhuma transa\u00E7\u00E3o encontrada" }), _jsx("button", { className: "btn btn-primary", onClick: onAddTransaction, children: "Adicionar primeira transa\u00E7\u00E3o" })] }));
};
