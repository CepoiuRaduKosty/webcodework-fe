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
    setError(null); // Clear previous error
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
     if (!username || !password) {
        setError('Please fill in all fields.');
        return;
    }
     if (password.length < 6) { // Match backend validation if possible
        setError('Password must be at least 6 characters long.');
        return;
    }


    setIsLoading(true);
    const userData: RegisterPayload = { username, password };

    try {
      const result = await registerUser(userData);
      setSuccessMessage(result.message + " Redirecting to login...");
      // Optionally clear form fields
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000); // 2 seconds delay
    } catch (err: any) {
        const errorMessage = err.message || 'Registration failed. Please try again.';
        setError(errorMessage);
        console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg sm:w-full md:w-1/2 lg:w-1/3">
        <h3 className="text-2xl font-bold text-center text-gray-800">Create an Account</h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
              <label className="block text-gray-700" htmlFor="reg-username">Username</label>
              <input
                type="text"
                placeholder="Username"
                id="reg-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-gray-700" htmlFor="reg-password">Password</label>
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                id="reg-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                required
                minLength={6}
              />
            </div>
             <div className="mt-4">
              <label className="block text-gray-700" htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm Password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>

            {error && (
              <div className="mt-4 text-xs text-red-600 bg-red-100 border border-red-300 p-2 rounded">
                {error}
              </div>
            )}
             {successMessage && (
              <div className="mt-4 text-xs text-green-600 bg-green-100 border border-green-300 p-2 rounded">
                {successMessage}
              </div>
            )}

            <div className="flex items-baseline justify-between mt-6">
              <button
                type="submit"
                className={`w-full px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 ${isLoading || successMessage ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading || !!successMessage} // Disable if loading or success message is shown
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </div>
             <div className="mt-4 text-sm text-center text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:underline">
                    Login here
                </Link>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;