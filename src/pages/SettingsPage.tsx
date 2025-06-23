
import React, { useState, FormEvent, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 
import * as accountService from '../services/accountService';
import { ChangeUsernamePayload, ChangePasswordPayload } from '../types/account';
import PasswordStrengthBar from 'react-password-strength-bar';
import zxcvbn from 'zxcvbn';
import { FaUserEdit, FaKey, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { ProfilePhotoSettings } from '../components/ProfilePhotoSettings';

const MIN_PASSWORD_LENGTH = 8;

const SettingsPage: React.FC = () => {
    
    const { user } = useAuth();

    
    const [newUsername, setNewUsername] = useState(user?.username || '');
    const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
    const [usernameUpdateError, setUsernameUpdateError] = useState<string | null>(null);
    const [usernameUpdateSuccess, setUsernameUpdateSuccess] = useState<string | null>(null);

    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwordUpdateError, setPasswordUpdateError] = useState<string | null>(null);
    const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState<string | null>(null);

    
    const [newPasswordScore, setNewPasswordScore] = useState(0);
    const [newPasswordFeedback, setNewPasswordFeedback] = useState<string[]>([]);
    const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);

    useEffect(() => {
        if (user?.username) {
            setNewUsername(user.username);
        }
    }, [user?.username]);

    useEffect(() => {
        if (newPassword) {
            const analysis = zxcvbn(newPassword);
            setNewPasswordScore(analysis.score);
            setNewPasswordFeedback(analysis.feedback?.suggestions || []);
        } else {
            setNewPasswordScore(0);
            setNewPasswordFeedback([]);
        }
    }, [newPassword]);

    const newPasswordCriteria = useMemo(() => {
        const lengthMet = newPassword.length >= MIN_PASSWORD_LENGTH;
        const passwordsMatch = newPassword && confirmNewPassword && newPassword === confirmNewPassword;
        const strengthMet = newPasswordScore >= 2;
        return { lengthMet, passwordsMatch, strengthMet, allValid: lengthMet && passwordsMatch && strengthMet };
    }, [newPassword, confirmNewPassword, newPasswordScore]);


    const handleUsernameSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setUsernameUpdateError(null);
        setUsernameUpdateSuccess(null);
        if (!newUsername.trim() || newUsername.trim() === user?.username) {
            setUsernameUpdateError("Please enter a new, valid username.");
            return;
        }

        setIsUpdatingUsername(true);
        try {
            await accountService.changeUsername({ newUsername: newUsername.trim() });
            setUsernameUpdateSuccess("Username updated successfully!");
            
        } catch (err: any) {
            setUsernameUpdateError(err.message || "Failed to update username.");
        } finally {
            setIsUpdatingUsername(false);
        }
    };

    const handlePasswordSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setPasswordUpdateError(null);
        setPasswordUpdateSuccess(null);

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setPasswordUpdateError("All password fields are required."); return;
        }
        if (!newPasswordCriteria.allValid) {
            setPasswordUpdateError("New password does not meet all criteria or passwords do not match."); return;
        }
        if (newPasswordScore < 2) {
            setPasswordUpdateError("New password is too weak."); return;
        }

        setIsUpdatingPassword(true);
        const payload: ChangePasswordPayload = { currentPassword, newPassword, confirmNewPassword };
        try {
            await accountService.changePassword(payload);
            setPasswordUpdateSuccess("Password changed successfully!");
            setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
            setNewPasswordScore(0); setIsNewPasswordFocused(false);
        } catch (err: any) {
            setPasswordUpdateError(err.message || "Failed to change password.");
        } finally {
            setIsUpdatingPassword(false);
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
        <div className="min-h-screen bg-[#F9F7F7] py-8 text-[#112D4E]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <header className="mb-8">
                    <Link to="/dashboard" className="text-sm text-[#3F72AF] hover:text-[#112D4E] hover:underline inline-flex items-center">
                        &larr; Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-[#112D4E] mt-2">Account Settings</h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <ProfilePhotoSettings />
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white p-6 shadow-lg rounded-xl">
                            <h2 className="text-xl font-semibold text-[#112D4E] mb-5 border-b pb-3 flex items-center">
                                <FaUserEdit className="mr-2 text-[#3F72AF]" /> Change Username
                            </h2>
                            <form onSubmit={handleUsernameSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="newUsername" className="block text-sm font-medium text-[#112D4E] mb-1">New Username</label>
                                    <input
                                        type="text" id="newUsername" value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        required minLength={3} maxLength={100}
                                        className="w-full px-3 py-2 border border-[#DBE2EF] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF] sm:text-sm"
                                    />
                                </div>
                                {usernameUpdateError && <p className="text-sm text-red-600 p-2 bg-red-50 rounded-md border border-red-200">{usernameUpdateError}</p>}
                                {usernameUpdateSuccess && <p className="text-sm text-green-600 p-2 bg-green-50 rounded-md border border-green-200">{usernameUpdateSuccess}</p>}
                                <button type="submit" disabled={isUpdatingUsername || newUsername === user?.username}
                                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-[#3F72AF] rounded-md hover:bg-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150">
                                    {isUpdatingUsername ? 'Saving...' : 'Save Username'}
                                </button>
                            </form>
                        </section>

                        {/* Change Password Section */}
                        <section className="bg-white p-6 shadow-lg rounded-xl">
                            <h2 className="text-xl font-semibold text-[#112D4E] mb-5 border-b pb-3 flex items-center">
                                <FaKey className="mr-2 text-[#3F72AF]" /> Change Password
                            </h2>
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="currentPassword" className="block text-sm font-medium text-[#112D4E] mb-1">Current Password</label>
                                    <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
                                        className="w-full px-3 py-2 border border-[#DBE2EF] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF] sm:text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="newPasswordSettings" className="block text-sm font-medium text-[#112D4E] mb-1">New Password</label>
                                    <input type="password" id="newPasswordSettings" value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)} required
                                        onFocus={() => setIsNewPasswordFocused(true)}
                                        className="w-full px-3 py-2 border border-[#DBE2EF] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF] sm:text-sm" />
                                    {newPassword && (
                                        <div className="mt-2">
                                            <PasswordStrengthBar password={newPassword} scoreWords={['Too Weak', 'Weak', 'Okay', 'Good', 'Strong']} shortScoreWord="Too Short" scoreWordClassName="text-xs text-[#112D4E] mt-1" />
                                        </div>
                                    )}
                                    {(isNewPasswordFocused || newPassword.length > 0) && (
                                        <ul className="mt-2 space-y-1 text-xs">
                                            {renderCriteriaFeedback(`At least ${MIN_PASSWORD_LENGTH} characters`, newPasswordCriteria.lengthMet)}
                                            <li className={`flex items-center ${newPasswordCriteria.lengthMet ? 'text-green-600' : 'text-gray-500'}`}> {newPasswordCriteria.lengthMet ? <FaCheckCircle className="mr-1.5" /> : <FaExclamationCircle className="mr-1.5" />} At least {MIN_PASSWORD_LENGTH} characters</li>
                                            {newPasswordFeedback.map((fb, i) => <li key={i} className="flex items-center text-yellow-700"><FaExclamationCircle className="mr-1.5" />{fb}</li>)}
                                        </ul>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="confirmNewPasswordSettings" className="block text-sm font-medium text-[#112D4E] mb-1">Confirm New Password</label>
                                    <input type="password" id="confirmNewPasswordSettings" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required
                                        className="w-full px-3 py-2 border border-[#DBE2EF] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF] sm:text-sm" />
                                    {(isNewPasswordFocused || confirmNewPassword.length > 0) && newPassword.length > 0 && (
                                        <div className="mt-1 text-xs">
                                            <span className={`flex items-center ${newPasswordCriteria.passwordsMatch ? 'text-green-600' : 'text-red-600'}`}> {newPasswordCriteria.passwordsMatch ? <FaCheckCircle className="mr-1.5" /> : <FaExclamationCircle className="mr-1.5" />} Passwords match</span>
                                        </div>
                                    )}
                                </div>
                                {passwordUpdateError && <p className="text-sm text-red-600 p-2 bg-red-50 rounded-md border border-red-200">{passwordUpdateError}</p>}
                                {passwordUpdateSuccess && <p className="text-sm text-green-600 p-2 bg-green-50 rounded-md border border-green-200">{passwordUpdateSuccess}</p>}
                                <button type="submit" disabled={isUpdatingPassword || !newPasswordCriteria.allValid || newPasswordScore < 2}
                                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-[#3F72AF] rounded-md hover:bg-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150">
                                    {isUpdatingPassword ? 'Saving...' : 'Change Password'}
                                </button>
                            </form>
                        </section>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SettingsPage;