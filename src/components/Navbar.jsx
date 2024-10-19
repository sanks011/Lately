import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import { Moon, Sun } from 'lucide-react';

function Navbar() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const darkModeSetting = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkModeSetting);
    document.documentElement.classList.toggle('dark', darkModeSetting);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    document.documentElement.classList.toggle('dark', newMode);
  };

  return (
    <nav className={`fixed w-full z-10 transition-all duration-300 ${isScrolled ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:bg-gray-800 shadow-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className={`logo-text ${isScrolled ? 'text-gray-800 dark:text-white' : 'text-white'}`}>
          <span className="font-ahkio text-4xl font-bold tracking-tight">Lately</span>
        </Link>

        <div className="flex items-center space-x-4">
          <button onClick={toggleDarkMode} className={`p-2 rounded-full ${isScrolled ? 'text-gray-800 dark:text-white' : 'text-white'}`}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-4">
            <NavLink to="/" isScrolled={isScrolled}>Home</NavLink>
            <NavLink to="/about" isScrolled={isScrolled}>About</NavLink>
            {user ? (
              <>
                <NavLink to="/check-attendance" isScrolled={isScrolled}>Check Attendance</NavLink>
                <button onClick={handleLogout} className={`${isScrolled ? 'text-gray-800 dark:text-white' : 'text-white'} hover:text-gray-600 dark:hover:text-gray-300`}>
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/login" isScrolled={isScrolled}>Login</NavLink>
            )}
          </div>

          {/* Mobile menu button */}
          <button className={`md:hidden ${isScrolled ? 'text-gray-800 dark:text-white' : 'text-white'}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-2 bg-white dark:bg-gray-800 shadow-md">
          <NavLink to="/" mobile>Home</NavLink>
          <NavLink to="/about" mobile>About</NavLink>
          {user ? (
            <>
              <NavLink to="/check-attendance" mobile>Check Attendance</NavLink>
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" mobile>Login</NavLink>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, children, mobile, isScrolled }) {
  return (
    <Link to={to} className={`${mobile ? 'block' : 'inline-block'} px-4 py-2 ${isScrolled ? 'text-gray-800 dark:text-white' : 'text-white'} hover:text-gray-600 dark:hover:text-gray-300 transition duration-300`}>
      {children}
    </Link>
  );
}

export default Navbar;