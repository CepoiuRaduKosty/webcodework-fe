import { useState } from "react";
import { AssignmentDetailsDto } from "../types/assignment";
import { TestCaseListDto } from "../types/testcase";
import { format, parseISO } from "date-fns";
import * as testcaseService from '../services/testcaseService'
import { TestCaseParallelEditor } from './TestCaseParallelEditor'

// Format Dates Helper
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try { return format(parseISO(dateString), 'PPp'); } catch { return 'Invalid Date'; }
};

export const TestCaseList: React.FC<{ testCases: TestCaseListDto[], assignmentDetails: AssignmentDetailsDto, requestRefresh: () => Promise<void>, isLoadingTestCases: boolean }> = ({ testCases, assignmentDetails, requestRefresh, isLoadingTestCases }) => {
    const [deletingTestCaseId, setDeletingTestCaseId] = useState<number | null>(null);
    const [showEditorPanelList, setShowEditorPanelList] = useState<boolean[]>(Array(1000).fill(false));

    // Delete Test Case Handler
    const handleDeleteTestCase = async (testCaseId: number) => {
        if (!assignmentDetails.id) return;
        if (!window.confirm("Are you sure you want to delete this test case (Input and Output files)?")) return;

        setDeletingTestCaseId(testCaseId);
        try {
            await testcaseService.deleteTestCase(assignmentDetails.id, testCaseId);
            await requestRefresh(); // Refresh list
            // TODO: Success toast
        } catch (err: any) {
            throw (err.message || 'Failed to delete test case.'); // Show error in main area
        } finally {
            setDeletingTestCaseId(null);
        }
    };

    return <>
        {/* Test Case List */}
        {isLoadingTestCases && <p className="text-gray-500">Loading test cases...</p>}
        {!isLoadingTestCases && testCases.length === 0 && <p className="text-gray-500 italic">No test cases added yet.</p>}
        {!isLoadingTestCases && testCases.length > 0 && (
            <ul className="space-y-3 mb-6">
                {testCases.map((tc, index) => (
                    <li key={tc.id} className={`border rounded p-3 flex justify-between items-center text-sm ${showEditorPanelList[index] === true ? 'flex-col items-start' : ''}`}>
                        <div>
                            <div className="font-medium text-gray-800">
                                <span className="text-indigo-600">{tc.inputFileName}</span>
                                <span className="text-gray-400 mx-1">/</span>
                                <span className="text-indigo-600">{tc.expectedOutputFileName}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Points: <span className="font-semibold">{tc.points}</span> | Added by {tc.addedByUsername} on {formatDate(tc.addedAt)}
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            {showEditorPanelList[index] === false ?
                                <button
                                    onClick={() => {
                                        const newOpenedPanels = [...showEditorPanelList];
                                        newOpenedPanels[index] = true;
                                        setShowEditorPanelList(newOpenedPanels);
                                    }}
                                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                > Edit </button> :
                                <button
                                    onClick={() => {
                                        const newOpenedPanels = [...showEditorPanelList];
                                        newOpenedPanels[index] = false;
                                        setShowEditorPanelList(newOpenedPanels);
                                    }}
                                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                > Close Edit </button>
                            }
                            <button
                                onClick={() => handleDeleteTestCase(tc.id)}
                                disabled={deletingTestCaseId === tc.id}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                            >
                                {deletingTestCaseId === tc.id ? '...' : 'Delete'}
                            </button>
                        </div>
                        {showEditorPanelList[index] === true && <TestCaseParallelEditor editingTestCase={tc} />}
                    </li>
                ))}
            </ul>
        )}


    </>
}