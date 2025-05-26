// src/components/AddMemberModal.tsx
import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { Modal } from '../Modal';
import { searchUsersByUsername } from '../../services/userServices';
import { UserSearchResultDto } from '../../types/user';
import { FaSearch, FaUserCircle, FaSpinner, FaCheckCircle } from 'react-icons/fa';

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddMember: (userId: number, username: string) => Promise<void>;
    roleToAdd: 'Teacher' | 'Student';
    isLoading: boolean;
    error: string | null;
    clearError: () => void;
    // Optional: Pass existing member IDs to exclude them from search results if backend doesn't handle it
    // existingMemberIds?: number[];
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
    isOpen,
    onClose,
    onAddMember,
    roleToAdd,
    isLoading: isAddingFinalMember, // Renamed for clarity
    error: finalAddError,
    clearError: clearFinalAddError,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<UserSearchResultDto[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserSearchResultDto | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchAttempted, setSearchAttempted] = useState(false); // To show "no results" only after a search

    // Debounce search
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            setSearchAttempted(false);
            return;
        }

        setIsSearching(true);
        setSearchAttempted(true); // Mark that a search will be attempted
        const delayDebounceFn = setTimeout(async () => {
            try {
                const results = await searchUsersByUsername(searchTerm);
                setSearchResults(results);
            } catch (searchErr) {
                console.error("Search failed:", searchErr);
                setSearchResults([]); // Clear results on error
            } finally {
                setIsSearching(false);
            }
        }, 500); // 500ms debounce delay

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleSelectUser = (user: UserSearchResultDto) => {
        setSelectedUser(user);
        setSearchTerm(user.username); // Pre-fill search bar with selected username
        setSearchResults([]); // Hide search results after selection
        setSearchAttempted(false);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearFinalAddError();
        if (!selectedUser) {
            // This error should be handled by parent or shown near button
            alert("Please select a user from the search results.");
            return;
        }
        await onAddMember(selectedUser.userId, selectedUser.username);
        // Modal closure and form reset should be handled by parent success/failure of onAddMember
    };

    // Reset local state when modal is closed/reopened
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setSearchResults([]);
            setSelectedUser(null);
            setIsSearching(false);
            setSearchAttempted(false);
            clearFinalAddError(); // Clear errors passed from parent when modal closes
        }
    }, [isOpen, clearFinalAddError]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Add New ${roleToAdd}`}>
            <form onSubmit={handleSubmit}>
                {finalAddError && (
                    <p className="text-sm text-red-600 mb-3 p-2 bg-red-50 rounded border border-red-200">
                        {finalAddError}
                    </p>
                )}

                {/* Search Input */}
                <div className="mb-3">
                    <label htmlFor={`search-${roleToAdd.toLowerCase()}`} className="block text-sm font-medium text-[#112D4E] mb-1">
                        Search User by Username
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {isSearching ? (
                                <FaSpinner className="animate-spin h-4 w-4 text-gray-400" />
                            ) : (
                                <FaSearch className="h-4 w-4 text-gray-400" />
                            )}
                        </div>
                        <input
                            id={`search-${roleToAdd.toLowerCase()}`}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setSelectedUser(null); // Clear selection if user types again
                                setSearchAttempted(true);
                            }}
                            className="w-full pl-10 pr-3 py-2 border border-[#DBE2EF] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF] text-[#112D4E]"
                            placeholder="Start typing username..."
                            disabled={isAddingFinalMember}
                        />
                    </div>
                </div>

                {/* Search Results */}
                {searchAttempted && !isSearching && searchTerm.trim() && (
                    <div className="mb-3 max-h-60 overflow-y-auto border border-[#DBE2EF] rounded-md bg-[#F9F7F7] shadow">
                        {searchResults.length > 0 ? (
                            <ul className="divide-y divide-[#DBE2EF]">
                                {searchResults.map(user => (
                                    <li
                                        key={user.userId}
                                        onClick={() => handleSelectUser(user)}
                                        className="p-3 flex items-center space-x-3 hover:bg-[#DBE2EF] cursor-pointer transition-colors"
                                    >
                                        {user.profilePhotoUrl ? (
                                            <img src={user.profilePhotoUrl} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-[#DBE2EF] flex items-center justify-center text-[#3F72AF]">
                                                <FaUserCircle size={20}/>
                                            </div>
                                        )}
                                        <span className="text-sm font-medium text-[#112D4E]">{user.username}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="p-3 text-sm text-gray-500 italic">No users found matching "{searchTerm}".</p>
                        )}
                    </div>
                )}

                {/* Display Selected User */}
                {selectedUser && (
                    <div className="mb-4 p-3 border border-green-300 bg-green-50 rounded-md flex items-center space-x-3 text-sm">
                        <FaCheckCircle className="text-green-600 h-5 w-5 flex-shrink-0" />
                        <div>
                            <span className="font-semibold text-green-800">Selected:</span> {selectedUser.username} (ID: {selectedUser.userId})
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isAddingFinalMember || !selectedUser}
                    className={`w-full px-4 py-2 text-sm font-medium text-white bg-[#3F72AF] rounded-md hover:bg-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:ring-offset-2 disabled:opacity-60 transition-colors duration-150
                        ${(isAddingFinalMember || !selectedUser) ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                    {isAddingFinalMember ? 'Adding...' : `Add ${roleToAdd}`}
                </button>
            </form>
        </Modal>
    );
};