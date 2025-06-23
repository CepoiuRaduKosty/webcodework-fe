
import React, { useCallback, useEffect, useState } from "react"; 
import { AssignmentDetailsDto } from "../types/assignment";
import * as testcaseService from '../services/testcaseService'; 
import { TestCaseListDto } from "../types/testcase";        
import { AddTestCaseModal } from "./modals/AddTestCaseModal";   
import { FaPlus, FaListAlt, FaExclamationCircle, FaSpinner } from 'react-icons/fa'; 
import { TestCaseList } from "./TestCaseList";

export const TestCasesSection: React.FC<{ assignmentDetails: AssignmentDetailsDto, isEditable: boolean }> = ({ assignmentDetails, isEditable }) => {
    const [showAddTestCaseModal, setShowAddTestCaseModal] = useState(false);
    const [isLoadingTestCases, setIsLoadingTestCases] = useState(true);
    const [testCases, setTestCases] = useState<TestCaseListDto[]>([]);
    const [fetchError, setFetchError] = useState<string | null>(null); 

    const addTestCaseModalSuccessfulFinish = async () => {
        setShowAddTestCaseModal(false);
        await fetchTestCasesOverview(); 
    };

    const fetchTestCasesOverview = useCallback(async () => {
        if (!assignmentDetails?.id) { 
            
            
            setIsLoadingTestCases(false);
            setTestCases([]);
            return;
        }
        
        if (!assignmentDetails.isCodeAssignment) {
            setIsLoadingTestCases(false);
            setTestCases([]); 
            return;
        }

        setIsLoadingTestCases(true);
        setFetchError(null); 
        try {
            const data = await testcaseService.getTestCases(assignmentDetails.id);
            setTestCases(data);
        } catch (err: any) {
            console.error("Test case fetch error:", err);
            setFetchError(err.message || 'Failed to load test cases.');
        } finally {
            setIsLoadingTestCases(false);
        }
    }, [assignmentDetails]); 

    useEffect(() => {
        
        if (assignmentDetails?.id && assignmentDetails.isCodeAssignment) {
            fetchTestCasesOverview();
        } else if (!assignmentDetails?.isCodeAssignment) {
            
            setIsLoadingTestCases(false);
            setTestCases([]);
        }
    }, [fetchTestCasesOverview, assignmentDetails?.isCodeAssignment, assignmentDetails?.id]);


    
    if (!assignmentDetails.isCodeAssignment) {
        return null; 
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
                        isLoadingTestCases={isLoadingTestCases} 
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