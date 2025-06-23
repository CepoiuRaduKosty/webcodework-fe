
import React, { useCallback, useEffect, useState } from "react"; 
import { TestCaseListDto } from "../types/testcase";
import * as testcaseService from '../services/testcaseService';
import { Editor } from "@monaco-editor/react";
import { FaSave, FaSpinner, FaExclamationCircle } from 'react-icons/fa'; 

export const TestCaseParallelEditor: React.FC<{
    editingTestCase: TestCaseListDto;
    isEditable: boolean;
}> = ({ editingTestCase, isEditable }) => {
    const [fetchContentError, setFetchContentError] = useState<string | null>(null);
    const [saveInputStatus, setSaveInputStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [saveOutputStatus, setSaveOutputStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [inputEditorContent, setInputEditorContent] = useState('');
    const [outputEditorContent, setOutputEditorContent] = useState('');
    const [isFetchingContent, setIsFetchingContent] = useState(false);

    const loadContents = useCallback(async () => {
        if (!editingTestCase?.id) return; 

        setIsFetchingContent(true);
        setFetchContentError(null); 
        setInputEditorContent('');
        setOutputEditorContent('');
        if (isEditable) {
            setSaveInputStatus('idle');
            setSaveOutputStatus('idle');
        }

        try {
            const [inputResult, outputResult] = await Promise.allSettled([
                testcaseService.getTestCaseInputContent(editingTestCase.id),
                testcaseService.getTestCaseOutputContent(editingTestCase.id)
            ]);

            let errors: string[] = [];

            if (inputResult.status === 'fulfilled') {
                setInputEditorContent(inputResult.value);
            } else {
                const reason = inputResult.reason as any;
                errors.push(`Failed to load input: ${reason?.message || 'Unknown error'}`);
                setInputEditorContent("Error loading content."); 
            }

            if (outputResult.status === 'fulfilled') {
                setOutputEditorContent(outputResult.value);
            } else {
                const reason = outputResult.reason as any;
                errors.push(`Failed to load output: ${reason?.message || 'Unknown error'}`);
                setOutputEditorContent("Error loading content."); 
            }

            if (errors.length > 0) {
                setFetchContentError(errors.join('; '));
            }

        } catch (err: any) { 
            setFetchContentError(err.message || 'Failed to load test case content.');
        } finally {
            setIsFetchingContent(false);
        }
    }, [editingTestCase?.id, isEditable]); 

    useEffect(() => {
        loadContents();
    }, [loadContents]); 

    const handleSaveInput = async () => {
        if (!editingTestCase?.id) return;
        setSaveInputStatus('saving');
        try {
            await testcaseService.updateTestCaseInputContent(editingTestCase.id, inputEditorContent);
            setSaveInputStatus('saved');
            setTimeout(() => { setSaveInputStatus('idle'); }, 2500);
        } catch (err: any) {
            setSaveInputStatus('error');
            
            setFetchContentError(`Input Save Error: ${err.message || 'Failed to save'}`);
        }
    };

    const handleSaveOutput = async () => {
        if (!editingTestCase?.id) return;
        setSaveOutputStatus('saving');
        try {
            await testcaseService.updateTestCaseOutputContent(editingTestCase.id, outputEditorContent);
            setSaveOutputStatus('saved');
            setTimeout(() => { setSaveOutputStatus('idle'); }, 2500);
        } catch (err: any) {
            setSaveOutputStatus('error');
            setFetchContentError(`Output Save Error: ${err.message || 'Failed to save'}`);
        }
    };

    const renderSaveStatus = (status: 'idle' | 'saving' | 'saved' | 'error') => {
        if (status === 'saving') return <span className="text-[#3F72AF] animate-pulse font-medium">Saving...</span>;
        if (status === 'saved') return <span className="text-green-600 font-medium">Saved!</span>;
        if (status === 'error') return <span className="text-red-600 font-medium">Save Error!</span>;
        return null; 
    };

    return (

        <div className="w-full text-[#112D4E]">
            {isFetchingContent && (
                <div className="flex items-center justify-center py-10 text-[#3F72AF]">
                    <FaSpinner className="animate-spin h-6 w-6 mr-3" />
                    Loading editor content...
                </div>
            )}
            {fetchContentError && !isFetchingContent && (
                <div className="p-3 my-2 bg-red-100 text-red-700 border border-red-200 rounded-md text-sm text-center flex items-center justify-center">
                    <FaExclamationCircle className="h-5 w-5 mr-2" />
                    {fetchContentError}
                </div>
            )}

            {!isFetchingContent && !fetchContentError && (
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    {/* Input Editor Panel */}
                    <div className="w-full md:w-1/2 border border-[#DBE2EF] rounded-lg shadow-md overflow-hidden bg-white flex flex-col">
                        <div className="flex justify-between items-center p-2.5 border-b border-[#DBE2EF] bg-[#F9F7F7]">
                            <span className="text-sm font-semibold text-[#112D4E]">Input File ({editingTestCase.inputFileName})</span>
                            {isEditable && (
                                <div className="flex items-center space-x-2 text-xs">
                                    {renderSaveStatus(saveInputStatus)}
                                    <button
                                        onClick={handleSaveInput}
                                        disabled={saveInputStatus === 'saving' || saveInputStatus === 'saved'}
                                        className={`px-3 py-1.5 text-xs font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#F9F7F7] transition-colors
                                        ${saveInputStatus === 'saving' || saveInputStatus === 'saved' ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#3F72AF] hover:bg-[#112D4E] focus:ring-[#3F72AF]'}`}
                                    >
                                        <FaSave className="inline mr-1.5" /> {saveInputStatus === 'saving' ? 'Saving...' : 'Save Input'}
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex-grow">
                            <Editor
                                key={`${editingTestCase.id}-output`}
                                height="45vh" 
                                language="plaintext" 
                                theme="vs-dark"
                                value={`${inputEditorContent}`}
                                onChange={(v) => { setInputEditorContent(v ?? ''); if (saveInputStatus !== 'idle') setSaveInputStatus('idle'); }}
                                options={{ readOnly: !isEditable, minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false, automaticLayout: true, wordWrap: 'on' }}
                            />
                        </div>
                    </div>

                    {/* Output Editor Panel */}
                    <div className="w-full md:w-1/2 border border-[#DBE2EF] rounded-lg shadow-md overflow-hidden bg-white flex flex-col">
                        <div className="flex justify-between items-center p-2.5 border-b border-[#DBE2EF] bg-[#F9F7F7]">
                            <span className="text-sm font-semibold text-[#112D4E]">Expected Output ({editingTestCase.expectedOutputFileName})</span>
                            {isEditable && (
                                <div className="flex items-center space-x-2 text-xs">
                                    {renderSaveStatus(saveOutputStatus)}
                                    <button
                                        onClick={handleSaveOutput}
                                        disabled={saveOutputStatus === 'saving' || saveOutputStatus === 'saved'}
                                        className={`px-3 py-1.5 text-xs font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#F9F7F7] transition-colors
                                        ${saveOutputStatus === 'saving' || saveOutputStatus === 'saved' ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#3F72AF] hover:bg-[#112D4E] focus:ring-[#3F72AF]'}`}
                                    >
                                        <FaSave className="inline mr-1.5" /> {saveOutputStatus === 'saving' ? 'Saving...' : 'Save Output'}
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex-grow">
                            <Editor
                                key={`${editingTestCase.id}-input`}
                                height="45vh" 
                                language="plaintext"
                                theme="vs-dark"
                                value={`${outputEditorContent}`}
                                onChange={(v) => { setOutputEditorContent(v ?? ''); if (saveOutputStatus !== 'idle') setSaveOutputStatus('idle'); }}
                                options={{ readOnly: !isEditable, minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false, automaticLayout: true, wordWrap: 'on' }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};