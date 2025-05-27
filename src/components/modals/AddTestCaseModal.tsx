// src/components/modals/AddTestCaseModal.tsx
import React, { FormEvent, useEffect, useState } from "react"; // Added React import
import { Modal } from "../Modal"; // Assuming Modal component path
import { AssignmentDetailsDto } from "../../types/assignment";
import * as testcaseService from '../../services/testcaseService'; // Assuming correct path
import { FaPlus, FaSpinner, FaExclamationCircle } from "react-icons/fa"; // For button icon

export const AddTestCaseModal: React.FC<{
    assignmentDetails: AssignmentDetailsDto,
    show: boolean,
    onSuccessCallback: () => Promise<void>,
    onCancelCallback: () => void
}> = ({ assignmentDetails, show, onCancelCallback, onSuccessCallback }) => {
    const [addTestCaseError, setAddTestCaseError] = useState<string | null>(null);
    const [newTestCaseBaseName, setNewTestCaseBaseName] = useState('');
    const [newTestCasePoints, setNewTestCasePoints] = useState<string>('10');
    const [isAddingTestCase, setIsAddingTestCase] = useState(false);
    const [newTestCaseMaxTimeMs, setNewTestCaseMaxTimeMs] = useState<string>('2000');
    const [newTestCaseMaxRamMB, setNewTestCaseMaxRamMB] = useState<string>('128');

    const resetForm = () => {
        setNewTestCaseBaseName('');
        setNewTestCasePoints('10');
        setNewTestCaseMaxTimeMs('2000');
        setNewTestCaseMaxRamMB('128');
        setAddTestCaseError(null);
        // setIsAddingTestCase(false); // Keep this to avoid UI flicker if modal closes fast
    };

    useEffect(() => {
        if (!show) {
            const timer = setTimeout(() => {
                resetForm();
            }, 150); // Delay for modal close animation
            return () => clearTimeout(timer);
        } else {
             // Clear previous error when modal is shown
            setAddTestCaseError(null);
        }
    }, [show]);

    const handleAddTestCase = async (e: FormEvent) => {
        e.preventDefault();
        setAddTestCaseError(null); // Clear previous errors on new attempt

        if (!assignmentDetails?.id || !newTestCaseBaseName.trim()) {
            setAddTestCaseError("Classroom context missing or Test case base name is required."); return;
        }
        if (!/^[a-zA-Z0-9_\-]+$/.test(newTestCaseBaseName.trim())) {
            setAddTestCaseError("Base name can only contain letters, numbers, underscores, and hyphens."); return;
        }

        const pointsNum = parseInt(newTestCasePoints, 10);
        if (isNaN(pointsNum) || pointsNum < 0 || pointsNum > 1000) {
            setAddTestCaseError("Points must be a valid number between 0 and 1000."); return;
        }

        const timeMsNum = parseInt(newTestCaseMaxTimeMs, 10);
        if (isNaN(timeMsNum) || timeMsNum < 100 || timeMsNum > 10000) {
            setAddTestCaseError("Max execution time must be between 100ms and 10000ms."); return;
        }

        const ramMbNum = parseInt(newTestCaseMaxRamMB, 10);
        if (isNaN(ramMbNum) || ramMbNum < 32 || ramMbNum > 512) {
            setAddTestCaseError("Max RAM limit must be between 32MB and 512MB."); return;
        }

        setIsAddingTestCase(true);
        const inputFileName = `${newTestCaseBaseName.trim()}.in`;
        const outputFileName = `${newTestCaseBaseName.trim()}.out`;

        try {
            await testcaseService.addTestCase(
                assignmentDetails.id,
                inputFileName,
                outputFileName,
                pointsNum,
                timeMsNum,
                ramMbNum
            );
            // resetForm(); // Handled by useEffect on show=false
            await onSuccessCallback(); // This should eventually set 'show' to false
        } catch (err: any) {
            setAddTestCaseError(err.message || 'Failed to add test case.');
        } finally {
            setIsAddingTestCase(false);
        }
    };

    return (
        <Modal isOpen={show} onClose={onCancelCallback} title="Add New Test Case">
            <form onSubmit={handleAddTestCase} className="space-y-5 text-[#112D4E]">
                {addTestCaseError && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md flex items-center">
                        <FaExclamationCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        {addTestCaseError}
                    </div>
                )}
                <div>
                    <label htmlFor="testCaseBaseNameModal" className="block text-sm font-medium mb-1">
                        Test Case Base Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="testCaseBaseNameModal" // Unique ID for modal
                        type="text"
                        value={newTestCaseBaseName}
                        onChange={(e) => setNewTestCaseBaseName(e.target.value)}
                        className="w-full px-3 py-2.5 border border-[#DBE2EF] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-transparent placeholder-gray-400"
                        placeholder="e.g., test1, edge_case"
                        required
                    />
                    <p className="text-xs text-slate-500 mt-1">Generates 'basename.in' & 'basename.out'. Edit content later.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                        <label htmlFor="testCasePointsModal" className="block text-sm font-medium mb-1">
                            Points <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="testCasePointsModal"
                            type="number"
                            value={newTestCasePoints}
                            onChange={(e) => setNewTestCasePoints(e.target.value)}
                            min="0" max="1000" step="1"
                            className="w-full px-3 py-2.5 border border-[#DBE2EF] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-transparent placeholder-gray-400"
                            placeholder="e.g., 10"
                            required
                        />
                    </div>
                    <div className="sm:col-span-1">
                        <label htmlFor="testCaseMaxTimeMsModal" className="block text-sm font-medium mb-1">
                            Time (ms) <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="testCaseMaxTimeMsModal" type="number" value={newTestCaseMaxTimeMs}
                            onChange={(e) => setNewTestCaseMaxTimeMs(e.target.value)}
                            min="100" max="10000" step="100"
                            className="w-full px-3 py-2.5 border border-[#DBE2EF] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-transparent placeholder-gray-400"
                            placeholder="e.g., 2000" required
                        />
                    </div>
                    <div className="sm:col-span-1">
                        <label htmlFor="testCaseMaxRamMBModal" className="block text-sm font-medium mb-1">
                            RAM (MB) <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="testCaseMaxRamMBModal" type="number" value={newTestCaseMaxRamMB}
                            onChange={(e) => setNewTestCaseMaxRamMB(e.target.value)}
                            min="32" max="512" step="1"
                            className="w-full px-3 py-2.5 border border-[#DBE2EF] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-transparent placeholder-gray-400"
                            placeholder="e.g., 128" required
                        />
                    </div>
                </div>

                <div className="pt-5 flex justify-end space-x-3 border-t border-[#DBE2EF] mt-6">
                    <button
                        type="button"
                        onClick={onCancelCallback}
                        className="px-4 py-2 text-sm font-medium text-[#112D4E] bg-[#DBE2EF] rounded-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3F72AF] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isAddingTestCase}
                        className={`flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#3F72AF] rounded-lg hover:bg-[#112D4E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3F72AF] disabled:opacity-60 disabled:cursor-not-allowed transition-colors
                            ${isAddingTestCase ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        {isAddingTestCase && <FaSpinner className="animate-spin mr-2" />}
                        {isAddingTestCase ? 'Adding...' : <><FaPlus className="mr-2" /> Add Test Case</>}
                    </button>
                </div>
            </form>
        </Modal>
    );
};