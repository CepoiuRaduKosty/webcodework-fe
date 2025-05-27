// src/components/TestCasesSection.tsx
import React, { useCallback, useEffect, useState } from "react"; // Added React import
import { AssignmentDetailsDto } from "../types/assignment";
import * as testcaseService from '../services/testcaseService'; // Assuming correct path
import { TestCaseListDto } from "../types/testcase";        // Assuming correct path
import { AddTestCaseModal } from "./modals/AddTestCaseModal";   // Assuming correct path
import { FaPlus, FaListAlt, FaExclamationCircle, FaSpinner } from 'react-icons/fa'; // Example icons
import { TestCaseList } from "./TestCaseList";

export const TestCasesSection: React.FC<{ assignmentDetails: AssignmentDetailsDto, isEditable: boolean }> = ({ assignmentDetails, isEditable }) => {
    const [showAddTestCaseModal, setShowAddTestCaseModal] = useState(false);
    const [isLoadingTestCases, setIsLoadingTestCases] = useState(true);
    const [testCases, setTestCases] = useState<TestCaseListDto[]>([]);
    const [fetchError, setFetchError] = useState<string | null>(null); // Added for fetch errors

    const addTestCaseModalSuccessfulFinish = async () => {
        setShowAddTestCaseModal(false);
        await fetchTestCasesOverview(); // Refresh after adding
    };

    const fetchTestCasesOverview = useCallback(async () => {
        if (!assignmentDetails?.id) { // Check assignmentDetails itself
            // This case should ideally not happen if TestCasesSection is only rendered when assignmentDetails is present.
            // However, if assignmentDetails.id is null/undefined, it's an issue.
            setIsLoadingTestCases(false);
            setTestCases([]);
            return;
        }
        // Only fetch test cases if it's a code assignment
        if (!assignmentDetails.isCodeAssignment) {
            setIsLoadingTestCases(false);
            setTestCases([]); // Ensure it's empty if not a code assignment
            return;
        }

        setIsLoadingTestCases(true);
        setFetchError(null); // Clear previous errors
        try {
            const data = await testcaseService.getTestCases(assignmentDetails.id);
            setTestCases(data);
        } catch (err: any) {
            console.error("Test case fetch error:", err);
            setFetchError(err.message || 'Failed to load test cases.');
        } finally {
            setIsLoadingTestCases(false);
        }
    }, [assignmentDetails]); // Depend on the whole assignmentDetails object

    useEffect(() => {
        // Fetch only if it's a code assignment and details are present
        if (assignmentDetails?.id && assignmentDetails.isCodeAssignment) {
            fetchTestCasesOverview();
        } else if (!assignmentDetails?.isCodeAssignment) {
            // If it's not a code assignment, ensure loading is false and test cases are empty
            setIsLoadingTestCases(false);
            setTestCases([]);
        }
    }, [fetchTestCasesOverview, assignmentDetails?.isCodeAssignment, assignmentDetails?.id]);


    // If it's not a code assignment, don't render this section at all.
    if (!assignmentDetails.isCodeAssignment) {
        return null; // Or a message indicating this assignment doesn't support test cases
    }

    return (
        <>
            <div className="lg:col-span-3 bg-white p-6 md:p-8 shadow-xl rounded-2xl text-[#112D4E] mb-8"> {/* Main card styling */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-[#DBE2EF]">
                    <h2 className="text-2xl font-bold text-[#112D4E] mb-3 sm:mb-0 flex items-center">
                        <FaListAlt className="mr-3 text-[#3F72AF]" /> {isEditable ? "Test Cases" : "Example Test Cases"}
                        <span className="text-base font-normal text-gray-500 ml-2">({testCases.length})</span>
                    </h2>
                    {isEditable && (
                        <button
                            onClick={() => { setShowAddTestCaseModal(true); }}
                            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#3F72AF] rounded-md hover:bg-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:ring-offset-2 focus:ring-offset-white transition-colors duration-150"
                            title="Add new test case"
                        >
                            <FaPlus className="mr-2 h-4 w-4" /> Add Test Case
                        </button>
                    )}
                </div>

                {/* Loading State */}
                {isLoadingTestCases && (
                    <div className="flex flex-col items-center justify-center py-10 text-[#3F72AF]">
                        <FaSpinner className="animate-spin h-8 w-8 mb-3" />
                        <p className="text-sm font-medium text-[#112D4E]">Loading test cases...</p>
                    </div>
                )}

                {/* Error State */}
                {fetchError && !isLoadingTestCases && (
                    <div className="p-4 my-4 bg-red-50 text-red-700 border-2 border-red-300 rounded-lg shadow-md text-center flex flex-col items-center justify-center">
                        <FaExclamationCircle className="h-8 w-8 mb-2 text-red-600" />
                        <p className="font-semibold">Error Loading Test Cases</p>
                        <p className="text-sm">{fetchError}</p>
                    </div>
                )}

                {/* Test Case List (delegated to TestCaseList component) */}
                {!isLoadingTestCases && !fetchError && (
                    <TestCaseList
                        isLoadingTestCases={isLoadingTestCases} // Though it's false here, pass for consistency if TestCaseList uses it
                        testCases={testCases}
                        assignmentDetails={assignmentDetails}
                        requestRefresh={fetchTestCasesOverview}
                        isEditable={isEditable}
                    />
                )}
            </div>

            {/* Add Test Case Modal */}
            {isEditable && assignmentDetails && ( 
                <AddTestCaseModal
                    assignmentDetails={assignmentDetails}
                    show={showAddTestCaseModal}
                    onSuccessCallback={addTestCaseModalSuccessfulFinish}
                    onCancelCallback={() => setShowAddTestCaseModal(false)}
                />
            )}
        </>
    );
}