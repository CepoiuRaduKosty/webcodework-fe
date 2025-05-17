import { useCallback, useEffect, useState } from "react";
import { TestCaseListDto } from "../types/testcase";
import * as testcaseService from '../services/testcaseService'
import { Editor } from "@monaco-editor/react";

export const TestCaseParallelEditor: React.FC<{ editingTestCase: TestCaseListDto, }> = ({ editingTestCase }) => {
    const [fetchContentError, setFetchContentError] = useState<string | null>(null);
    const [saveInputStatus, setSaveInputStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [saveOutputStatus, setSaveOutputStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [inputEditorContent, setInputEditorContent] = useState('');
    const [outputEditorContent, setOutputEditorContent] = useState('');
    const [isFetchingContent, setIsFetchingContent] = useState(false);

    const loadContents = useCallback(async () => {
        setIsFetchingContent(true);
        setInputEditorContent(''); // Clear previous
        setOutputEditorContent('');

        try {
            const [inputResult, outputResult] = await Promise.allSettled([
                testcaseService.getTestCaseInputContent(editingTestCase.id),
                testcaseService.getTestCaseOutputContent(editingTestCase.id)
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
    }, [])

    useEffect(() => {
        loadContents();
    }, [loadContents]);

    const handleSaveInput = async () => {
        if (!editingTestCase?.id) return;
        setSaveInputStatus('saving');
        try {
            await testcaseService.updateTestCaseInputContent(editingTestCase.id, inputEditorContent);
            setSaveInputStatus('saved');
            setTimeout(() => { setSaveInputStatus('idle'); }, 2000);
        } catch (err: any) { setSaveInputStatus('error'); /* Show error near input save */ }
    };

    const handleSaveOutput = async () => {
        if (!editingTestCase?.id) return;
        setSaveOutputStatus('saving');
        try {
            await testcaseService.updateTestCaseOutputContent(editingTestCase.id, outputEditorContent);
            setSaveOutputStatus('saved');
            setTimeout(() => { setSaveOutputStatus('idle'); }, 2000);
        } catch (err: any) { setSaveOutputStatus('error'); /* Show error near output save */ }
    };

    return <>
        {/* --- Side-by-Side Editor Panel --- */}
        {editingTestCase && (
            <div className="border-t border-gray-300 pt-4 mt-6 w-full">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-700">
                        Editing: {editingTestCase.inputFileName} / {editingTestCase.expectedOutputFileName}
                    </h3>
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
    </>
}