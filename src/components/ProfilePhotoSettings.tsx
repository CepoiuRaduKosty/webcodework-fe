
import React, { useState, useRef, ChangeEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as accountService from '../services/accountService';
import { FaUserCircle, FaCamera, FaTrashAlt, FaSpinner } from 'react-icons/fa';

export const ProfilePhotoSettings: React.FC = () => {
    const { user, updateUserProfilePhoto } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError(null);
        setSuccessMessage(null);
        setIsUploading(true);

        try {
            const updatedProfile = await accountService.uploadProfilePhoto(file);
            updateUserProfilePhoto(updatedProfile.profilePhotoUrl || null); 
            setSuccessMessage("Profile photo updated successfully!");
        } catch (err: any) {
            setError(err.message || "Failed to upload photo.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = ""; 
        }
    };

    const handleDeletePhoto = async () => {
        if (!user?.profilePhotoUrl) return;
        if (!window.confirm("Are you sure you want to remove your profile photo?")) return;

        setError(null);
        setSuccessMessage(null);
        setIsDeleting(true);
        try {
            await accountService.deleteProfilePhoto();
            updateUserProfilePhoto(null); 
            setSuccessMessage("Profile photo removed successfully!");
        } catch (err: any) {
            setError(err.message || "Failed to remove photo.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <section className="bg-white p-6 shadow-lg rounded-xl space-y-4">
            <h2 className="text-xl font-semibold text-[#112D4E] border-b pb-3 flex items-center">
                <FaUserCircle className="mr-2 text-[#3F72AF]" /> Profile Picture
            </h2>

            <div className="flex flex-col items-center space-y-4">
                {user?.profilePhotoUrl ? (
                    <img
                        src={user.profilePhotoUrl}
                        alt="Current profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-[#DBE2EF] shadow-md"
                    />
                ) : (
                    <div className="w-32 h-32 rounded-full bg-[#DBE2EF] flex items-center justify-center border-4 border-gray-200 shadow-md">
                        <FaUserCircle size={60} className="text-[#3F72AF] opacity-75" />
                    </div>
                )}

                {error && <p className="text-sm text-red-600 p-2 bg-red-50 rounded-md border border-red-200 w-full text-center">{error}</p>}
                {successMessage && <p className="text-sm text-green-600 p-2 bg-green-50 rounded-md border border-green-200 w-full text-center">{successMessage}</p>}

                <div className="flex space-x-3">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || isDeleting}
                        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#3F72AF] rounded-md hover:bg-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:ring-offset-2 disabled:opacity-60 transition-colors duration-150"
                    >
                        {isUploading ? <FaSpinner className="animate-spin mr-2" /> : <FaCamera className="mr-2" />}
                        {isUploading ? 'Uploading...' : (user?.profilePhotoUrl ? 'Change Photo' : 'Upload Photo')}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg, image/png, image/gif, image/webp" className="hidden" />

                    {user?.profilePhotoUrl && (
                        <button
                            type="button"
                            onClick={handleDeletePhoto}
                            disabled={isDeleting || isUploading}
                            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-60 transition-colors duration-150"
                        >
                           {isDeleting ? <FaSpinner className="animate-spin mr-2" /> : <FaTrashAlt className="mr-2" />}
                           {isDeleting ? 'Removing...' : 'Remove Photo'}
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};