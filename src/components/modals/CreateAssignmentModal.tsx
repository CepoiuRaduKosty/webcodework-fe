import { FormEvent, useEffect, useState } from "react";
import { CreateAssignmentDto } from "../../types/assignment";
import { Modal } from "../Modal"
import { ClassroomDetailsDto } from "../../types/classroom";
import * as assignmentService from '../../services/assignmentService';


export const CreateAssignmentModal: React.FC<{ details: ClassroomDetailsDto, show: boolean, onSuccessCallback: () => Promise<void>, onCancelCallback: () => void }> = ({ details, show, onSuccessCallback, onCancelCallback }) => {

    // Create Assignment Modal State
    const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
    const [newAssignmentInstructions, setNewAssignmentInstructions] = useState('');
    const [newAssignmentDueDate, setNewAssignmentDueDate] = useState(''); // Store as string from input type="datetime-local"
    const [newAssignmentMaxPoints, setNewAssignmentMaxPoints] = useState<string>(''); // Store as string, parse later
    const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
    const [createAssignmentError, setCreateAssignmentError] = useState<string | null>(null);
    const [isCodeAssignment, setIsCodeAssignment] = useState<boolean>(false); // <-- New state for the checkbox

    // Function to reset form state
    const resetForm = () => {
        setNewAssignmentTitle('');
        setNewAssignmentInstructions('');
        setNewAssignmentDueDate('');
        setNewAssignmentMaxPoints('');
        setIsCodeAssignment(false); // <-- Reset checkbox state
        setCreateAssignmentError(null);
        setIsCreatingAssignment(false);
    };

    // Reset form when modal is closed/reopened (optional but good UX)
    useEffect(() => {
        if (!show) {
            // Add a small delay to allow closing animation if modal has one
            const timer = setTimeout(() => {
                 resetForm();
            }, 150); // Adjust delay if needed
             return () => clearTimeout(timer);
        }
    }, [show]);

    const handleCreateAssignment = async (e: FormEvent) => {
        e.preventDefault();
        if (!details.id || !newAssignmentTitle.trim()) {
            setCreateAssignmentError("Title is required."); return;
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
            // Convert local datetime-local string to ISO string or null
            dueDate: newAssignmentDueDate ? new Date(newAssignmentDueDate).toISOString() : null,
            maxPoints: maxPointsNum,
            isCodeAssignment: isCodeAssignment
        };

        try {
            await assignmentService.createAssignment(details.id, payload);
            // Success
            setNewAssignmentTitle('');
            setNewAssignmentInstructions('');
            setNewAssignmentDueDate('');
            setNewAssignmentMaxPoints('');
            setIsCodeAssignment(false);
            await onSuccessCallback(); // Refresh assignment list
            // TODO: Add success toast
        } catch (err: any) {
            setCreateAssignmentError(err.message || 'Failed to create assignment.');
        } finally {
            setIsCreatingAssignment(false);
        }
    };

    return <>
        <Modal isOpen={show} onClose={() => onCancelCallback()} title="Create New Assignment">
            <form onSubmit={handleCreateAssignment}>
                {createAssignmentError && <p className="text-sm text-red-600 mb-2">{createAssignmentError}</p>}
                <div className="mb-3">
                    <label htmlFor="assignmentTitle" className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                    <input id="assignmentTitle" type="text" value={newAssignmentTitle} onChange={(e) => setNewAssignmentTitle(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="assignmentInstructions" className="block text-sm font-medium text-gray-700 mb-1">Instructions (Optional)</label>
                    <textarea id="assignmentInstructions" value={newAssignmentInstructions} onChange={(e) => setNewAssignmentInstructions(e.target.value)} rows={4} className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                    <div>
                        <label htmlFor="assignmentDueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
                        <input id="assignmentDueDate" type="datetime-local" value={newAssignmentDueDate} onChange={(e) => setNewAssignmentDueDate(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="assignmentMaxPoints" className="block text-sm font-medium text-gray-700 mb-1">Max Points (Optional)</label>
                        <input id="assignmentMaxPoints" type="number" value={newAssignmentMaxPoints} onChange={(e) => setNewAssignmentMaxPoints(e.target.value)} min="0" step="1" className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                </div>
                {/* --- NEW: Is Code Assignment Checkbox --- */}
                <div className="mb-4 mt-4 pt-3 border-t">
                    <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="isCodeAssignment"
                                name="isCodeAssignment"
                                type="checkbox"
                                checked={isCodeAssignment}
                                onChange={(e) => setIsCodeAssignment(e.target.checked)}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="isCodeAssignment" className="font-medium text-gray-700">Code Assignment</label>
                            <p className="text-xs text-gray-500">Enable test cases and automated checking features for this assignment.</p>
                        </div>
                    </div>
                </div>
                {/* --- End Checkbox --- */}
                <button type="submit" disabled={isCreatingAssignment} className={`mt-2 w-full px-4 py-1.5 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 ${isCreatingAssignment ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isCreatingAssignment ? 'Creating...' : 'Create Assignment'}
                </button>
            </form>
        </Modal>
    </>
}