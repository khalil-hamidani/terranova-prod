import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      className={`theme-toggle-btn ${className}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
    >
      <span className="theme-toggle-icon">
        {isDark ? (
          <Sun size={18} strokeWidth={2} className="sun-icon" />
        ) : (
          <Moon size={18} strokeWidth={2} className="moon-icon" />
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;
