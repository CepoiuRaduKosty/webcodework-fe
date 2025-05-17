import { FormEvent, useState } from "react";
import { Modal } from "../Modal"
import { AssignmentDetailsDto } from "../../types/assignment";
import * as testcaseService from '../../services/testcaseService'

export const AddTestCaseModal: React.FC<{assignmentDetails: AssignmentDetailsDto, show: boolean, onSuccessCallback: () => Promise<void>, onCancelCallback: () => void }> = ({ assignmentDetails, show, onCancelCallback, onSuccessCallback }) => {
    const [addTestCaseError, setAddTestCaseError] = useState<string | null>(null);
    const [newTestCaseBaseName, setNewTestCaseBaseName] = useState(''); // e.g., "test1", "edge_case"
    const [isAddingTestCase, setIsAddingTestCase] = useState(false);

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

        setAddTestCaseError(null);
        setIsAddingTestCase(true);

        // Construct filenames (e.g., using .in/.out or .txt)
        const inputFileName = `${newTestCaseBaseName.trim()}.in`;
        const outputFileName = `${newTestCaseBaseName.trim()}.out`;

        try {
            // Call service function adjusted to send names, no files
            await testcaseService.addTestCase(assignmentDetails.id, inputFileName, outputFileName);
            setNewTestCaseBaseName('');
            onSuccessCallback();
        } catch (err: any) {
            setAddTestCaseError(err.message || 'Failed to add test case.');
        } finally {
            setIsAddingTestCase(false);
        }
    };

    return <>
        {/* --- Add Test Case Modal --- */}
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