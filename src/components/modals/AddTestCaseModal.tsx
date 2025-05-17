import { FormEvent, useEffect, useState } from "react";
import { Modal } from "../Modal"
import { AssignmentDetailsDto } from "../../types/assignment";
import * as testcaseService from '../../services/testcaseService'

export const AddTestCaseModal: React.FC<{assignmentDetails: AssignmentDetailsDto, show: boolean, onSuccessCallback: () => Promise<void>, onCancelCallback: () => void }> = ({ assignmentDetails, show, onCancelCallback, onSuccessCallback }) => {
    const [addTestCaseError, setAddTestCaseError] = useState<string | null>(null);
    const [newTestCaseBaseName, setNewTestCaseBaseName] = useState('');
    const [newTestCasePoints, setNewTestCasePoints] = useState<string>('10');
    const [isAddingTestCase, setIsAddingTestCase] = useState(false);
    const [newTestCaseMaxTimeMs, setNewTestCaseMaxTimeMs] = useState<string>('2000'); // Default 2s
    const [newTestCaseMaxRamMB, setNewTestCaseMaxRamMB] = useState<string>('128');    // Default 128MB

    const resetForm = () => {
        setNewTestCaseBaseName('');
        setNewTestCasePoints('10');
        setAddTestCaseError(null);
        setIsAddingTestCase(false);
        setNewTestCaseMaxTimeMs('2000'); 
        setNewTestCaseMaxRamMB('128');
    };

    useEffect(() => {
        if (!show) {
            // Add a small delay if your modal has closing animations
            const timer = setTimeout(() => {
                resetForm();
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [show]);

    // Add Test Case Handler
    const handleAddTestCase = async (e: FormEvent) => {
        e.preventDefault();
        if (!assignmentDetails.id || !newTestCaseBaseName.trim()) {
            setAddTestCaseError("Test case base name is required."); return;
        }
        // Basic validation for filename chars (optional)
        if (!/^[a-zA-Z0-9_\-]+$/.test(newTestCaseBaseName.trim())) {
            setAddTestCaseError("Base name can only contain letters, numbers, underscores, and hyphens."); return;
        }

        const pointsNum = parseInt(newTestCasePoints, 10);
        if (isNaN(pointsNum) || pointsNum < 0 || pointsNum > 1000) { // Example validation
            setAddTestCaseError("Points must be a valid number between 0 and 1000."); return;
        }

        const timeMsNum = parseInt(newTestCaseMaxTimeMs, 10);
        if (isNaN(timeMsNum) || timeMsNum < 100 || timeMsNum > 10000) { // Backend validation: 100ms to 10s
            setAddTestCaseError("Max execution time must be between 100ms and 10000ms."); return;
        }

        const ramMbNum = parseInt(newTestCaseMaxRamMB, 10);
        if (isNaN(ramMbNum) || ramMbNum < 32 || ramMbNum > 512) { // Backend validation: 32MB to 512MB
            setAddTestCaseError("Max RAM limit must be between 32MB and 512MB."); return;
        }

        setAddTestCaseError(null);
        setIsAddingTestCase(true);

        // Construct filenames (e.g., using .in/.out or .txt)
        const inputFileName = `${newTestCaseBaseName.trim()}.in`;
        const outputFileName = `${newTestCaseBaseName.trim()}.out`;

        try {
            // Call service function adjusted to send names, no files
            await testcaseService.addTestCase(assignmentDetails.id, inputFileName, outputFileName, pointsNum, timeMsNum, ramMbNum);
            setNewTestCaseBaseName('');
            onSuccessCallback();
        } catch (err: any) {
            setAddTestCaseError(err.message || 'Failed to add test case.');
        } finally {
            setIsAddingTestCase(false);
        }
    };

    return <>
        <Modal isOpen={show} onClose={() => onCancelCallback()} title="Add New Test Case">
            <form onSubmit={handleAddTestCase}>
                {addTestCaseError && <p className="text-sm text-red-600 mb-2">{addTestCaseError}</p>}
                <div className="mb-3">
                    <label htmlFor="testCaseBaseName" className="block text-sm font-medium text-gray-700 mb-1">Test Case Base Name <span className="text-red-500">*</span></label>
                    <input
                        id="testCaseBaseName"
                        type="text"
                        value={newTestCaseBaseName}
                        onChange={(e) => setNewTestCaseBaseName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="e.g., test1, edge_case (will create .in/.out)"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">Creates empty 'basename.in' and 'basename.out' files. You can edit them after creation.</p>
                </div>
                <div className="mb-3">
                    <label htmlFor="testCasePoints" className="block text-sm font-medium text-gray-700 mb-1">
                        Points <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="testCasePoints"
                        type="number"
                        value={newTestCasePoints}
                        onChange={(e) => setNewTestCasePoints(e.target.value)}
                        min="0"
                        step="1"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="e.g., 10"
                        required
                    />
                </div>
                <div>
                        <label htmlFor="testCaseMaxTimeMs" className="block text-sm font-medium text-gray-700 mb-1">
                            Max Execution Time (ms) <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="testCaseMaxTimeMs" type="number" value={newTestCaseMaxTimeMs}
                            onChange={(e) => setNewTestCaseMaxTimeMs(e.target.value)}
                            min="100" max="10000" step="100"
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="e.g., 2000" required
                        />
                    </div>

                    <div>
                        <label htmlFor="testCaseMaxRamMB" className="block text-sm font-medium text-gray-700 mb-1">
                            Max RAM (MB) <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="testCaseMaxRamMB" type="number" value={newTestCaseMaxRamMB}
                            onChange={(e) => setNewTestCaseMaxRamMB(e.target.value)}
                            min="32" max="512" step="1"
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="e.g., 128" required
                        />
                    </div>
                <button
                    type="submit"
                    disabled={isAddingTestCase}
                    className={`mt-2 w-full px-4 py-1.5 text-sm text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 ${isAddingTestCase ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isAddingTestCase ? 'Adding...' : 'Add Test Case'}
                </button>
            </form>
        </Modal>
    </>
}