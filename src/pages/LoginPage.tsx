// src/pages/LoginPage.tsx
import React, { useState, FormEvent, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginPayload } from '../types/auth';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuth();

   // Clear previous errors when component mounts or fields change
    useEffect(() => {
        clearError();
    }, [clearError]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
        // Basic client-side validation (consider a library like react-hook-form for more)
        alert('Please enter both username and password.');
        return;
    }
    const credentials: LoginPayload = { username, password };
    await login(credentials);
    // Navigation is handled inside the login function upon success
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg sm:w-full md:w-1/2 lg:w-1/3">
        <h3 className="text-2xl font-bold text-center text-gray-800">Login to your account</h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
              <label className="block text-gray-700" htmlFor="username">Username</label>
              <input
                type="text"
                placeholder="Username"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-gray-700" htmlFor="password">Password</label>
              <input
                type="password"
                placeholder="Password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>
            {error && (
              <div className="mt-4 text-xs text-red-600 bg-red-100 border border-red-300 p-2 rounded">
                {error}
              </div>
            )}
            <div className="flex items-baseline justify-between mt-6">
              <button
                type="submit"
                className={`w-full px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>
             <div className="mt-4 text-sm text-center text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:underline">
                    Register here
                </Link>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;