import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './DeleteConfirmationModal.css';
function DeleteConfirmationModal({ isOpen, onClose, onConfirm, transactionTitle, isLoading = false }) {
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "delete-modal-overlay", onClick: onClose, children: _jsxs("div", { className: "delete-modal", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "delete-modal__header", children: [_jsx("div", { className: "delete-modal__icon", children: "\uD83D\uDDD1\uFE0F" }), _jsx("h2", { children: "Confirmar Exclus\u00E3o" })] }), _jsxs("div", { className: "delete-modal__content", children: [_jsxs("p", { children: ["Tem certeza que deseja excluir a transa\u00E7\u00E3o ", _jsxs("strong", { children: ["\"", transactionTitle, "\""] }), "?"] }), _jsx("p", { className: "delete-modal__warning", children: "Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita." })] }), _jsxs("div", { className: "delete-modal__actions", children: [_jsx("button", { type: "button", className: "btn btn-outline", onClick: onClose, disabled: isLoading, children: "Cancelar" }), _jsx("button", { type: "button", className: "btn btn-danger", onClick: onConfirm, disabled: isLoading, children: isLoading ? (_jsxs("div", { className: "loading-spinner", children: [_jsx("div", { className: "spinner" }), _jsx("span", { children: "Excluindo..." })] })) : ('Excluir Transação') })] })] }) }));
}
export default DeleteConfirmationModal;
