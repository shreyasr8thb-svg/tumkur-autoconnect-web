import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ compact = false }) {
  const { theme, toggleTheme, isDark } = useTheme();

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        className="theme-toggle-btn"
      >
        {isDark ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="theme-toggle-pill"
    >
      <span className="theme-toggle-track">
        <span className={`theme-toggle-thumb ${isDark ? 'dark' : 'light'}`}>
          {isDark ? <Moon size={13} /> : <Sun size={13} />}
        </span>
      </span>
      <span className="theme-toggle-label">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
}
