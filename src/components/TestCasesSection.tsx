import { useCallback, useEffect, useState } from "react";
import { AssignmentDetailsDto } from "../types/assignment";
import * as testcaseService from '../services/testcaseService'
import { TestCaseListDto } from "../types/testcase";
import { AddTestCaseModal } from "./modals/AddTestCaseModal";
import { TestCaseList } from "./TestCaseList";

export const TestCasesSection: React.FC<{ assignmentDetails: AssignmentDetailsDto }> = ({ assignmentDetails }) => {
    const [showAddTestCaseModal, setShowAddTestCaseModal] = useState(false);
    const [isLoadingTestCases, setIsLoadingTestCases] = useState(true);
    const [testCases, setTestCases] = useState<TestCaseListDto[]>([]); // Test cases list

    const addTestCaseModalSuccessfulFinish = async () => {
        setShowAddTestCaseModal(false);
        await fetchTestCasesOverview();
    }

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
            const data = await testcaseService.getTestCases(assignmentDetails.id);
            setTestCases(data);
        } catch (err: any) {
            console.error("Test case fetch error:", err);
        } finally {
            setIsLoadingTestCases(false);
        }
    }, [assignmentDetails]); // Depend on assignmentDetails to check isCodeAssignment

    useEffect(() => {
        fetchTestCasesOverview();
    }, [fetchTestCasesOverview]);

    return (<>
        {
            assignmentDetails.isCodeAssignment && (
                <div className="bg-white p-4 md:p-6 shadow rounded-lg mb-6">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b">
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-700">Test Cases</h2>
                        <button
                            onClick={() => { setShowAddTestCaseModal(true); }}
                            className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 text-sm"
                            title="Add new test case"
                        >
                            + Add Test Case
                        </button>
                    </div>
                    <TestCaseList isLoadingTestCases={isLoadingTestCases} testCases={testCases} assignmentDetails={assignmentDetails} requestRefresh={() => fetchTestCasesOverview()}/>
                </div> // End Test Case Section Div
            )
        }
        <AddTestCaseModal assignmentDetails={assignmentDetails} show={showAddTestCaseModal} onSuccessCallback={addTestCaseModalSuccessfulFinish} onCancelCallback={() => setShowAddTestCaseModal(false)} />
    </>
    )
}