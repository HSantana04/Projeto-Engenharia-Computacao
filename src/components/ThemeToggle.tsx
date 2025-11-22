import { useTheme } from '../contexts/ThemeContext'
import './ThemeToggle.css'

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  return (
    <div className="theme-toggle">
      <span className="theme-toggle__label">{isDark ? 'Dark' : 'Light'}</span>
      <button aria-label="Alternar tema" className={isDark ? 'switch switch--on' : 'switch'} onClick={toggle}>
        <span className="switch__knob" />
      </button>
    </div>
  )
}

export default ThemeToggle


