import { useCallback, useEffect, useState } from 'react';
import { AssignmentDetailsDto, SubmissionDto } from '../types/assignment';
import * as assignmentService from '../services/assignmentService';
import { AssignmentWorkStatus } from './AssignmentWorkStatus';
import { AssignmentStudentEditCode } from './AssigmentStudentEditCode'
import { AssignmentStudentManageFiles } from './AssignmentStudentManageFiles';


export const AssignmentStudentWork: React.FC<{ assignmentId: string | undefined, assignmentDetails: AssignmentDetailsDto }> = ({ assignmentId, assignmentDetails }) => {

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [mySubmission, setMySubmission] = useState<SubmissionDto | null>(null);
    const [isLoadingSubmission, setIsLoadingSubmission] = useState(true);

    const fetchMySubmissionData = useCallback(async () => {
        if (!assignmentId) { setIsLoadingSubmission(false); return; } // No need to fetch if no assignment ID
        setIsLoadingSubmission(true);
        setSubmitError(null); // Clear previous submit errors on refresh
        try {
            const data = await assignmentService.getMySubmission(assignmentId);
            setMySubmission(data);
        } catch (err: any) {
            if (err?.status === 404) {
                setMySubmission(null); // Explicitly set to null if not started
                console.log("Submission not started or not found.");
            } else {
                throw (err.message || 'Failed to load your submission status.'); // Use main error state or a separate one
            }
        } finally {
            setIsLoadingSubmission(false);
        }
    }, [assignmentId]);

    useEffect(() => {
        fetchMySubmissionData();
    }, [fetchMySubmissionData]);

    const handleTurnIn = async () => {
        if (!assignmentId) return;
        // Optional: Add confirmation
        if (!window.confirm("Are you sure you want to turn in this assignment? You may not be able to make changes after submitting.")) return;

        setIsSubmitting(true);
        setSubmitError(null);
        try {
            await assignmentService.submitAssignment(assignmentId);
            await fetchMySubmissionData(); // Refresh submission status
            // TODO: Add success toast
        } catch (err: any) {
            setSubmitError(err.message || 'Failed to submit assignment.');
        } finally {
            setIsSubmitting(false);
        }
    };


    const canModifySubmission = !mySubmission?.submittedAt && !mySubmission?.grade;

    return <>
        <div className="bg-white p-4 md:p-6 shadow rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Work</h2>

            {isLoadingSubmission && <p>Loading...</p>}
            {!isLoadingSubmission && <>
                <AssignmentWorkStatus assignmentDetails={assignmentDetails} mySubmission={mySubmission!} />
                {canModifySubmission && ( // Only show if student can modify
                    <AssignmentStudentEditCode assignmentId={assignmentId} mySubmission={mySubmission} callbackRefreshSubmittedFiles={fetchMySubmissionData}/>
                )}
                <AssignmentStudentManageFiles mySubmission={mySubmission} canModifySubmission={canModifySubmission} assignmentId={assignmentId} callbackRefetchFiles={fetchMySubmissionData}/>
                {canModifySubmission && (
                    <div className="border-t pt-4">
                        {submitError && <p className="text-sm text-red-600 mb-2">{submitError}</p>}
                        <button
                            onClick={handleTurnIn}
                            disabled={isSubmitting}
                            className={`px-6 py-2 text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Turning In...' : 'Turn In / Mark as Done'}
                        </button>
                        <p className="text-xs text-gray-500 mt-2">Make sure you have attached all required files before turning in.</p>
                    </div>
                )}
            </>}

        </div>
    </>
}