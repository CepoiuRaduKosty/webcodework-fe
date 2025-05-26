// src/pages/RegisterPage.tsx
import React, { useState, FormEvent, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { RegisterPayload } from '../types/auth';
import zxcvbn from 'zxcvbn';
import PasswordStrengthBar from 'react-password-strength-bar';

const MIN_PASSWORD_LENGTH = 8;

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordScore, setPasswordScore] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Clear messages when fields change
  useEffect(() => {
    setError(null);
    setSuccessMessage(null);
  }, [username, password, confirmPassword]);

  useEffect(() => {
    if (password) {
      const analysis = zxcvbn(password);
      setPasswordScore(analysis.score); // Score from 0 (worst) to 4 (best)
      setPasswordFeedback(analysis.feedback?.suggestions || []);
    } else {
      setPasswordScore(0);
      setPasswordFeedback([]);
    }
  }, [password]);

  const passwordCriteria = useMemo(() => {
    const lengthMet = password.length >= MIN_PASSWORD_LENGTH;
    const passwordsMatch = !!(password && confirmPassword && password === confirmPassword);
    const strengthMet = passwordScore >= 2;

    return {
      lengthMet,
      passwordsMatch,
      strengthMet, // Added strength check
      allValid: lengthMet && passwordsMatch && strengthMet, // Basic form validity
    };
  }, [password, confirmPassword, passwordScore]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!username.trim()) {
        setError('Username is required.'); return;
    }
    if (!passwordCriteria.lengthMet) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }
    if (!passwordCriteria.passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }
    if (passwordScore < 2) { // 0: Risky, 1: Weak, 2: Fair, 3: Good, 4: Strong
        setError("Password is too weak. Try making it longer or adding more variety.");
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
      setPasswordScore(0);
      setIsPasswordFocused(false);
      setIsConfirmPasswordFocused(false);
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

  const renderCriteriaFeedback = (label: string, isMet: boolean) => (
    <li className={`flex items-center text-xs ${isMet ? 'text-green-600' : 'text-gray-500'}`}>
      {isMet ? (
        <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
        </svg>
      )}
      {label}
    </li>
  );

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#F9F7F7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <div className="absolute -top-20 -left-20 w-72 h-72 md:w-96 md:h-96 bg-[#DBE2EF] rounded-full opacity-30 md:opacity-50"></div> 
        <div className="absolute -bottom-24 -right-16 w-60 h-60 md:w-80 md:h-80 bg-[#3F72AF] rounded-full opacity-10 md:opacity-20"></div>
        <div className="absolute top-1/4 left-1/3 w-48 h-48 md:w-64 md:h-64 bg-[#DBE2EF] rounded-lg opacity-20 md:opacity-40 rotate-45"></div>
      </div>
      <div className="z-10 w-full max-w-md p-8 md:p-10 space-y-6 bg-white shadow-xl rounded-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-[#112D4E]">
            Create your account
          </h2>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="reg-username" className="block text-sm font-medium text-[#112D4E] mb-1">
              Username
            </label>
            <input
              id="reg-username" name="username" type="text" autoComplete="username" required
              className="appearance-none block w-full px-3 py-3 border border-[#DBE2EF] rounded-md shadow-sm placeholder-gray-400 text-[#112D4E] focus:outline-none focus:ring-[#3F72AF] focus:border-[#3F72AF] sm:text-sm"
              placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading || !!successMessage}
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-[#112D4E] mb-1">
              Password
            </label>
            <input
              id="reg-password" name="password" type="password" autoComplete="new-password" required
              minLength={MIN_PASSWORD_LENGTH}
              className="appearance-none block w-full px-3 py-3 border border-[#DBE2EF] rounded-md shadow-sm placeholder-gray-400 text-[#112D4E] focus:outline-none focus:ring-[#3F72AF] focus:border-[#3F72AF] sm:text-sm"
              placeholder="Create a password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              disabled={isLoading || !!successMessage}
            />
            {password && ( 
                <div className="mt-2">
                    <PasswordStrengthBar
                        password={password}
                        scoreWords={['Too Weak', 'Weak', 'Okay', 'Good', 'Strong']}
                        shortScoreWord="Too Short"
                        scoreWordClassName="text-xs text-[#112D4E] mt-1" 
                    />
                </div>
            )}

             {(isPasswordFocused || password.length > 0) && (
                <ul className="mt-2 space-y-1">
                    {renderCriteriaFeedback(`At least ${MIN_PASSWORD_LENGTH} characters`, passwordCriteria.lengthMet)}
                    {passwordFeedback.map((feedback, index) => (
                         <li key={index} className="flex items-center text-xs text-yellow-700">
                             <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.001-1.742 3.001H4.42c-1.53 0-2.493-1.667-1.743-3.001l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1.75-4.5a1.75 1.75 0 00-3.5 0v.25h3.5v-.25z" clipRule="evenodd" /></svg>
                             {feedback}
                         </li>
                    ))}
                </ul>
            )}
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-[#112D4E] mb-1">
              Confirm Password
            </label>
            <input
              id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required
              className="appearance-none block w-full px-3 py-3 border border-[#DBE2EF] rounded-md shadow-sm placeholder-gray-400 text-[#112D4E] focus:outline-none focus:ring-[#3F72AF] focus:border-[#3F72AF] sm:text-sm"
              placeholder="Confirm your password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setIsConfirmPasswordFocused(true)}
              onBlur={() => setIsConfirmPasswordFocused(false)}
              disabled={isLoading || !!successMessage}
            />

            {(isConfirmPasswordFocused || confirmPassword.length > 0) && password.length > 0 && (
                <div className="mt-1">
                   {renderCriteriaFeedback("Passwords match", passwordCriteria.passwordsMatch)}
                </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-100 border border-red-200 p-3 rounded-md text-center">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="text-sm text-green-700 bg-green-100 border border-green-200 p-3 rounded-md text-center">
              {successMessage}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || !!successMessage || !passwordCriteria.allValid} // Disable if criteria not met
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#3F72AF] hover:bg-[#112D4E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3F72AF] disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {isLoading ? 'Creating account...' : (successMessage ? 'Registered!' : 'Create Account')}
            </button>
          </div>

          <div className="text-sm text-center">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/login" className="font-medium text-[#3F72AF] hover:text-[#112D4E] hover:underline">
              Login here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;