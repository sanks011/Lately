import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import CheckAttendance from './pages/CheckAttendance';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('You are back online!');
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline. Some features may be limited.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-background text-text">
        <Navbar />
        {!isOnline && (
          <div className="bg-yellow-500 text-white p-2 text-center">
            You are currently offline. Some features may be limited.
          </div>
        )}
        <Routes>
          <Route path="/" element={<Home />} 
          />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/check-attendance" element={
            <ProtectedRoute>
              <CheckAttendance />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
        <ToastContainer position="bottom-left" />
        <Footer />
      </div>
    </Router>
  );
}

export default App;