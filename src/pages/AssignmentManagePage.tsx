// src/pages/AssignmentManagePage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as assignmentService from '../services/assignmentService';
import { AssignmentDetailsDto, TeacherSubmissionViewDto } from '../types/assignment'; // Use types index or direct path
import { format, parseISO } from 'date-fns'; // For date formatting

// Helper function to determine status color
const getStatusColor = (status: string): string => {
    if (status === 'Graded') return 'bg-green-100 text-green-800';
    if (status.includes('Submitted')) return 'bg-blue-100 text-blue-800';
    if (status === 'In Progress') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-600'; // Not Submitted or other
};

// Format Dates Helper
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try { return format(parseISO(dateString), 'PPp'); } catch { return 'Invalid Date'; }
};

const AssignmentManagePage: React.FC = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const navigate = useNavigate();

    // State
    const [assignmentDetails, setAssignmentDetails] = useState<AssignmentDetailsDto | null>(null);
    const [submissions, setSubmissions] = useState<TeacherSubmissionViewDto[]>([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);
    const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch Assignment Details Callback
    const fetchAssignmentData = useCallback(async () => {
        if (!assignmentId) { setError("Assignment ID missing."); setIsLoadingDetails(false); return; }
        setIsLoadingDetails(true);
        setError(null); // Clear previous errors
        try {
            const data = await assignmentService.getAssignmentDetails(assignmentId);
            setAssignmentDetails(data);
        } catch (err: any) {
            setError(err.message || `Failed to load assignment ${assignmentId}.`);
        } finally {
            setIsLoadingDetails(false);
        }
    }, [assignmentId]);

    // Fetch Submissions Overview Callback
    const fetchSubmissionsOverview = useCallback(async () => {
        if (!assignmentId) { setIsLoadingSubmissions(false); return; }
        setIsLoadingSubmissions(true);
        setError(null); // Clear previous errors
        try {
            const data = await assignmentService.getSubmissionsForAssignment(assignmentId);
            setSubmissions(data);
        } catch (err: any) {
            setError(err.message || `Failed to load submissions for assignment ${assignmentId}.`);
        } finally {
            setIsLoadingSubmissions(false);
        }
    }, [assignmentId]);


    useEffect(() => {
        fetchAssignmentData();
        fetchSubmissionsOverview();
    }, [fetchAssignmentData, fetchSubmissionsOverview]);

    // --- Handlers (Placeholder for future actions) ---
    const handleEditAssignment = () => {
        // TODO: Navigate to an edit page or open an edit modal
        alert('Edit Assignment functionality not implemented yet.');
    };

    const handleDeleteAssignment = async () => {
        // TODO: Implement delete assignment call
        if (!assignmentId) return;
        if (window.confirm("Are you sure you want to delete this assignment and all associated submissions?")) {
             alert('Delete Assignment functionality not implemented yet.');
            // try {
            //     await assignmentService.deleteAssignment(assignmentId);
            //     navigate(`/classrooms/${assignmentDetails?.classroomId}`); // Go back to classroom
            // } catch(err: any) { setError(err.message || 'Failed to delete'); }
        }
    };

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

    // --- Render Logic ---
     const isLoading = isLoadingDetails || isLoadingSubmissions;

    if (isLoading && !assignmentDetails) return <div className="container mx-auto mt-10 p-6 text-center">Loading assignment...</div>; // Initial load
    if (error && !assignmentDetails) return <div className="container mx-auto mt-10 p-6 text-center text-red-600">Error: {error}</div>; // Error loading assignment details
    if (!assignmentDetails) return <div className="container mx-auto mt-10 p-6 text-center">Assignment not found.</div>;

    return (
         <div className="container mx-auto mt-6 md:mt-10 p-4 md:p-0">
            {/* Back Link & Header */}
            <div className="mb-4 px-4 md:px-0">
                 <Link to={`/classrooms/${assignmentDetails.classroomId}`} className="text-sm text-blue-600 hover:underline">&larr; Back to Classroom</Link>
            </div>

            {/* Assignment Details Box */}
            <div className="bg-white p-4 md:p-6 shadow rounded-lg mb-6">
                 <div className="flex flex-col sm:flex-row justify-between items-start mb-3 pb-3 border-b">
                     <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">{assignmentDetails.title}</h1>
                        <div className="text-xs text-gray-500 space-x-3">
                            <span>By: {assignmentDetails.createdByUsername}</span>
                            <span>Created: {formatDate(assignmentDetails.createdAt)}</span>
                            {assignmentDetails.dueDate && <span>Due: {formatDate(assignmentDetails.dueDate)}</span>}
                            {assignmentDetails.maxPoints && <span>Points: {assignmentDetails.maxPoints}</span>}
                        </div>
                     </div>
                     {/* TODO: Add Edit/Delete Buttons */}
                     <div className="flex space-x-2 mt-2 sm:mt-0">
                          <button onClick={handleEditAssignment} className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600">Edit</button>
                          <button onClick={handleDeleteAssignment} className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                     </div>
                 </div>
                 {assignmentDetails.instructions && (
                     <div className="prose prose-sm max-w-none mt-2">
                         <h3 className="text-sm font-semibold mb-1 text-gray-600">Instructions:</h3>
                         <p className="whitespace-pre-wrap">{assignmentDetails.instructions}</p>
                     </div>
                 )}
            </div>

            {/* Submissions Overview Box */}
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
         </div>
    );
};

export default AssignmentManagePage;