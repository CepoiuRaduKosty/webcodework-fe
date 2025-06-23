
import React, { useState, FormEvent, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginPayload } from '../types/auth';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
        
        alert('Please enter both username and password.');
        return;
    }
    const credentials: LoginPayload = { username, password };
    await login(credentials);
    
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#F9F7F7] overflow-hidden"> 
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <div className="absolute -top-20 -left-20 w-72 h-72 md:w-96 md:h-96 bg-[#DBE2EF] rounded-full opacity-30 md:opacity-50"></div> 
        <div className="absolute -bottom-24 -right-16 w-60 h-60 md:w-80 md:h-80 bg-[#3F72AF] rounded-full opacity-10 md:opacity-20"></div>
        <div className="absolute top-1/4 left-1/3 w-48 h-48 md:w-64 md:h-64 bg-[#DBE2EF] rounded-lg opacity-20 md:opacity-40 rotate-45"></div>
      </div>
      <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-white shadow-xl rounded-2xl m-4">
        <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-[#112D4E]">
            Login to your account
            </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-[#DBE2EF] placeholder-gray-400 text-[#112D4E] rounded-t-md focus:outline-none focus:ring-[#3F72AF] focus:border-[#3F72AF] focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-[#DBE2EF] placeholder-gray-400 text-[#112D4E] rounded-b-md focus:outline-none focus:ring-[#3F72AF] focus:border-[#3F72AF] focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <div className="mt-4 text-sm text-red-600 bg-red-100 border border-red-200 p-3 rounded-md text-center">
              {error}
            </div>
          )}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#3F72AF] hover:bg-[#112D4E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3F72AF] disabled:opacity-70 disabled:cursor-not-allowed
                ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>

          <div className="text-sm text-center">
            <span className="text-gray-600">Don't have an account? </span>
            <Link
              to="/register"
              className="font-medium text-[#3F72AF] hover:text-[#112D4E] hover:underline"
            >
              Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;