// src/components/ClassroomMembersSection.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { ClassroomDetailsDto, ClassroomRole } from "../types/classroom";
import * as classroomService from '../services/classroomService';
import { AddMemberModal } from './modals/AddMemberModal';
import { FaSearch, FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa';

const ITEMS_PER_PAGE = 5;

export const ClassroomMembersSection: React.FC<{
    details: ClassroomDetailsDto,
    refreshClassroomData: () => Promise<void>
}> = ({ details, refreshClassroomData }) => {
    const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [addMemberError, setAddMemberError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const handlePerformAddMember = async (userIdNum: number, roleToAdd: 'Teacher' | 'Student') => {
        if (!details.id) {
            setAddMemberError("Classroom ID is missing."); // This error will be shown in the modal
            return; // Should not proceed
        }
        setAddMemberError(null);
        setIsAddingMember(true);
        try {
            const payload = { userId: userIdNum };
            if (roleToAdd === 'Teacher') {
                await classroomService.addTeacher(details.id.toString(), payload);
            } else {
                await classroomService.addStudent(details.id.toString(), payload);
            }
            setShowAddTeacherModal(false); // Close respective modal on success
            setShowAddStudentModal(false);
            await refreshClassroomData();
        } catch (err: any) {
            setAddMemberError(err.message || `Failed to add ${roleToAdd.toLowerCase()}.`);
            // Error is shown in the modal, modal remains open.
        } finally {
            setIsAddingMember(false);
        }
    };

    useEffect(() => {
        if (!showAddTeacherModal && !showAddStudentModal) {
            setAddMemberError(null);
        }
    }, [showAddTeacherModal, showAddStudentModal]);

    const canAddTeacher = details.currentUserRole === ClassroomRole.Owner;
    const canAddStudent = details.currentUserRole === ClassroomRole.Owner || details.currentUserRole === ClassroomRole.Teacher;

    const allMembersSorted = useMemo(() => {
        return [...details.members]
            .sort((a, b) => {
                // Owners first, then Teachers, then Students, then by username
                if (a.role !== b.role) return a.role - b.role; // Assumes enum 0, 1, 2
                return a.username.localeCompare(b.username);
            });
    }, [details.members]);

    const filteredMembers = useMemo(() => {
        return allMembersSorted.filter(member =>
            member.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allMembersSorted, searchTerm]);

    // Pagination logic
    const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
    const paginatedMembers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredMembers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredMembers, currentPage]);

    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    // Reset to page 1 if search term changes and current page becomes invalid
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);


    const RoleBadge: React.FC<{ role: ClassroomRole }> = ({ role }) => {
        let styles = "text-xs font-medium px-2.5 py-0.5 rounded-full";
        let roleName = ClassroomRole[role]; // Get string name from enum value

        if (role === ClassroomRole.Owner) {
            styles += " bg-[#112D4E] text-[#F9F7F7]"; // Darkest Blue with Lightest text
        } else if (role === ClassroomRole.Teacher) {
            styles += " bg-[#3F72AF] text-white"; // Primary Blue with White text
        } else { // Student
            // Students might not need a prominent badge or a very subtle one
            // styles += " bg-[#DBE2EF] text-[#3F72AF]"; // Light Accent with Primary text
            return null; // Or return null if you don't want to show for students
        }
        return <span className={styles}>{roleName}</span>;
    };

    return (
        <>
            <div className="lg:col-span-1 bg-white p-4 md:p-6 shadow-xl rounded-2xl text-[#112D4E]">
                <h2 className="text-2xl font-bold mb-1">Members</h2>

                {/* Add Member Buttons */}
                <div className="space-y-2 mb-6">
                    {canAddTeacher && (
                        <button
                            onClick={() => setShowAddTeacherModal(true)}
                            className="w-full flex items-center justify-center px-3 py-2 bg-[#DBE2EF] text-[#3F72AF] rounded-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:ring-opacity-50 text-sm font-semibold transition-colors"
                        >
                            <FaPlus className="mr-2" /> Add Teacher
                        </button>
                    )}
                    {canAddStudent && (
                        <button
                            onClick={() => setShowAddStudentModal(true)}
                            className="w-full flex items-center justify-center px-3 py-2 bg-[#DBE2EF] text-[#3F72AF] rounded-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:ring-opacity-50 text-sm font-semibold transition-colors"
                        >
                            <FaPlus className="mr-2" /> Add Student
                        </button>
                    )}
                </div>

                {/* Search Bar */}
                <div className="mb-4 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search members by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-[#DBE2EF] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF] sm:text-sm text-[#112D4E]"
                    />
                </div>

                {/* Member List */}
                {filteredMembers.length === 0 && searchTerm && (
                    <p className="text-sm text-gray-500 text-center py-4">No members found matching "{searchTerm}".</p>
                )}
                {filteredMembers.length === 0 && !searchTerm && (
                    <p className="text-sm text-gray-500 text-center py-4">This classroom has no members yet.</p>
                )}

                <ul className="space-y-3">
                    {paginatedMembers.map(member => (
                        <li key={member.userId} className="flex items-center space-x-3 p-3 bg-[#F9F7F7] border border-[#DBE2EF] rounded-md hover:shadow-md transition-shadow">
                            {member.profilePhotoUrl ? (
                                <img src={member.profilePhotoUrl} alt={member.username} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-[#DBE2EF] flex items-center justify-center text-[#3F72AF] text-lg font-semibold border-2 border-white shadow-sm">
                                    {member.username.substring(0, 1).toUpperCase()}
                                </div>
                                // Or: <FaUserCircle size={40} className="text-[#DBE2EF]" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#112D4E] truncate">{member.username}</p>
                                <p className="text-xs text-gray-500 truncate">Joined: {new Date(member.joinedAt).toLocaleDateString()}</p>
                            </div>
                            {member.role !== ClassroomRole.Student && <RoleBadge role={member.role} />}
                            {/* TODO: Add "remove member" button for Owner/Teacher if needed */}
                        </li>
                    ))}
                </ul>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-6 flex justify-between items-center text-sm">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 border border-[#DBE2EF] rounded-md hover:bg-[#DBE2EF] text-[#3F72AF] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            <FaChevronLeft className="mr-1 h-3 w-3" /> Previous
                        </button>
                        <span className="text-gray-600">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 border border-[#DBE2EF] rounded-md hover:bg-[#DBE2EF] text-[#3F72AF] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            Next <FaChevronRight className="ml-1 h-3 w-3" />
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AddMemberModal
                isOpen={showAddTeacherModal}
                onClose={() => setShowAddTeacherModal(false)}
                onAddMember={(userId) => handlePerformAddMember(userId, 'Teacher')}
                roleToAdd="Teacher"
                classroomId={details.id} // <-- Pass classroomId
                isAddingMemberLoading={isAddingMember}
                addMemberError={addMemberError}
                clearAddMemberError={() => setAddMemberError(null)}
            />
            <AddMemberModal
                isOpen={showAddStudentModal}
                onClose={() => setShowAddStudentModal(false)}
                onAddMember={(userId) => handlePerformAddMember(userId, 'Student')}
                roleToAdd="Student"
                classroomId={details.id} // <-- Pass classroomId
                isAddingMemberLoading={isAddingMember}
                addMemberError={addMemberError}
                clearAddMemberError={() => setAddMemberError(null)}
            />
        </>
    );
};