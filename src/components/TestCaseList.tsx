// src/components/TestCaseList.tsx
import React, { useState } from "react"; // Added React
import { AssignmentDetailsDto } from "../types/assignment";
import { TestCaseListDto } from "../types/testcase";
import { format, parseISO, isValid } from "date-fns";
import * as testcaseService from '../services/testcaseService';
import { TestCaseParallelEditor } from './TestCaseParallelEditor';
import { FaEdit, FaTrashAlt, FaEye, FaEyeSlash, FaSpinner, FaLock, FaUnlock, FaTimesCircle } from 'react-icons/fa';

// Format Dates Helper
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    const date = parseISO(dateString);
    if (!isValid(date)) return "Invalid Date";
    try { return format(date, 'MMM d, yyyy'); } catch { return 'Invalid Date'; } // Simpler date format
};

export const TestCaseList: React.FC<{
    testCases: TestCaseListDto[],
    assignmentDetails: AssignmentDetailsDto,
    requestRefresh: () => Promise<void>,
    isLoadingTestCases: boolean,
    isEditable: boolean
}> = ({ testCases, assignmentDetails, requestRefresh, isLoadingTestCases, isEditable }) => {
    const [deletingTestCaseId, setDeletingTestCaseId] = useState<number | null>(null);
    const [updatingPrivacyId, setUpdatingPrivacyId] = useState<number | null>(null);
    const [listError, setListError] = useState<string | null>(null);
    const [openEditors, setOpenEditors] = useState<Record<number, boolean>>({});

    const handleDeleteTestCase = async (testCaseId: number) => {
        if (!isEditable || !assignmentDetails.id) return;
        if (!window.confirm("Are you sure you want to delete this test case (Input and Output files)?")) return;

        setDeletingTestCaseId(testCaseId);
        setListError(null);
        try {
            await testcaseService.deleteTestCase(assignmentDetails.id, testCaseId);
            await requestRefresh();
            // TODO: Success toast
        } catch (err: any) {
            setListError(err.message || 'Failed to delete test case.');
            // alert(`Error deleting test case: ${err.message || 'Unknown error'}`);
        } finally {
            setDeletingTestCaseId(null);
        }
    };

    const handleTogglePrivacy = async (tc: TestCaseListDto) => {
        if (!isEditable) return;
        setUpdatingPrivacyId(tc.id);
        setListError(null);
        try {
            await testcaseService.updateTestCasePrivacy(tc.id, !tc.isPrivate);
            await requestRefresh(); // Refresh the entire list to get updated data
        } catch (err: any) {
            setListError(err.message || `Failed to update privacy for ${tc.inputFileName}.`);
            // alert(`Error updating privacy: ${err.message || 'Unknown error'}`);
        } finally {
            setUpdatingPrivacyId(null);
        }
    };

    const handleToggleEditorForItem = (testCaseId: number) => {
        setOpenEditors(prevOpenEditors => ({
            ...prevOpenEditors,
            [testCaseId]: !prevOpenEditors[testCaseId] // Toggle the state for this specific ID
        }));
    };


    if (isLoadingTestCases) return <p className="text-center py-4 text-[#3F72AF]">Loading test cases...</p>;
    if (listError) return <p className="text-center py-4 text-red-600 bg-red-50 p-3 rounded-md">{listError}</p>
    if (testCases.length === 0) return <p className="text-center py-10 text-slate-500 italic">No test cases added yet for this assignment.</p>;

    return (
        <div className="space-y-4 mb-6">
            {testCases.map((tc) => {
                const isCurrentlyEditing = !!openEditors[tc.id];
                const isCurrentlyDeleting = deletingTestCaseId === tc.id;
                const isCurrentlyUpdatingPrivacy = updatingPrivacyId === tc.id;

                return (
                    <div key={tc.id} className="bg-white border border-[#DBE2EF] rounded-lg shadow-md transition-shadow hover:shadow-lg">
                        <div className="p-4 flex flex-col sm:flex-row justify-between sm:items-center">
                            <div className="flex-grow mb-3 sm:mb-0">
                                <div className="font-semibold text-md text-[#3F72AF] mb-1">
                                    {tc.testCaseName || `${tc.inputFileName} / ${tc.expectedOutputFileName}`}
                                </div>
                                <div className="text-xs text-slate-500 space-x-1 sm:space-x-3 flex flex-wrap items-center">
                                    <span>Points: <span className="font-medium text-[#112D4E]">{tc.points}</span></span>
                                    <span className="hidden sm:inline text-[#DBE2EF]">|</span>
                                    <span>Time: <span className="font-medium text-[#112D4E]">{tc.maxExecutionTimeMs}ms</span></span>
                                    <span className="hidden sm:inline text-[#DBE2EF]">|</span>
                                    <span>RAM: <span className="font-medium text-[#112D4E]">{tc.maxRamMB}MB</span></span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1.5">
                                    Added by {tc.addedByUsername} on {formatDate(tc.addedAt)}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0 w-full sm:w-auto">
                                
                                {isEditable && (
                                    <button
                                        onClick={() => handleTogglePrivacy(tc)}
                                        disabled={isCurrentlyUpdatingPrivacy || isCurrentlyDeleting}
                                        className={`w-full sm:w-auto flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1
                                            ${tc.isPrivate ? 'bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500 focus:ring-yellow-400'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-300 focus:ring-gray-400'}
                                            ${isCurrentlyUpdatingPrivacy ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        title={tc.isPrivate ? "Make Public (details visible to student)" : "Make Private (details hidden from student)"}
                                    >
                                        {isCurrentlyUpdatingPrivacy ? <FaSpinner className="animate-spin" /> : (tc.isPrivate ? <FaLock /> : <FaUnlock />)}
                                        <span className="ml-1.5">{tc.isPrivate ? 'Private' : 'Public'}</span>
                                    </button>
                                )}

                                <button
                                    onClick={() => handleToggleEditorForItem(tc.id)} // Use new handler
                                    className={`w-full sm:w-auto flex items-center justify-center px-3 py-1.5 text-xs font-medium text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1
                                        ${isCurrentlyEditing ? 'bg-[#112D4E] hover:bg-opacity-90 focus:ring-[#112D4E]' : 'bg-[#3F72AF] hover:bg-[#112D4E] focus:ring-[#3F72AF]'}
                                        ${isCurrentlyDeleting || isCurrentlyUpdatingPrivacy ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={isCurrentlyDeleting || isCurrentlyUpdatingPrivacy}
                                >
                                    {isCurrentlyEditing ? <FaTimesCircle className="mr-1.5" /> : <FaEdit className="mr-1.5" />}
                                    {isEditable ? (isCurrentlyEditing ? 'Close Editor' : 'Edit Content') : (isCurrentlyEditing ? 'Close View' : 'View Content')}
                                </button>

                                {isEditable && (
                                    <button
                                        onClick={() => handleDeleteTestCase(tc.id)}
                                        disabled={isCurrentlyDeleting || isCurrentlyEditing || isCurrentlyUpdatingPrivacy}
                                        className="w-full sm:w-auto flex items-center justify-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-50"
                                    >
                                        {isCurrentlyDeleting ? <FaSpinner className="animate-spin mr-1.5" /> : <FaTrashAlt className="mr-1.5" />}
                                        {isCurrentlyDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {isCurrentlyEditing && (
                            <div className="mt-3 border-t border-[#DBE2EF] p-4 bg-[#F9F7F7]"> {/* Added padding and bg for editor section */}
                                <TestCaseParallelEditor editingTestCase={tc} isEditable={isEditable} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};