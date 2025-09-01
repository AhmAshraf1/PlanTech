import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, UploadCloud, History, Menu, Sun, Moon, User, LogOut, Settings, HelpCircle, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
  };

  return (
    <header className="bg-pathlo dark:bg-gray-900 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-50 transition-all duration-300">
      <Link to="/" className="text-3xl font-hank text-asparagus dark:text-asparagus flex items-center gap-3 transition-all duration-300 hover:scale-105">
        <span className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-md flex items-center justify-center">
          <img src="/logo-02.png" alt="PlanTech Logo" className="w-8 h-8" />
        </span>
        <span className="ml-2 tracking-wide">PlanTech</span>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center space-x-6 font-helvetica text-lg">
        <Link
          to="/upload"
          className="hover:text-asparagus transition-colors duration-300 inline-flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/10"
        >
          <UploadCloud className="w-5 h-5" /> Upload
        </Link>
        <Link
          to="/history"
          className="hover:text-asparagus transition-colors duration-300 inline-flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/10"
        >
          <History className="w-5 h-5" /> History
        </Link>
        <Link
          to="/analytics"
          className="hover:text-asparagus transition-colors duration-300 inline-flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/10"
        >
          <BarChart3 className="w-5 h-5" /> Analytics
        </Link>
        <Link
          to="/faq"
          className="hover:text-asparagus transition-colors duration-300 inline-flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/10"
        >
          <HelpCircle className="w-5 h-5" /> Help
        </Link>
        
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-300"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User menu */}
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors duration-300"
            >
              <User className="w-5 h-5" />
              <span className="font-helvetica">
                {user?.first_name
                  ? `${user.first_name} ${user.last_name || ''}`.trim()
                  : user?.username || user?.email || 'User'}
              </span>
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 flex flex-col z-50 animate-fade-in border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.first_name
                      ? `${user.first_name} ${user.last_name || ''}`.trim()
                      : user?.username || user?.email || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User className="w-4 h-4" /> Profile
                </Link>
                <Link
                  to="/settings"
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" /> Settings
                </Link>
                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 flex items-center gap-2 text-red-600 dark:text-red-400 text-left w-full"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-asparagus hover:bg-axolotl text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:scale-105"
          >
            Login
          </Link>
        )}
      </nav>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center gap-2">
        {/* Dark mode toggle for mobile */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-300"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>

        <div className="relative">
          <button
            className="p-2 rounded-lg hover:bg-white/10 focus:outline-none"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Open menu"
          >
            <Menu className="w-7 h-7" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 flex flex-col z-50 animate-fade-in border border-gray-200 dark:border-gray-700">
              <Link
                to="/upload"
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                onClick={() => setMenuOpen(false)}
              >
                <UploadCloud className="w-5 h-5" /> Upload
              </Link>
              <Link
                to="/history"
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                onClick={() => setMenuOpen(false)}
              >
                <History className="w-5 h-5" /> History
              </Link>
              <Link
                to="/analytics"
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                onClick={() => setMenuOpen(false)}
              >
                <BarChart3 className="w-5 h-5" /> Analytics
              </Link>
              <Link
                to="/faq"
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                onClick={() => setMenuOpen(false)}
              >
                <HelpCircle className="w-5 h-5" /> Help
              </Link>
              <hr className="my-2 border-gray-200 dark:border-gray-700" />
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.first_name
                        ? `${user.first_name} ${user.last_name || ''}`.trim()
                        : user?.username || user?.email || 'User'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 flex items-center gap-2 text-red-600 dark:text-red-400 text-left w-full"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-asparagus hover:bg-axolotl text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="w-4 h-4" /> Login
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}