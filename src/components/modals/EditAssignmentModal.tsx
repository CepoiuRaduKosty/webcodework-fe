// src/components/modals/EditAssignmentModal.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { Modal } from '../Modal'; // Your reusable Modal component
import { AssignmentDetailsDto, UpdateAssignmentPayload } from '../../types/assignment';
import * as assignmentService from '../../services/assignmentService';
import { FaSpinner } from 'react-icons/fa';

interface EditAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    assignment: AssignmentDetailsDto;
    onAssignmentUpdated: () => Promise<void>; // Callback to refresh data
}

export const EditAssignmentModal: React.FC<EditAssignmentModalProps> = ({
    isOpen,
    onClose,
    assignment,
    onAssignmentUpdated
}) => {
    const [title, setTitle] = useState(assignment.title);
    const [instructions, setInstructions] = useState(assignment.instructions || '');
    const [dueDate, setDueDate] = useState(
        assignment.dueDate ? new Date(assignment.dueDate).toISOString().substring(0, 16) : ''
    );
    const [maxPoints, setMaxPoints] = useState(assignment.maxPoints?.toString() || '');

    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setTitle(assignment.title);
            setInstructions(assignment.instructions || '');
            setDueDate(assignment.dueDate ? new Date(assignment.dueDate).toISOString().substring(0, 16) : '');
            setMaxPoints(assignment.maxPoints?.toString() || '');
            setError(null); // Clear error when modal opens
        }
    }, [isOpen, assignment]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setError("Title is required."); return;
        }
        const pointsNum = maxPoints ? parseInt(maxPoints, 10) : null;
        if (maxPoints && (isNaN(pointsNum ?? NaN) || (pointsNum ?? -1) < 0)) {
            setError("Max points must be a non-negative number if provided."); return;
        }

        setError(null);
        setIsUpdating(true);
        const payload: UpdateAssignmentPayload = {
            title: title.trim(),
            instructions: instructions.trim() || undefined,
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            maxPoints: pointsNum,
        };

        try {
            await assignmentService.updateAssignment(assignment.id, payload);
            await onAssignmentUpdated();
            onClose(); // Close modal on success
        } catch (err: any) {
            setError(err.message || "Failed to update assignment.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Assignment: ${assignment.title}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">{error}</p>}
                <div>
                    <label htmlFor="editAssignmentTitle" className="block text-sm font-medium text-[#112D4E] mb-1">Title <span className="text-red-500">*</span></label>
                    <input id="editAssignmentTitle" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-[#DBE2EF] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF] text-[#112D4E]" required />
                </div>
                <div>
                    <label htmlFor="editAssignmentInstructions" className="block text-sm font-medium text-[#112D4E] mb-1">Instructions</label>
                    <textarea id="editAssignmentInstructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={5}
                        className="w-full px-3 py-2 border border-[#DBE2EF] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF] text-[#112D4E]" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="editAssignmentDueDate" className="block text-sm font-medium text-[#112D4E] mb-1">Due Date</label>
                        <input id="editAssignmentDueDate" type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-3 py-2 border border-[#DBE2EF] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF] text-[#112D4E]" />
                    </div>
                    <div>
                        <label htmlFor="editAssignmentMaxPoints" className="block text-sm font-medium text-[#112D4E] mb-1">Max Points</label>
                        <input id="editAssignmentMaxPoints" type="number" value={maxPoints} onChange={(e) => setMaxPoints(e.target.value)} min="0" step="1"
                            className="w-full px-3 py-2 border border-[#DBE2EF] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF] text-[#112D4E]" />
                    </div>
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-[#DBE2EF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={isUpdating}
                        className={`flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#3F72AF] rounded-md hover:bg-[#112D4E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3F72AF] disabled:opacity-60 transition-colors ${isUpdating ? 'opacity-60 cursor-not-allowed' : ''}`}>
                        {isUpdating && <FaSpinner className="animate-spin mr-2" />}
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};