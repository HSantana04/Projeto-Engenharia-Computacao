import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
export const TransactionErrorBanner = ({ error, onDismiss }) => {
    return (_jsxs("div", { className: "error-banner", children: [_jsxs("span", { children: ["\u26A0\uFE0F ", error] }), _jsx("button", { onClick: onDismiss, children: "\u2715" })] }));
};
