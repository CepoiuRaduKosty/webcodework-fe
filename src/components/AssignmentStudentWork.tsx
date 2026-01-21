import React, { useCallback, useEffect, useState } from 'react'; 
import { AssignmentDetailsDto, SubmissionDto } from '../types/assignment';
import * as assignmentService from '../services/assignmentService';
import { AssignmentWorkStatus } from './AssignmentWorkStatus';
import { AssignmentStudentEditCode } from './AssigmentStudentEditCode'; 
import { AssignmentStudentManageFiles } from './AssignmentStudentManageFiles';
import { FaPaperPlane, FaSpinner, FaExclamationCircle } from 'react-icons/fa'; 

export const AssignmentStudentWork: React.FC<{
    assignmentId: string | undefined,
    assignmentDetails: AssignmentDetailsDto
}> = ({ assignmentId, assignmentDetails }) => {

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [mySubmission, setMySubmission] = useState<SubmissionDto | null>(null);
    const [isLoadingSubmission, setIsLoadingSubmission] = useState(true);

    const fetchMySubmissionData = useCallback(async () => {
        if (!assignmentId) { setIsLoadingSubmission(false); return; }
        setIsLoadingSubmission(true);
        setSubmitError(null);
        try {
            const data = await assignmentService.getMySubmission(assignmentId);
            setMySubmission(data);
        } catch (err: any) {
            if (err?.status === 404) {
                setMySubmission(null);
                console.log("Submission not started or not found for assignment:", assignmentId);
            } else {
                console.error("Failed to load submission status:", err);
                setSubmitError(err.message || 'Failed to load your submission status.');
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
        if (!window.confirm("Are you sure you want to turn in this assignment? You may not be able to make changes after submitting.")) return;

        setIsSubmitting(true);
        setSubmitError(null);
        try {
            await assignmentService.submitAssignment(assignmentId);
            await fetchMySubmissionData();
        } catch (err: any) {
            setSubmitError(err.message || 'Failed to submit assignment.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const canModifySubmission = !mySubmission?.submittedAt && !mySubmission?.grade;

    return (
        <div className="bg-white p-6 md:p-8 shadow-xl rounded-2xl text-[#112D4E]">
            <h2 className="text-2xl font-bold text-[#112D4E] mb-6 pb-4">
                Your Work
            </h2>
            {isLoadingSubmission && (
                <div className="flex flex-col items-center justify-center py-10 text-[#3F72AF]">
                    <FaSpinner className="animate-spin h-8 w-8 mb-3" />
                    <p className="text-sm font-medium">Loading your submission details...</p>
                </div>
            )}
            {submitError && !isLoadingSubmission && ( 
                 <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm flex items-center">
                    <FaExclamationCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>{submitError}</span>
                 </div>
            )}


            {!isLoadingSubmission && (
                <>
                    <AssignmentWorkStatus assignmentDetails={assignmentDetails} mySubmission={mySubmission!} />
                    {canModifySubmission && assignmentDetails.isCodeAssignment && (
                        <div className="my-2 py-2">
                             <AssignmentStudentEditCode
                                assignmentId={assignmentId}
                                assignmentDetails={assignmentDetails}
                                mySubmission={mySubmission}
                                callbackRefreshSubmittedFiles={fetchMySubmissionData}
                             />
                        </div>
                    )}
                    <div className={`my-2 py-2`}>
                        <AssignmentStudentManageFiles
                            mySubmission={mySubmission}
                            canModifySubmission={canModifySubmission}
                            assignmentId={assignmentId}
                            callbackRefetchFiles={fetchMySubmissionData}
                        />
                    </div>
                    {canModifySubmission && (
                        <div className="mt-6 pt-6 border-t border-[#DBE2EF]">
                            <button
                                onClick={handleTurnIn}
                                disabled={isSubmitting}
                                className={`w-full sm:w-auto flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-[#3F72AF] rounded-lg shadow-md hover:bg-[#112D4E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3F72AF] disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-150
                                    ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? (
                                    <FaSpinner className="animate-spin mr-2 h-5 w-5" />
                                ) : (
                                    <FaPaperPlane className="mr-2 h-5 w-5" />
                                )}
                                {isSubmitting ? 'Turning In...' : 'Turn In Assignment'}
                            </button>
                            <p className="text-xs text-slate-500 mt-3">
                                Make sure you have attached all required files and saved your code before turning in. You may not be able to make changes after submission.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};