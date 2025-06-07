// src/components/AddMemberModal.tsx
import React, { useState, FormEvent, useEffect }  from 'react';
import { Modal } from '../Modal';
import { UserSearchResultDto } from '../../types/classroom'; 
import * as classroomService from '../../services/classroomService';
import { FaSearch, FaSpinner } from 'react-icons/fa';

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddMember: (userId: number) => Promise<void>; 
    roleToAdd: 'Teacher' | 'Student';
    classroomId: number | string | undefined; 
    isAddingMemberLoading: boolean; 
    addMemberError: string | null;
    clearAddMemberError: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
    isOpen,
    onClose,
    onAddMember,
    roleToAdd,
    classroomId,
    isAddingMemberLoading,
    addMemberError,
    clearAddMemberError,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<UserSearchResultDto[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserSearchResultDto | null>(null);

    useEffect(() => {
        if (!isOpen) { 
            setSearchTerm('');
            setSearchResults([]);
            setIsSearching(false);
            setSearchError(null);
            setSelectedUser(null);
            return;
        }

        if (searchTerm.trim().length < 2) {
            setSearchResults([]);
            setSelectedUser(null);
            return;
        }

        const handler = setTimeout(async () => {
            if (!classroomId) {
                setSearchError("Classroom context is missing.");
                return;
            }
            setIsSearching(true);
            setSearchError(null);
            try {
                const results = await classroomService.searchPotentialMembers(classroomId, searchTerm);
                setSearchResults(results);
            } catch (err: any) {
                setSearchError(err.message || "Search failed.");
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, classroomId, isOpen]);

    const handleSelectUser = (user: UserSearchResultDto) => {
        setSelectedUser(user);
        setSearchTerm(user.username); 
        setSearchResults([]); 
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearAddMemberError(); 
        if (!selectedUser) {
            alert("Please search and select a user to add.");
            return;
        }
        await onAddMember(selectedUser.userId);
    };

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setSearchResults([]);
            setSelectedUser(null);
            setSearchError(null);
            setIsSearching(false);
        }
    }, [isOpen]);


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Add New ${roleToAdd}`}>
            <form onSubmit={handleSubmit}>
                {addMemberError && <p className="text-sm text-red-600 mb-3 p-2 bg-red-50 rounded border border-red-200">{addMemberError}</p>}

                {/* Search Input */}
                <div className="mb-3">
                    <label htmlFor={`search-${roleToAdd.toLowerCase()}`} className="block text-sm font-medium text-[#112D4E] mb-1">
                        Search User by Username
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            id={`search-${roleToAdd.toLowerCase()}`}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setSelectedUser(null); /* Clear selection on new typing */ }}
                            className="w-full pl-10 pr-3 py-2 border border-[#DBE2EF] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF] text-[#112D4E]"
                            placeholder="Type at least 2 characters..."
                        />
                        {isSearching && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <FaSpinner className="animate-spin h-4 w-4 text-[#3F72AF]" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Search Results */}
                {searchError && <p className="text-xs text-red-500 mb-2">{searchError}</p>}
                {searchResults.length > 0 && !selectedUser && (
                    <div className="mb-3 border border-[#DBE2EF] rounded-md max-h-48 overflow-y-auto bg-white shadow">
                        <ul className="divide-y divide-[#DBE2EF]">
                            {searchResults.map(user => (
                                <li
                                    key={user.userId}
                                    onClick={() => handleSelectUser(user)}
                                    className="p-2 hover:bg-[#DBE2EF] cursor-pointer flex items-center space-x-2"
                                >
                                    {user.profilePhotoUrl ? (
                                        <img src={user.profilePhotoUrl} alt={user.username} className="w-6 h-6 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-[#DBE2EF] flex items-center justify-center text-[#3F72AF] text-xs">
                                            {user.username.substring(0, 1).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-sm text-[#112D4E]">{user.username}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Display Selected User */}
                {selectedUser && (
                    <div className="mb-4 p-3 bg-[#DBE2EF] rounded-md text-sm text-[#112D4E]">
                        Selected: <span className="font-semibold">{selectedUser.username}</span>
                        <button type="button" onClick={() => { setSelectedUser(null); setSearchTerm(''); setSearchResults([]); }} className="ml-2 text-xs text-red-500 hover:underline">(Clear)</button>
                    </div>
                )}


                <button
                    type="submit"
                    disabled={isAddingMemberLoading || !selectedUser}
                    className={`w-full px-4 py-2 text-sm font-medium text-white bg-[#3F72AF] rounded-md hover:bg-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:ring-offset-2 disabled:opacity-60 transition-colors duration-150
                        ${(isAddingMemberLoading || !selectedUser) ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                    {isAddingMemberLoading ? 'Adding...' : `Add ${roleToAdd}`}
                </button>
            </form>
        </Modal>
    );
};