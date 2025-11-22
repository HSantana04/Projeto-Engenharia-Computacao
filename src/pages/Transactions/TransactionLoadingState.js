import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const TransactionLoadingState = ({ message = "Carregando transações..." }) => {
    return (_jsxs("div", { className: "loading-state", children: [_jsx("div", { className: "loading-spinner" }), _jsx("p", { children: message })] }));
};
