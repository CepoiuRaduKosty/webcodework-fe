import { useState } from "react";
import { SubmissionDto, SubmittedFileDto } from "../types/assignment";
import * as assignmentService from '../services/assignmentService';
import * as evaluationService from '../services/evaluationService';
import { EvaluationStatus, FrontendEvaluateResponseDto } from "../types/evaluation";
import { Editor } from "@monaco-editor/react";
import { AssignmentEvaluationResult } from "./AssignmentEvaluationResult";

export const AssignmentStudentEditCode: React.FC<{ assignmentId: string | undefined, mySubmission: SubmissionDto | null, callbackRefreshSubmittedFiles: () => Promise<void> }> = ({ assignmentId, mySubmission, callbackRefreshSubmittedFiles }) => {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editorContent, setEditorContent] = useState<string>('');
    const [editingFile, setEditingFile] = useState<SubmittedFileDto | null>(null); // Store file metadata
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [isEditorLoading, setIsEditorLoading] = useState(false);
    const [editorError, setEditorError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
    const [evaluationResult, setEvaluationResult] = useState<FrontendEvaluateResponseDto | null>(null);
    const [evaluationError, setEvaluationError] = useState<string | null>(null);

    const handleOpenEditor = async () => {
        if (!assignmentId) return;
        setIsEditorLoading(true);
        setEditorError(null);
        setSaveStatus('idle');

        // Find if solution.c already exists
        // Ensure mySubmission state is up-to-date before this check runs
        const solutionFile = mySubmission?.submittedFiles?.find(f => f.fileName.toLowerCase() === 'solution.c');

        try {
            let targetFile: SubmittedFileDto | null = solutionFile ?? null;
            let initialContent = '';

            if (solutionFile) {
                // File exists, fetch its content
                console.log("solution.c exists, fetching content...");
                if (!mySubmission?.id) throw new Error("Submission ID missing");
                initialContent = await assignmentService.getFileContent(mySubmission.id, solutionFile.id);
                setEditingFile(solutionFile);
            } else {
                // --- MODIFIED PART ---
                // File doesn't exist, call the new endpoint to create it
                console.log("solution.c does not exist, creating virtual file...");
                try {
                    // Call the new service function
                    targetFile = await assignmentService.createVirtualFile(assignmentId, 'solution.c');
                    console.log("Created solution.c file record:", targetFile);
                    setEditingFile(targetFile); // Set the newly created file as the one being edited
                    // Re-fetch submission data to include the new file in the list
                    await callbackRefreshSubmittedFiles(); // This updates mySubmission state
                } catch (createErr: any) {
                    console.error("Failed to create solution.c:", createErr);
                    setEditorError(`Failed to create 'solution.c': ${createErr.message}`);
                    setIsEditorLoading(false);
                    return; // Stop if file creation fails
                }
                initialContent = ''; // Start with empty content for new file
                // --- END MODIFIED PART ---
            }

            setEditorContent(initialContent);
            setIsEditorOpen(true);

        } catch (err: any) {
            console.error("Error opening editor:", err);
            setEditorError(err.message || 'Could not open editor or load file content.');
        } finally {
            setIsEditorLoading(false);
        }
    };

    const handleEvaluateSolution = async () => {
        if (!mySubmission?.id) {
            setEvaluationError("Submission details are not available. Please save your solution.c first.");
            return;
        }
        if (!solutionFileExists) {
            setEvaluationError("'solution.c' file not found in your submission. Please create or upload it first.");
            return;
        }

        setIsEvaluating(true);
        setEvaluationResult(null);
        setEvaluationError(null);

        try {
            const result = await evaluationService.triggerSubmissionEvaluation(mySubmission.id);
            setEvaluationResult(result);
        } catch (err: any) {
            setEvaluationError(err.message || 'An unknown error occurred during evaluation.');
        } finally {
            setIsEvaluating(false);
        }
    };

    const handleEditorChange = (value: string | undefined) => {
        setEditorContent(value ?? '');
        if (saveStatus === 'saved') setSaveStatus('idle'); // Reset save status on edit
        if (saveStatus === 'error') setSaveStatus('idle');
    };

    const handleSaveContent = async () => {
        if (!mySubmission?.id || !editingFile?.id) {
            setEditorError("Cannot save: Submission or File ID is missing.");
            setSaveStatus('error');
            return;
        }
        setSaveStatus('saving');
        setEditorError(null);

        try {
            await assignmentService.updateFileContent(mySubmission.id, editingFile.id, editorContent);
            setSaveStatus('saved');
            // Optionally re-fetch submission data if file metadata (like size) needs updating in the UI
            // await fetchMySubmissionData();
            setTimeout(() => { if (isEditorOpen) setSaveStatus('idle'); }, 2000); // Reset status after a delay

        } catch (err: any) {
            setEditorError(err.message || 'Failed to save content.');
            setSaveStatus('error');
        }
    };

    const handleCloseEditor = () => {
        // Optional: Confirm closing if there are unsaved changes
        // if (saveStatus === 'idle' && editorContent !== originalContent) {
        //     if (!window.confirm("You have unsaved changes. Are you sure you want to close?")) return;
        // }
        setIsEditorOpen(false);
        setEditorError(null); // Clear errors on close
        setSaveStatus('idle'); // Reset save status
        // Maybe clear editorContent and editingFile? Optional.
        // setEditorContent('');
        // setEditingFile(null);
    };

    const solutionFileExists = mySubmission?.submittedFiles?.some(f => f.fileName.toLowerCase() === 'solution.c');


    return <>
        <div className="my-4 p-3 border rounded bg-blue-50">
            {!isEditorOpen && editorError && <p className="text-sm text-red-600 mb-2">{editorError}</p>}
            {!isEditorOpen && (
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleOpenEditor}
                        disabled={isEditorLoading}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${isEditorLoading ? 'bg-gray-400 cursor-wait' : 'bg-slate-700 hover:bg-slate-800 focus:ring-slate-500'}`}
                    >
                        {isEditorLoading ? 'Loading Editor...' : (solutionFileExists ? 'Edit solution.c' : 'Start solution.c')}
                    </button>
                    {solutionFileExists && !mySubmission?.submittedAt && (
                        <button
                            onClick={handleEvaluateSolution}
                            disabled={isEvaluating || isEditorOpen} // Disable if editor is open to avoid conflicts
                            title={isEditorOpen ? "Close editor to evaluate" : "Evaluate your solution.c against test cases"}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${isEvaluating ? 'bg-orange-300 cursor-wait animate-pulse' : 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-400'} ${isEditorOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isEvaluating ? 'Evaluating...' : 'Evaluate Solution'}
                        </button>
                    )}
                </div>
            )}
            {isEditorOpen && (
                <div className="mt-4 mb-6 border rounded shadow-md overflow-hidden">
                    {/* Editor Header / Status Bar */}
                    <div className="flex justify-between items-center p-2 border-b bg-gray-100 text-xs">
                        <span className="font-semibold text-gray-700">Editing: {editingFile?.fileName ?? 'solution.c'}</span>
                        {/* Save Status & Action Buttons */}
                        <div className="flex items-center space-x-2">
                            {saveStatus === 'saving' && <span className="text-blue-600 animate-pulse">Saving...</span>}
                            {saveStatus === 'saved' && <span className="text-green-600">Saved!</span>}
                            {saveStatus === 'error' && <span className="text-red-600">Save Error!</span>}
                            <button
                                onClick={handleSaveContent}
                                disabled={isSaving || saveStatus === 'saving'}
                                className={`px-3 py-1 text-xs font-medium text-white rounded focus:outline-none ${isSaving || saveStatus === 'saving' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {isSaving || saveStatus === 'saving' ? 'Saving...' : 'Save Code'}
                            </button>
                            <button
                                onClick={handleCloseEditor}
                                className="px-3 py-1 text-xs font-medium text-white bg-gray-500 rounded hover:bg-gray-600 focus:outline-none"
                            >
                                Close Editor
                            </button>
                        </div>
                    </div>
                    {editorError && !isEditorLoading && <p className="p-2 text-sm text-red-600 bg-red-50">{editorError}</p>}
                    {isEditorLoading && <div className="p-4 text-center text-gray-500">Loading editor content...</div>}
                    {!isEditorLoading && (
                        <Editor
                            // Set a suitable height for inline display
                            height="60vh" // Example: 60% of viewport height
                            language="c"
                            theme="vs-dark"
                            value={editorContent}
                            onChange={handleEditorChange}
                            options={{
                                minimap: { enabled: true }, // Maybe enable minimap now?
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                            }}
                        />
                    )}
                </div>
            )}
            {(isEvaluating || evaluationError || evaluationResult) && (
                <AssignmentEvaluationResult isEvaluating={isEvaluating} evaluationResult={evaluationResult} evaluationError={evaluationError} />
            )}
        </div>
    </>
}