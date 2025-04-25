import { FormEvent, useCallback, useEffect, useState } from "react";
import { AssignmentDetailsDto, TestCaseListDto } from "../types/assignment";
import * as assignmentService from '../services/assignmentService';
import { format, parseISO } from "date-fns";
import { Editor } from "@monaco-editor/react";
import { Modal } from "./Modal";

// Format Dates Helper
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try { return format(parseISO(dateString), 'PPp'); } catch { return 'Invalid Date'; }
};


export const TestCasesSection: React.FC<{ assignmentDetails: AssignmentDetailsDto }> = ({ assignmentDetails }) => {

    const [testCases, setTestCases] = useState<TestCaseListDto[]>([]); // Test cases list
    const [isLoadingTestCases, setIsLoadingTestCases] = useState(true);
    // Add Test Case State
    const [showAddTestCaseModal, setShowAddTestCaseModal] = useState(false);
    const [newTestCaseBaseName, setNewTestCaseBaseName] = useState(''); // e.g., "test1", "edge_case"
    const [isAddingTestCase, setIsAddingTestCase] = useState(false);
    const [addTestCaseError, setAddTestCaseError] = useState<string | null>(null);

    // Delete Test Case State
    const [deletingTestCaseId, setDeletingTestCaseId] = useState<number | null>(null);

    // Edit Test Case State
    const [showEditorPanel, setShowEditorPanel] = useState(false);
    const [editingTestCase, setEditingTestCase] = useState<TestCaseListDto | null>(null);
    const [inputEditorContent, setInputEditorContent] = useState('');
    const [outputEditorContent, setOutputEditorContent] = useState('');
    const [isFetchingContent, setIsFetchingContent] = useState(false);
    const [fetchContentError, setFetchContentError] = useState<string | null>(null);
    const [saveInputStatus, setSaveInputStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [saveOutputStatus, setSaveOutputStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    const [error, setError] = useState<string | null>(null);

    const fetchTestCasesOverview = useCallback(async () => {
        if (!assignmentDetails!.id) return;
        // Only fetch test cases if it's a code assignment
        if (assignmentDetails && !assignmentDetails.isCodeAssignment) {
            setIsLoadingTestCases(false);
            setTestCases([]); // Ensure it's empty if not a code assignment
            return;
        }
        setIsLoadingTestCases(true);
        // Clear main error when refetching test cases specifically
        // setError(null);
        try {
            const data = await assignmentService.getTestCases(assignmentDetails.id);
            setTestCases(data);
        } catch (err: any) {
            console.error("Test case fetch error:", err);
            setError(err.message || `Failed to load test cases for assignment ${assignmentDetails.id}.`);
        } finally {
            setIsLoadingTestCases(false);
        }
    }, [assignmentDetails]); // Depend on assignmentDetails to check isCodeAssignment

    useEffect(() => {
        fetchTestCasesOverview();
    }, [fetchTestCasesOverview]);

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
            await assignmentService.addTestCase(assignmentDetails.id, inputFileName, outputFileName);
            setShowAddTestCaseModal(false);
            setNewTestCaseBaseName('');
            await fetchTestCasesOverview(); // Refresh list
            // TODO: Success toast
        } catch (err: any) {
            setAddTestCaseError(err.message || 'Failed to add test case.');
        } finally {
            setIsAddingTestCase(false);
        }
    };

    // Delete Test Case Handler
    const handleDeleteTestCase = async (testCaseId: number) => {
        if (!assignmentDetails.id) return;
        if (!window.confirm("Are you sure you want to delete this test case (Input and Output files)?")) return;

        setDeletingTestCaseId(testCaseId);
        setError(null); // Clear main error
        try {
            await assignmentService.deleteTestCase(assignmentDetails.id, testCaseId);
            await fetchTestCasesOverview(); // Refresh list
            // TODO: Success toast
        } catch (err: any) {
            setError(err.message || 'Failed to delete test case.'); // Show error in main area
        } finally {
            setDeletingTestCaseId(null);
        }
    };

    // Edit Test Case Handlers
    const handleOpenTestCaseEditor = async (testCase: TestCaseListDto) => {
        if (isFetchingContent || showEditorPanel) return; // Prevent multiple opens

        setShowEditorPanel(true);
        setEditingTestCase(testCase);
        setIsFetchingContent(true);
        setFetchContentError(null);
        setInputEditorContent(''); // Clear previous
        setOutputEditorContent('');
        setSaveInputStatus('idle');
        setSaveOutputStatus('idle');

        try {
            const [inputResult, outputResult] = await Promise.allSettled([
                assignmentService.getTestCaseInputContent(testCase.id),
                assignmentService.getTestCaseOutputContent(testCase.id)
            ]);

            if (inputResult.status === 'fulfilled') setInputEditorContent(inputResult.value);
            else throw new Error(`Failed to load input: ${inputResult.reason?.message || 'Unknown error'}`);

            if (outputResult.status === 'fulfilled') setOutputEditorContent(outputResult.value);
            else throw new Error(`Failed to load output: ${outputResult.reason?.message || 'Unknown error'}`);

        } catch (err: any) {
            setFetchContentError(err.message || 'Failed to load test case content.');
            // Keep panel open to show error
        } finally {
            setIsFetchingContent(false);
        }
    };

    const handleCloseTestCaseEditor = () => {
        // TODO: Check for unsaved changes
        setShowEditorPanel(false);
        setEditingTestCase(null);
        setInputEditorContent('');
        setOutputEditorContent('');
        setFetchContentError(null);
        setSaveInputStatus('idle');
        setSaveOutputStatus('idle');
    };

    const handleSaveInput = async () => {
        if (!editingTestCase?.id) return;
        setSaveInputStatus('saving');
        try {
            await assignmentService.updateTestCaseInputContent(editingTestCase.id, inputEditorContent);
            setSaveInputStatus('saved');
            setTimeout(() => { if (showEditorPanel) setSaveInputStatus('idle'); }, 2000);
        } catch (err: any) { setSaveInputStatus('error'); /* Show error near input save */ }
    };

    const handleSaveOutput = async () => {
        if (!editingTestCase?.id) return;
        setSaveOutputStatus('saving');
        try {
            await assignmentService.updateTestCaseOutputContent(editingTestCase.id, outputEditorContent);
            setSaveOutputStatus('saved');
            setTimeout(() => { if (showEditorPanel) setSaveOutputStatus('idle'); }, 2000);
        } catch (err: any) { setSaveOutputStatus('error'); /* Show error near output save */ }
    };



    return (<>
        {
            assignmentDetails.isCodeAssignment && (
                <div className="bg-white p-4 md:p-6 shadow rounded-lg mb-6">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b">
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-700">Test Cases</h2>
                        <button
                            onClick={() => { setAddTestCaseError(null); setNewTestCaseBaseName(''); setShowAddTestCaseModal(true); }}
                            className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 text-sm"
                            title="Add new test case"
                        >
                            + Add Test Case
                        </button>
                    </div>

                    {/* Test Case List */}
                    {isLoadingTestCases && <p className="text-gray-500">Loading test cases...</p>}
                    {!isLoadingTestCases && testCases.length === 0 && <p className="text-gray-500 italic">No test cases added yet.</p>}
                    {!isLoadingTestCases && testCases.length > 0 && (
                        <ul className="space-y-3 mb-6">
                            {testCases.map(tc => (
                                <li key={tc.id} className="border rounded p-3 flex justify-between items-center text-sm">
                                    <div>
                                        <span className="font-medium text-gray-800">{tc.inputFileName}</span>
                                        <span className="text-gray-500 mx-1">/</span>
                                        <span className="font-medium text-gray-800">{tc.expectedOutputFileName}</span>
                                        <p className="text-xs text-gray-500 mt-1">Added by {tc.addedByUsername} on {formatDate(tc.addedAt)}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleOpenTestCaseEditor(tc)}
                                            disabled={showEditorPanel && editingTestCase?.id === tc.id} // Disable if already editing this one
                                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTestCase(tc.id)}
                                            disabled={deletingTestCaseId === tc.id}
                                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {deletingTestCaseId === tc.id ? '...' : 'Delete'}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* --- Side-by-Side Editor Panel --- */}
                    {showEditorPanel && editingTestCase && (
                        <div className="border-t border-gray-300 pt-4 mt-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold text-gray-700">
                                    Editing: {editingTestCase.inputFileName} / {editingTestCase.expectedOutputFileName}
                                </h3>
                                <button onClick={handleCloseTestCaseEditor} className="text-sm text-gray-600 hover:text-gray-900">&times; Close Editor</button>
                            </div>

                            {isFetchingContent && <p className="text-center text-gray-500 my-4">Loading content...</p>}
                            {fetchContentError && <p className="text-center text-red-600 my-4 bg-red-50 p-2 rounded">Error loading content: {fetchContentError}</p>}

                            {!isFetchingContent && !fetchContentError && (
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Input Editor */}
                                    <div className="w-full md:w-1/2 border rounded overflow-hidden shadow-sm">
                                        <div className="flex justify-between items-center p-2 bg-gray-100 border-b text-xs">
                                            <span className="font-semibold">Input ({editingTestCase.inputFileName})</span>
                                            <div className="flex items-center space-x-2">
                                                {saveInputStatus === 'saving' && <span className="text-blue-600 animate-pulse">Saving...</span>}
                                                {saveInputStatus === 'saved' && <span className="text-green-600">Saved!</span>}
                                                {saveInputStatus === 'error' && <span className="text-red-600">Error!</span>}
                                                <button onClick={handleSaveInput} disabled={saveInputStatus === 'saving'} className={`px-2 py-0.5 text-xs font-medium text-white rounded ${saveInputStatus === 'saving' ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>Save Input</button>
                                            </div>
                                        </div>
                                        <Editor height="50vh" language="plaintext" theme="vs-dark" value={inputEditorContent} onChange={(v) => { setInputEditorContent(v ?? ''); if (saveInputStatus !== 'idle') setSaveInputStatus('idle'); }} options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false, automaticLayout: true }} />
                                    </div>

                                    {/* Output Editor */}
                                    <div className="w-full md:w-1/2 border rounded overflow-hidden shadow-sm">
                                        <div className="flex justify-between items-center p-2 bg-gray-100 border-b text-xs">
                                            <span className="font-semibold">Expected Output ({editingTestCase.expectedOutputFileName})</span>
                                            <div className="flex items-center space-x-2">
                                                {saveOutputStatus === 'saving' && <span className="text-blue-600 animate-pulse">Saving...</span>}
                                                {saveOutputStatus === 'saved' && <span className="text-green-600">Saved!</span>}
                                                {saveOutputStatus === 'error' && <span className="text-red-600">Error!</span>}
                                                <button onClick={handleSaveOutput} disabled={saveOutputStatus === 'saving'} className={`px-2 py-0.5 text-xs font-medium text-white rounded ${saveOutputStatus === 'saving' ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>Save Output</button>
                                            </div>
                                        </div>
                                        <Editor height="50vh" language="plaintext" theme="vs-dark" value={outputEditorContent} onChange={(v) => { setOutputEditorContent(v ?? ''); if (saveOutputStatus !== 'idle') setSaveOutputStatus('idle'); }} options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false, automaticLayout: true }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {/* --- End Editor Panel --- */}

                </div> // End Test Case Section Div
            )
        }

        {/* --- Add Test Case Modal --- */}
        <Modal isOpen={showAddTestCaseModal} onClose={() => setShowAddTestCaseModal(false)} title="Add New Test Case">
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
    )
}