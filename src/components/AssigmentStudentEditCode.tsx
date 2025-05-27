import { useEffect, useState } from "react";
import { SubmissionDto, SubmittedFileDto } from "../types/assignment";
import * as assignmentService from '../services/assignmentService';
import * as evaluationService from '../services/evaluationService';
import { FrontendEvaluateResponseDto } from "../types/evaluation";
import { Editor } from "@monaco-editor/react";
import { AssignmentEvaluationResult } from "./AssignmentEvaluationResult";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { SUPPORTED_LANGUAGES, SOLUTION_FILENAME } from "../config/languages"
import { FaCode, FaExclamationCircle, FaPlay, FaSave, FaSpinner, FaTimes } from "react-icons/fa";

export const AssignmentStudentEditCode: React.FC<{ assignmentId: string | undefined, mySubmission: SubmissionDto | null, callbackRefreshSubmittedFiles: () => Promise<void> }> = ({ assignmentId, mySubmission, callbackRefreshSubmittedFiles }) => {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editorContent, setEditorContent] = useState<string>('');
    const [editingFile, setEditingFile] = useState<SubmittedFileDto | null>(null); // Store file metadata
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [isEditorLoading, setIsEditorLoading] = useState(false);
    const [editorError, setEditorError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [evaluationStatusMessage, setEvaluationStatusMessage] = useState<string | null>(null);

    const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
    const [evaluationResult, setEvaluationResult] = useState<FrontendEvaluateResponseDto | null>(null);
    const [evaluationError, setEvaluationError] = useState<string | null>(null);

    const [hubConnection, setHubConnection] = useState<HubConnection | null>(null);
    const [isHubConnected, setIsHubConnected] = useState<boolean>(false);

    const [selectedLanguage, setSelectedLanguage] = useState<string>(SUPPORTED_LANGUAGES[0].value);

    const solutionFile = mySubmission?.submittedFiles?.find(f => f.fileName.toLowerCase() === SOLUTION_FILENAME);
    const solutionFileExists = !!solutionFile;

    useEffect(() => {
        if (mySubmission?.id) { 
            const newConnection = new HubConnectionBuilder()
                .withUrl(`${import.meta.env.VITE_API_BASE_URL}/evaluationHub`, {
                    accessTokenFactory: () => {
                        const token = localStorage.getItem('authTokenData'); 
                        if (token) {
                            return JSON.parse(token).token;
                        }
                        return "";
                    }
                })
                .withAutomaticReconnect()
                .configureLogging(LogLevel.Information) 
                .build();

            setHubConnection(newConnection);
        }

        return () => {
            hubConnection?.stop().catch(err => console.error("Error stopping SignalR connection: ", err));
        };
    }, [mySubmission?.id]);

    useEffect(() => {
        if (hubConnection) {
            hubConnection.start()
                .then(() => {
                    console.log('SignalR Connected for EvaluationHub.');
                    hubConnection.on("ReceiveEvaluationResult", (result: FrontendEvaluateResponseDto, evaluatedSubmissionId: number) => {
                        console.log("SignalR ReceiveEvaluationResult:", result, "for submission:", evaluatedSubmissionId);
                        if (mySubmission?.id === evaluatedSubmissionId) {
                            setEvaluationResult(result);
                            setIsEvaluating(false);
                            setEvaluationError(null);
                        }
                    });
                })
                .catch(err => {
                    console.error('SignalR Connection Error: ', err);
                    setEvaluationError("Could not connect to the evaluation service for real-time updates.");
                });
            setIsHubConnected(true);
            return () => {
                hubConnection.off("ReceiveEvaluationResult");
            };
        }
    }, [hubConnection, mySubmission?.id]);


    const handleOpenEditor = async () => {
        if (!assignmentId) return;
        setIsEditorLoading(true);
        setEditorError(null);
        setSaveStatus('idle');

        const solutionFile = mySubmission?.submittedFiles?.find(f => f.fileName.toLowerCase() === SOLUTION_FILENAME);

        try {
            let targetFile: SubmittedFileDto | null = solutionFile ?? null;
            let initialContent = '';

            if (solutionFile) {
                console.log("solution exists, fetching content...");
                if (!mySubmission?.id) throw new Error("Submission ID missing");
                initialContent = await assignmentService.getFileContent(mySubmission.id, solutionFile.id);
                setEditingFile(solutionFile);
            } else {
                console.log("solution does not exist, creating virtual file...");
                try {
                    targetFile = await assignmentService.createVirtualFile(assignmentId, 'solution');
                    console.log("Created solution file record:", targetFile);
                    setEditingFile(targetFile);
                    await callbackRefreshSubmittedFiles();
                } catch (createErr: any) {
                    console.error("Failed to create solution:", createErr);
                    setEditorError(`Failed to create 'solution': ${createErr.message}`);
                    setIsEditorLoading(false);
                    return; 
                }
                initialContent = '';
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
        console.log("a intrat")
        if (!mySubmission?.id) {
            setEvaluationError("Submission details are not available. Please save your solution first.");
            return;
        }
        if (!solutionFileExists) {
            setEvaluationError("'solution' file not found in your submission. Please create or upload it first.");
            return;
        }

        setIsEvaluating(true);
        setEvaluationResult(null);
        setEvaluationError(null);

        try {
            const response = await evaluationService.triggerSubmissionEvaluation(mySubmission.id, selectedLanguage);
            console.log("Trigger evaluation response:", response);
        } catch (err: any) {
            setEvaluationError(err.message || 'An unknown error occurred during evaluation.');
        }
    };

    const handleEditorChange = (value: string | undefined) => {
        setEditorContent(value ?? '');
        if (saveStatus === 'saved') setSaveStatus('idle'); 
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
            setTimeout(() => { if (isEditorOpen) setSaveStatus('idle'); }, 2000); 

        } catch (err: any) {
            setEditorError(err.message || 'Failed to save content.');
            setSaveStatus('error');
        }
    };

    const handleCloseEditor = () => {
        setIsEditorOpen(false);
        setEditorError(null); 
        setSaveStatus('idle'); 
    };

    const monacoLanguage = SUPPORTED_LANGUAGES.find(lang => lang.value === selectedLanguage)?.monacoLang || "plaintext";

    return (
        <div className="my-6 p-6 bg-[#F9F7F7] border border-[#DBE2EF] rounded-xl shadow-lg text-[#112D4E]">
            <h3 className="text-xl font-semibold mb-4 text-[#112D4E] flex items-center">
                <FaCode className="mr-3 text-[#3F72AF]" /> Online Editor for '{SOLUTION_FILENAME}'
            </h3>

            {/* Language Dropdown - only show if editor not open and not evaluating */}
            {!isEditorOpen && !isEvaluating && (
                <div className="mb-4">
                    <label htmlFor="languageSelect" className="block text-sm font-medium text-[#112D4E] mb-1">
                        Select Language for Editor & Evaluation:
                    </label>
                    <select
                        id="languageSelect"
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        disabled={isEditorOpen || isEvaluating} // Also disable if evaluating
                        className="mt-1 block w-full sm:w-auto pl-3 pr-10 py-2.5 text-base border-[#DBE2EF] bg-white text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF] sm:text-sm rounded-md shadow-sm"
                    >
                        {SUPPORTED_LANGUAGES.map(lang => (
                            <option key={lang.value} value={lang.value}>
                                {lang.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Editor specific error (e.g. failed to create file), shown when editor is closed */}
            {!isEditorOpen && editorError && (
                <p className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md mb-3 flex items-center">
                    <FaExclamationCircle className="mr-2"/> {editorError}
                </p>
            )}

            {/* Buttons to Open Editor / Evaluate - shown when editor is closed */}
            {!isEditorOpen && (
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <button
                        onClick={handleOpenEditor}
                        disabled={isEditorLoading || isEvaluating}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#F9F7F7] transition-colors duration-150 flex items-center justify-center
                                    ${isEditorLoading || isEvaluating ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#112D4E] hover:bg-opacity-80 focus:ring-[#112D4E]'}`}
                    >
                        {isEditorLoading ? <FaSpinner className="animate-spin mr-2"/> : <FaCode className="mr-2"/>}
                        {isEditorLoading ? 'Loading...' : (solutionFileExists ? `Edit ${SOLUTION_FILENAME}` : `Start ${SOLUTION_FILENAME}`)}
                    </button>

                    {solutionFileExists && !mySubmission?.submittedAt && ( // Condition to show Evaluate button
                        <button
                            onClick={handleEvaluateSolution}
                            disabled={isEvaluating || isEditorOpen || !isHubConnected}
                            title={isEditorOpen ? "Close editor to evaluate" : !isHubConnected ? "Evaluation service not connected" : `Evaluate your ${SOLUTION_FILENAME} as ${selectedLanguage.toUpperCase()}`}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#F9F7F7] transition-colors duration-150 flex items-center justify-center
                                        ${isEvaluating ? 'bg-[#3F72AF] cursor-wait' : 'bg-[#3F72AF] hover:bg-[#3F72AF] focus:ring-[#3F72AF]'}
                                        ${(isEditorOpen || !isHubConnected) ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            {isEvaluating ? <FaSpinner className="animate-spin mr-2"/> : <FaPlay className="mr-2"/>}
                            {isEvaluating ? 'Evaluating...' : `Evaluate (${selectedLanguage.toUpperCase()})`}
                        </button>
                    )}
                </div>
            )}

            {/* Editor UI - shown when editor is open */}
            {isEditorOpen && (
                <div className="my-4 border border-[#DBE2EF] rounded-lg shadow-md overflow-hidden bg-white">
                    <div className="flex justify-between items-center p-2.5 border-b border-[#DBE2EF] bg-[#F9F7F7] text-xs">
                        <span className="font-semibold text-[#112D4E]">
                            Editing: {editingFile?.fileName ?? SOLUTION_FILENAME} (Language: {monacoLanguage.toUpperCase()})
                        </span>
                        <div className="flex items-center space-x-2">
                            {saveStatus === 'saving' && <span className="text-[#3F72AF] animate-pulse font-medium">Saving...</span>}
                            {saveStatus === 'saved' && <span className="text-green-600 font-medium">Saved!</span>}
                            {saveStatus === 'error' && <span className="text-red-600 font-medium">Save Error!</span>}
                            <button
                                onClick={handleSaveContent}
                                disabled={isSaving || saveStatus === 'saving'}
                                className={`px-3 py-1.5 text-xs font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#F9F7F7] transition-colors
                                            ${isSaving || saveStatus === 'saving' ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#3F72AF] hover:bg-[#112D4E] focus:ring-[#3F72AF]'}`}
                            >
                                <FaSave className="inline mr-1"/> {isSaving || saveStatus === 'saving' ? 'Saving...' : 'Save Code'}
                            </button>
                            <button
                                onClick={handleCloseEditor}
                                className="px-3 py-1.5 text-xs font-medium text-[#112D4E] bg-[#DBE2EF] rounded-md hover:bg-opacity-80 hover:text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#F9F7F7] focus:ring-gray-500 transition-colors"
                            >
                                <FaTimes className="inline mr-1"/> Close Editor
                            </button>
                        </div>
                    </div>
                    {/* Error inside editor view (e.g., save error) */}
                    {editorError && saveStatus === 'error' && <p className="p-3 text-sm text-red-700 bg-red-100 border-b border-red-200">{editorError}</p>}
                    
                    {isEditorLoading && <div className="p-10 text-center text-gray-500">Loading editor content...</div>}
                    {!isEditorLoading && (
                        <Editor
                            height="60vh"
                            language={monacoLanguage}
                            theme="vs-dark" // Standard dark theme for Monaco, usually looks good
                            value={editorContent}
                            onChange={handleEditorChange}
                            options={{
                                minimap: { enabled: true },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                wordWrap: "on", // Good for instructions if used here
                                readOnly: isSaving || saveStatus === 'saving', // Prevent editing while saving
                            }}
                        />
                    )}
                </div>
            )}

            {/* Evaluation Status & Results (delegated to AssignmentEvaluationResult) */}
            {(isEvaluating || evaluationStatusMessage || evaluationError || evaluationResult) && (
                 <div className="mt-6 pt-6 border-t border-[#DBE2EF]">
                     {evaluationStatusMessage && !evaluationResult && !evaluationError && (
                        <div className={`flex items-center p-3 rounded-md mb-3 text-sm ${isEvaluating ? 'bg-blue-50 text-[#3F72AF] border border-blue-200' : 'bg-gray-100 text-gray-700'}`}>
                           {isEvaluating && ( <FaSpinner className="animate-spin mr-3 h-5 w-5 "/> )}
                            {evaluationStatusMessage}
                        </div>
                    )}
                    <AssignmentEvaluationResult isEvaluating={isEvaluating && !evaluationResult && !evaluationError} evaluationResult={evaluationResult} evaluationError={evaluationError} />
                </div>
            )}
        </div>
    )
}