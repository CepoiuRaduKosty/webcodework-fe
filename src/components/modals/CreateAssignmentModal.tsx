// src/components/modals/CreateAssignmentModal.tsx (or your actual path)
import React, { FormEvent, useEffect, useState } from "react"; // Added React import
import { CreateAssignmentDto } from "../../types/assignment";
import { Modal } from "../Modal"; // Assuming Modal is in ../Modal
import { ClassroomDetailsDto } from "../../types/classroom";
import * as assignmentService from '../../services/assignmentService';
import { FaSpinner } from "react-icons/fa"; // For loading state on button

export const CreateAssignmentModal: React.FC<{
    details: ClassroomDetailsDto, // Classroom details to get classroomId
    show: boolean,
    onSuccessCallback: () => Promise<void>,
    onCancelCallback: () => void
}> = ({ details, show, onSuccessCallback, onCancelCallback }) => {

    const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
    const [newAssignmentInstructions, setNewAssignmentInstructions] = useState('');
    const [newAssignmentDueDate, setNewAssignmentDueDate] = useState('');
    const [newAssignmentMaxPoints, setNewAssignmentMaxPoints] = useState<string>('');
    const [isCodeAssignment, setIsCodeAssignment] = useState<boolean>(false);
    const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
    const [createAssignmentError, setCreateAssignmentError] = useState<string | null>(null);

    const resetForm = () => {
        setNewAssignmentTitle('');
        setNewAssignmentInstructions('');
        setNewAssignmentDueDate('');
        setNewAssignmentMaxPoints('');
        setIsCodeAssignment(false);
        setCreateAssignmentError(null);
        // setIsCreatingAssignment(false); // Keep this to avoid race condition if modal closes fast
    };

    useEffect(() => {
        if (!show) {
            const timer = setTimeout(() => {
                 resetForm();
            }, 150); // Delay for modal close animation
             return () => clearTimeout(timer);
        } else {
            // Optionally reset error when modal re-opens
            setCreateAssignmentError(null);
        }
    }, [show]);

    const handleCreateAssignment = async (e: FormEvent) => {
        e.preventDefault();
        if (!details?.id || !newAssignmentTitle.trim()) {
            setCreateAssignmentError("Classroom context missing or Title is required."); return;
        }

        const maxPointsNum = newAssignmentMaxPoints ? parseInt(newAssignmentMaxPoints, 10) : null;
        if (newAssignmentMaxPoints && (isNaN(maxPointsNum ?? NaN) || (maxPointsNum ?? -1) < 0)) {
            setCreateAssignmentError("Max points must be a non-negative number if provided."); return;
        }

        setCreateAssignmentError(null);
        setIsCreatingAssignment(true);

        const payload: CreateAssignmentDto = {
            title: newAssignmentTitle.trim(),
            instructions: newAssignmentInstructions.trim() || undefined,
            dueDate: newAssignmentDueDate ? new Date(newAssignmentDueDate).toISOString() : null,
            maxPoints: maxPointsNum,
            isCodeAssignment: isCodeAssignment
        };

        try {
            await assignmentService.createAssignment(details.id, payload);
            // resetForm(); // Form will reset via useEffect when `show` becomes false
            await onSuccessCallback(); // This should eventually set `show` to false
        } catch (err: any) {
            setCreateAssignmentError(err.message || 'Failed to create assignment.');
        } finally {
            setIsCreatingAssignment(false);
        }
    };

    const handleCancel = () => {
        // resetForm(); // Let useEffect handle reset on show=false
        onCancelCallback();
    };

    return (
        <Modal isOpen={show} onClose={handleCancel} title="Create New Assignment"> {/* Assuming Modal itself is styled or neutral */}
            <form onSubmit={handleCreateAssignment} className="space-y-4">
                {createAssignmentError && (
                    <p className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
                        {createAssignmentError}
                    </p>
                )}
                <div>
                    <label htmlFor="assignmentTitle" className="block text-sm font-medium text-[#112D4E] mb-1">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="assignmentTitle"
                        type="text"
                        value={newAssignmentTitle}
                        onChange={(e) => setNewAssignmentTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-[#DBE2EF] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF] text-[#112D4E] placeholder-gray-400"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="assignmentInstructions" className="block text-sm font-medium text-[#112D4E] mb-1">
                        Instructions <span className="text-xs text-gray-500">(Optional)</span>
                    </label>
                    <textarea
                        id="assignmentInstructions"
                        value={newAssignmentInstructions}
                        onChange={(e) => setNewAssignmentInstructions(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-[#DBE2EF] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF] text-[#112D4E] placeholder-gray-400"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="assignmentDueDate" className="block text-sm font-medium text-[#112D4E] mb-1">
                            Due Date <span className="text-xs text-gray-500">(Optional)</span>
                        </label>
                        <input
                            id="assignmentDueDate"
                            type="datetime-local"
                            value={newAssignmentDueDate}
                            onChange={(e) => setNewAssignmentDueDate(e.target.value)}
                            className="w-full px-3 py-2 border border-[#DBE2EF] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF] text-[#112D4E]"
                        />
                    </div>
                    <div>
                        <label htmlFor="assignmentMaxPoints" className="block text-sm font-medium text-[#112D4E] mb-1">
                            Max Points <span className="text-xs text-gray-500">(Optional)</span>
                        </label>
                        <input
                            id="assignmentMaxPoints"
                            type="number"
                            value={newAssignmentMaxPoints}
                            onChange={(e) => setNewAssignmentMaxPoints(e.target.value)}
                            min="0"
                            step="1"
                            className="w-full px-3 py-2 border border-[#DBE2EF] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF] text-[#112D4E] placeholder-gray-400"
                        />
                    </div>
                </div>

                <div className="pt-3 border-t border-[#DBE2EF]"> {/* Subtle separator */}
                    <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="isCodeAssignmentModal" // Changed ID to be unique if multiple modals could exist
                                name="isCodeAssignment"
                                type="checkbox"
                                checked={isCodeAssignment}
                                onChange={(e) => setIsCodeAssignment(e.target.checked)}
                                className="focus:ring-[#3F72AF] h-4 w-4 text-[#3F72AF] border-[#DBE2EF] rounded" // Palette colors
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="isCodeAssignmentModal" className="font-medium text-[#112D4E]">
                                Code Assignment
                            </label>
                            <p className="text-xs text-gray-500">Enable test cases and automated checking for this assignment.</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-[#DBE2EF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isCreatingAssignment}
                        className={`flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#3F72AF] rounded-md hover:bg-[#112D4E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3F72AF] disabled:opacity-60 disabled:cursor-not-allowed transition-colors
                            ${isCreatingAssignment ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        {isCreatingAssignment && <FaSpinner className="animate-spin mr-2" />}
                        {isCreatingAssignment ? 'Creating...' : 'Create Assignment'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}