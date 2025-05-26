// src/pages/RegisterPage.tsx
import React, { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService'; // Use service directly
import { RegisterPayload } from '../types/auth';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

    // Clear messages when fields change
    useEffect(() => {
        setError(null);
        setSuccessMessage(null);
    }, [username, password, confirmPassword]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
     if (!username || !password) {
        setError('Please fill in all fields.');
        return;
    }
     if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }


    setIsLoading(true);
    const userData: RegisterPayload = { username, password };

    try {
      const result = await registerUser(userData);
      setSuccessMessage(result.message + " Redirecting to login...");
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
        const errorMessage = err.message || 'Registration failed. Please try again.';
        setError(errorMessage);
        console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#F9F7F7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <div className="absolute -top-20 -left-20 w-72 h-72 md:w-96 md:h-96 bg-[#DBE2EF] rounded-full opacity-30 md:opacity-50"></div> 
        <div className="absolute -bottom-24 -right-16 w-60 h-60 md:w-80 md:h-80 bg-[#3F72AF] rounded-full opacity-10 md:opacity-20"></div>
        <div className="absolute top-1/4 left-1/3 w-48 h-48 md:w-64 md:h-64 bg-[#DBE2EF] rounded-lg opacity-20 md:opacity-40 rotate-45"></div>
      </div>
      <div className="z-10 w-full max-w-md p-8 md:p-10 space-y-8 bg-white shadow-xl rounded-2xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-[#112D4E]"> 
            Create your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="reg-username" className="block text-sm font-medium text-[#112D4E] mb-1"> 
              Username
            </label>
            <input
              id="reg-username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="appearance-none block w-full px-3 py-3 border border-[#DBE2EF] rounded-md shadow-sm placeholder-gray-400 text-[#112D4E] focus:outline-none focus:ring-[#3F72AF] focus:border-[#3F72AF] sm:text-sm"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading || !!successMessage}
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-[#112D4E] mb-1">
              Password
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              className="appearance-none block w-full px-3 py-3 border border-[#DBE2EF] rounded-md shadow-sm placeholder-gray-400 text-[#112D4E] focus:outline-none focus:ring-[#3F72AF] focus:border-[#3F72AF] sm:text-sm"
              placeholder="Create a password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || !!successMessage}
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-[#112D4E] mb-1">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none block w-full px-3 py-3 border border-[#DBE2EF] rounded-md shadow-sm placeholder-gray-400 text-[#112D4E] focus:outline-none focus:ring-[#3F72AF] focus:border-[#3F72AF] sm:text-sm"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading || !!successMessage}
            />
          </div>

          {error && (
            <div className="mt-4 text-sm text-red-700 bg-red-100 border border-red-200 p-3 rounded-md text-center">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mt-4 text-sm text-green-700 bg-green-100 border border-green-200 p-3 rounded-md text-center">
              {successMessage}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || !!successMessage}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#3F72AF] hover:bg-[#112D4E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3F72AF] disabled:opacity-70 disabled:cursor-not-allowed
                ${(isLoading || !!successMessage) ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? 'Creating account...' : (successMessage ? 'Registered!' : 'Create Account')}
            </button>
          </div>

          <div className="text-sm text-center">
            <span className="text-gray-600">Already have an account? </span>
            <Link
              to="/login"
              className="font-medium text-[#3F72AF] hover:text-[#112D4E] hover:underline"
            >
              Login here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;