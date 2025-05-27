// src/components/AssignmentTopElement.tsx
import React, { useState } from 'react'; 
import { format, parseISO } from 'date-fns';
import { AssignmentDetailsDto } from "../types/assignment"; 
import * as assignmentService from '../services/assignmentService';
import { EditAssignmentModal } from './modals/EditAssignmentModal'; 
import { FaEdit, FaTrashAlt, FaCalendarAlt, FaUserEdit, FaStar, FaCode, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ClassroomRole } from '../types/classroom';

const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try { return format(parseISO(dateString), 'MMM d, yyyy HH:mm'); } catch { return 'Invalid Date'; }
};

export const AssignmentTopElement: React.FC<{
    assignmentDetails: AssignmentDetailsDto;
    currentUserId?: number;
    currentUserClassroomRole?: ClassroomRole;
    onAssignmentUpdated: () => Promise<void>;
    onAssignmentDeleted: () => void;
}> = ({ assignmentDetails, currentUserId, currentUserClassroomRole, onAssignmentUpdated, onAssignmentDeleted }) => {
    const navigate = useNavigate();

    const [showEditModal, setShowEditModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const canManageAssignment = currentUserId === assignmentDetails.createdById ||
                                currentUserClassroomRole === ClassroomRole.Owner ||
                                currentUserClassroomRole === ClassroomRole.Teacher;

    const handleDeleteAssignment = async () => {
        if (!assignmentDetails?.id) return;
        if (window.confirm(`Are you sure you want to permanently delete the assignment "${assignmentDetails.title}"? This action cannot be undone.`)) {
            setIsDeleting(true);
            setDeleteError(null);
            try {
                await assignmentService.deleteAssignment(assignmentDetails.id);
                onAssignmentDeleted();
                navigate(`/classrooms/${assignmentDetails.classroomId}`);
            } catch (err: any) {
                setDeleteError(err.message || 'Failed to delete assignment.');
                alert(`Error: ${err.message || 'Failed to delete assignment.'}`);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    return (
        <>
            <div className="bg-white p-6 md:p-8 shadow-xl rounded-2xl mb-6 text-[#112D4E]">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-4 pb-4 border-b border-[#DBE2EF]">
                    <div className="flex-grow">
                        <h1 className="text-3xl md:text-4xl font-bold text-[#112D4E] mb-2">{assignmentDetails.title}</h1>
                        <div className="flex flex-wrap items-center text-xs text-slate-500 gap-x-4 gap-y-1">
                            <span className="flex items-center"><FaUserEdit className="mr-1.5 text-[#3F72AF]" /> By: {assignmentDetails.createdByUsername}</span>
                            <span className="flex items-center"><FaCalendarAlt className="mr-1.5 text-[#3F72AF]" /> Created: {formatDate(assignmentDetails.createdAt)}</span>
                            {assignmentDetails.dueDate && <span className="flex items-center"><FaCalendarAlt className="mr-1.5 text-orange-500" /> Due: {formatDate(assignmentDetails.dueDate)}</span>}
                            {assignmentDetails.maxPoints != null && <span className="flex items-center"><FaStar className="mr-1.5 text-yellow-500" /> Points: {assignmentDetails.maxPoints}</span>}
                            {assignmentDetails.isCodeAssignment && <span className="flex items-center font-semibold text-[#3F72AF]"><FaCode className="mr-1.5" /> Code Assignment</span>}
                        </div>
                    </div>
                    {canManageAssignment && (
                        <div className="flex space-x-2 mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="px-4 py-2 text-xs font-medium text-white bg-[#3F72AF] rounded-md hover:bg-[#112D4E] flex items-center transition-colors"
                                title="Edit Assignment Details"
                            >
                                <FaEdit className="mr-1.5" /> Edit
                            </button>
                            <button
                                onClick={handleDeleteAssignment}
                                disabled={isDeleting}
                                className="px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-800 flex items-center disabled:opacity-60 transition-colors"
                                title="Delete Assignment"
                            >
                                {isDeleting && <FaSpinner className="animate-spin mr-1.5" />}
                                {isDeleting ? 'Deleting...' : <><FaTrashAlt className="mr-1.5" /> Delete</>}
                            </button>
                        </div>
                    )}
                </div>
                {deleteError && <p className="text-sm text-red-600 mb-3 p-2 bg-red-50 rounded border border-red-200">{deleteError}</p>}
                {assignmentDetails.instructions && (
                    <div className="prose prose-sm max-w-none mt-4 text-[#112D4E]">
                        <h3 className="text-md font-semibold mb-1 text-[#112D4E] border-b border-[#DBE2EF] pb-1">Instructions:</h3>
                        <div className="whitespace-pre-wrap">{assignmentDetails.instructions}</div>
                    </div>
                )}
            </div>

            {canManageAssignment && assignmentDetails && (
                 <EditAssignmentModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    assignment={assignmentDetails}
                    onAssignmentUpdated={async () => {
                        await onAssignmentUpdated();
                        setShowEditModal(false);
                    }}
                />
            )}
        </>
    )
}