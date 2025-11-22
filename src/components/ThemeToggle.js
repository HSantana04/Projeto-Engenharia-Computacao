import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';
function ThemeToggle() {
    const { theme, toggle } = useTheme();
    const isDark = theme === 'dark';
    return (_jsxs("div", { className: "theme-toggle", children: [_jsx("span", { className: "theme-toggle__label", children: isDark ? 'Dark' : 'Light' }), _jsx("button", { "aria-label": "Alternar tema", className: isDark ? 'switch switch--on' : 'switch', onClick: toggle, children: _jsx("span", { className: "switch__knob" }) })] }));
}
export default ThemeToggle;
