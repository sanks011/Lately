import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { toast } from 'react-toastify';
import { FaUser, FaGraduationCap, FaCalendarAlt, FaUniversity } from 'react-icons/fa';

function Dashboard() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    name: '',
    department: '',
    year: '',
    institution: ''
  });
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async (user) => {
      if (user) {
        const userDocRef = ref(db, `users/${user.uid}`);
        const userDocSnap = await get(userDocRef);

        if (userDocSnap.exists()) {
          navigate('/check-attendance');
        } else {
          setIsNewUser(true);
        }
      }
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserInfo(user);
      } else {
        setLoading(false);
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
      try {
        const userDocRef = ref(db, `users/${user.uid}`);
        await set(userDocRef, userInfo);
        toast.success('Profile saved successfully');
        navigate('/check-attendance');
      } catch (err) {
        console.error('Error updating user data:', err);
        toast.error('Error updating profile. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-800 dark:via-purple-900 dark:to-pink-900">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32 mb-4"></div>
        <p className="text-lg text-white">Loading...</p>
      </div>
    );
  }

  if (isNewUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-800 dark:via-purple-900 dark:to-pink-900">
        <div className="bg-transparent dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
          <motion.h2 
            className="text-4xl font-bold mb-6 text-white dark:text-purple-400 text-center"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Complete Your Profile
          </motion.h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <label htmlFor="name" className="block mb-2 text-white dark:text-gray-300">Name</label>
              <div className="relative">
                <FaUser className="absolute top-3 left-3 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <label htmlFor="department" className="block mb-2 text-white dark:text-gray-300">Department</label>
              <div className="relative">
                <FaGraduationCap className="absolute top-3 left-3 text-gray-400" />
                <input
                  type="text"
                  id="department"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  value={userInfo.department}
                  onChange={(e) => setUserInfo({ ...userInfo, department: e.target.value })}
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <label htmlFor="year" className="block mb-2 text-white dark:text-gray-300">Year</label>
              <div className="relative">
                <FaCalendarAlt className="absolute top-3 left-3 text-gray-400" />
                <input
                  type="number"
                  id="year"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  value={userInfo.year}
                  onChange={(e) => setUserInfo({ ...userInfo, year: e.target.value })}
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <label htmlFor="institution" className="block mb-2 text-white dark:text-gray-300">Institution Name</label>
              <div className="relative">
                <FaUniversity className="absolute top-3 left-3 text-gray-400" />
                <input
                  type="text"
                  id="institution"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  value={userInfo.institution}
                  onChange={(e) => setUserInfo({ ...userInfo, institution: e.target.value })}
                />
              </div>
            </motion.div>
            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-md font-semibold hover:opacity-90 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500"
              whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgb(147,51,234)" }}
              whileTap={{ scale: 0.95 }}
            >
              Save Profile
            </motion.button>
          </form>
        </div>
      </div>
    );
  }

  return null;
}

export default Dashboard;