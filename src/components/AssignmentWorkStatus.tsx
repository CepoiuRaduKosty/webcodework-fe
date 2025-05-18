import { AssignmentDetailsDto, SubmissionDto } from "../types/assignment";
import { format, parseISO } from 'date-fns';

export const AssignmentWorkStatus: React.FC<{ assignmentDetails: AssignmentDetailsDto, mySubmission: SubmissionDto }> = ({ assignmentDetails, mySubmission}) => {

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return 'N/A';
        try {
            // Example format: Apr 23, 2025, 1:45 PM
            return format(parseISO(dateString), 'PPp');
        } catch {
            return 'Invalid Date';
        }
    };


    return <>
        <div className="mb-4 p-3 rounded border bg-gray-50">
            <h3 className="text-md font-semibold mb-1">Status:</h3>
            {!mySubmission ? (
                <p className="text-orange-600">Not Started</p>
            ) : (
                <div className="text-sm space-y-1">
                    {mySubmission.grade ? (
                        <p className="font-bold text-green-700">Graded: {mySubmission.grade} / {assignmentDetails.maxPoints ?? 'N/A'} points</p>
                    ) : mySubmission.submittedAt ? (
                        <p className={`font-bold ${mySubmission.isLate ? 'text-red-600' : 'text-blue-700'}`}>
                            Turned In {mySubmission.isLate ? '(Late)' : ''}
                        </p>
                    ) : (
                        <p className="text-yellow-700 font-semibold">Assigned (In Progress)</p>
                    )}
                    {mySubmission.submittedAt && <p>Submitted on: {formatDate(mySubmission.submittedAt)}</p>}
                    {mySubmission.grade && mySubmission.gradedAt && <p>Graded on: {formatDate(mySubmission.gradedAt)} by {mySubmission.gradedByUsername ?? 'N/A'}</p>}
                    {mySubmission.feedback && <div className="mt-2 p-2 border-t border-gray-200"><p className="font-semibold text-xs text-gray-500">Feedback:</p><p className="whitespace-pre-wrap text-gray-700">{mySubmission.feedback}</p></div>}
                </div>
            )}
        </div>
    </>
}