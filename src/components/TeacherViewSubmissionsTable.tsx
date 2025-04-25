import { useCallback, useEffect, useState } from "react";
import { AssignmentDetailsDto, TeacherSubmissionViewDto } from "../types/assignment";
import * as assignmentService from '../services/assignmentService';
import { format, parseISO } from "date-fns";

// Format Dates Helper
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try { return format(parseISO(dateString), 'PPp'); } catch { return 'Invalid Date'; }
};

// Helper function to determine status color
const getStatusColor = (status: string): string => {
    if (status === 'Graded') return 'bg-green-100 text-green-800';
    if (status.includes('Submitted')) return 'bg-blue-100 text-blue-800';
    if (status === 'In Progress') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-600'; // Not Submitted or other
};

export const TeacherViewSubmissionsTable: React.FC<{ assignmentDetails: AssignmentDetailsDto }> = ({ assignmentDetails }) => {

    const [submissions, setSubmissions] = useState<TeacherSubmissionViewDto[]>([]);
    const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch Submissions Overview Callback
    const fetchSubmissionsOverview = useCallback(async () => {
        if (!assignmentDetails!.id) { setIsLoadingSubmissions(false); return; }
        setIsLoadingSubmissions(true);
        setError(null); // Clear previous errors
        try {
            const data = await assignmentService.getSubmissionsForAssignment(assignmentDetails.id);
            setSubmissions(data);
        } catch (err: any) {
            setError(err.message || `Failed to load submissions for assignment ${assignmentDetails.id}.`);
        } finally {
            setIsLoadingSubmissions(false);
        }
    }, [assignmentDetails]);

    useEffect(() => {
        fetchSubmissionsOverview();
    }, [fetchSubmissionsOverview]);

    const handleViewSubmission = (submissionId: number | null | undefined) => {
        if (!submissionId) {
            alert("This student hasn't submitted anything yet.");
            return;
        }
        // TODO: Navigate to a specific grading page/view or open a modal
        // For now, just log or alert
        console.log(`Maps to grade/view submission ID: ${submissionId}`);
        alert(`Maps to grade/view submission ID: ${submissionId}. (Not implemented)`);
        // Example navigation: navigate(`/submissions/${submissionId}/grade`);
    };

    return (
        <div className="bg-white p-4 md:p-6 shadow rounded-lg">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">Student Submissions</h2>
            {isLoadingSubmissions && <p className="text-gray-600">Loading submissions...</p>}
            {error && !isLoadingSubmissions && <p className="text-red-600 text-sm mb-4">Error loading submissions: {error}</p>}

            {/* Submissions Table/List */}
            {!isLoadingSubmissions && submissions.length === 0 && <p className="text-gray-500 italic">No students found in this class or no submissions yet.</p>}
            {!isLoadingSubmissions && submissions.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Files</th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {submissions.map((sub) => (
                                <tr key={sub.studentId}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{sub.studentUsername}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(sub.status)}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatDate(sub.submittedAt)}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{sub.grade?.toString() ?? '-'}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{sub.hasFiles ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleViewSubmission(sub.submissionId)}
                                            disabled={!sub.submissionId} // Disable if not submitted yet
                                            className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        >
                                            View/Grade
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}