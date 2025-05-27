// src/components/AssignmentWorkStatus.tsx
import React, { JSX } from 'react'; // Ensure React is imported
import { AssignmentDetailsDto, SubmissionDto } from "../types/assignment";
import { format, parseISO } from 'date-fns';
import {
    FaInfoCircle,
    FaCheckCircle,
    FaPaperPlane,
    FaClock,
    FaCommentDots,
    FaCalculator
} from 'react-icons/fa';
import { EvaluationStatus } from '../types/evaluation';

export const AssignmentWorkStatus: React.FC<{
    assignmentDetails: AssignmentDetailsDto,
    mySubmission: SubmissionDto | null // mySubmission can be null if not started
}> = ({ assignmentDetails, mySubmission }) => {

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return 'N/A';
        try {
            return format(parseISO(dateString), 'MMM d, yyyy, h:mm a'); // Adjusted format
        } catch {
            return 'Invalid Date';
        }
    };

    let statusElement: JSX.Element;
    let statusColorClass = "text-[#112D4E]";
    let scoreElement: JSX.Element | null = null;

    if (!mySubmission) {
        statusColorClass = "text-yellow-600"; // Using yellow for attention, could be palette blue
        statusElement = (
            <div className={`flex items-center font-semibold ${statusColorClass}`}>
                <FaInfoCircle className="mr-2" /> Not Started
            </div>
        );
    } else if (mySubmission.grade != null) { // Check for non-null grade
        statusColorClass = "text-green-600";
        statusElement = (
            <div className={`flex items-center font-bold ${statusColorClass}`}>
                <FaCheckCircle className="mr-2" /> Graded: {mySubmission.grade} / {assignmentDetails.maxPoints ?? 'N/A'} points
            </div>
        );
    } else if (mySubmission.submittedAt) {
        // It's turned in, now check if it's a code assignment with evaluation points
        const isLate = mySubmission.isLate;
        let turnedInText = "Turned In";
        let turnedInIcon = <FaPaperPlane className="mr-2 flex-shrink-0" />;
        statusColorClass = "text-[#3F72AF]"; // Primary blue for on-time

        if (isLate) {
            turnedInText = "Turned In (Late)";
            turnedInIcon = <FaClock className="mr-2 flex-shrink-0" />;
            statusColorClass = "text-red-600";
        }

        statusElement = (
            <div className={`flex items-center font-bold ${statusColorClass}`}>
                {turnedInIcon} {turnedInText}
            </div>
        );

        // Add automated score if available for code assignments that are turned in
        if (assignmentDetails.isCodeAssignment &&
            mySubmission.lastEvaluationPointsObtained != null && // Check for non-null
            mySubmission.lastEvaluationTotalPossiblePoints != null) { // Check for non-null
            scoreElement = (
                <div className="mt-1 text-xs text-[#112D4E] flex items-center">
                    <FaCalculator className="mr-1.5 text-[#3F72AF]" />
                    Automated Score:
                    <span className="font-semibold ml-1">
                        {mySubmission.lastEvaluationPointsObtained} / {mySubmission.lastEvaluationTotalPossiblePoints} points
                    </span>
                </div>
            );
        }
    } else { // Not submitted yet, but a submission record exists (in progress)
        statusColorClass = "text-orange-500";
        statusElement = (
            <div className={`flex items-center font-semibold ${statusColorClass}`}>
                <FaInfoCircle className="mr-2 flex-shrink-0" /> Assigned (In Progress)
            </div>
        );
        // Optionally, show last evaluation score even if "In Progress"
        // This might be useful if students can "run" tests before "turning in"
        if (assignmentDetails.isCodeAssignment &&
            mySubmission.lastEvaluationPointsObtained != null &&
            mySubmission.lastEvaluationTotalPossiblePoints != null &&
            mySubmission.lastEvaluationOverallStatus !== EvaluationStatus.CompileError // Maybe don't show score if last run was compile error
        ) {
            scoreElement = (
                <div className="mt-1 text-xs text-gray-600 flex items-center">
                    <FaCalculator className="mr-1.5 text-[#3F72AF]" />
                    Last test run:
                    <span className="font-semibold ml-1">
                        {mySubmission.lastEvaluationPointsObtained} / {mySubmission.lastEvaluationTotalPossiblePoints}
                    </span>
                </div>
            );
        }
    }

    return (
        <div className="mb-6 p-4 md:p-5 rounded-lg border border-[#DBE2EF] bg-[#F9F7F7] shadow-sm text-[#112D4E]">
            <h3 className="text-md font-semibold text-[#112D4E] mb-2 flex items-center">
                Submission Status
            </h3>
            <div className={`text-base mb-1 ${statusColorClass}`}> {/* Reduced mb for tighter spacing with score */}
                {statusElement}
            </div>
            {scoreElement} {/* Display score if available */}

            {mySubmission && (
                <div className="text-xs text-slate-600 space-y-1 mt-2"> {/* Added mt-2 if scoreElement is present */}
                    {mySubmission.submittedAt && (
                        <p>Official submission: {formatDate(mySubmission.submittedAt)}</p>
                    )}
                    {mySubmission.grade != null && mySubmission.gradedAt && ( // For manual grade
                        <p>Manually graded: {formatDate(mySubmission.gradedAt)} by {mySubmission.gradedByUsername ?? 'Instructor'}</p>
                    )}
                    {mySubmission.feedback && (
                        <div className="mt-3 pt-3 border-t border-[#DBE2EF]">
                            <p className="font-semibold text-xs text-[#112D4E] mb-0.5 flex items-center">
                                <FaCommentDots className="mr-1.5 text-[#3F72AF]" />
                                Feedback from Instructor:
                            </p>
                            <p className="whitespace-pre-wrap text-[#112D4E] bg-white p-2 rounded border border-gray-200 text-xs">
                                {mySubmission.feedback}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}