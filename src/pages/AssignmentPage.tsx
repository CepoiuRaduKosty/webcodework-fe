// src/pages/AssignmentPage.tsx
import React, { useEffect, useState, useCallback, ChangeEvent, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as assignmentService from '../services/assignmentService';
import { useAuth } from '../contexts/AuthContext'; // To check user role indirectly

// Helper to format dates (install date-fns: npm install date-fns)
import { format, parseISO } from 'date-fns';
import { AssignmentDetailsDto, SubmissionDto } from '../types/assignment';

const AssignmentPage: React.FC = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const { user } = useAuth(); // Get current logged-in user info (optional usage)
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

    // State
    const [assignmentDetails, setAssignmentDetails] = useState<AssignmentDetailsDto | null>(null);
    const [mySubmission, setMySubmission] = useState<SubmissionDto | null>(null);
    const [isLoadingAssignment, setIsLoadingAssignment] = useState(true);
    const [isLoadingSubmission, setIsLoadingSubmission] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // File Upload State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Submission State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Deletion State
    const [deletingFileId, setDeletingFileId] = useState<number | null>(null);


    // Fetch Assignment Details Callback
    const fetchAssignmentData = useCallback(async () => {
        if (!assignmentId) { setError("Assignment ID missing."); setIsLoadingAssignment(false); return; }
        setIsLoadingAssignment(true);
        setError(null);
        try {
            const data = await assignmentService.getAssignmentDetails(assignmentId);
            setAssignmentDetails(data);
        } catch (err: any) {
            setError(err.message || `Failed to load assignment ${assignmentId}.`);
        } finally {
            setIsLoadingAssignment(false);
        }
    }, [assignmentId]);

    // Fetch Student Submission Callback
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
                setError(err.message || 'Failed to load your submission status.'); // Use main error state or a separate one
            }
        } finally {
            setIsLoadingSubmission(false);
        }
    }, [assignmentId]);

    useEffect(() => {
        fetchAssignmentData();
        fetchMySubmissionData(); // Fetch both in parallel
    }, [fetchAssignmentData, fetchMySubmissionData]); // Depend on the callbacks

    // --- Handlers ---

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
            setUploadError(null); // Clear previous upload error
        } else {
            setSelectedFile(null);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile || !assignmentId) return;
        setIsUploading(true);
        setUploadError(null);
        try {
            await assignmentService.uploadSubmissionFile(assignmentId, selectedFile);
            // Success
            setSelectedFile(null); // Clear selection
            if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input visually
            await fetchMySubmissionData(); // Refresh submission details (including files)
            // TODO: Add success toast
        } catch (err: any) {
            setUploadError(err.message || 'File upload failed.');
        } finally {
            setIsUploading(false);
        }
    };

     const handleDeleteFile = async (fileId: number) => {
        if (!mySubmission?.id) return; // Need submission ID
        if (!window.confirm("Are you sure you want to delete this file?")) return;

        setDeletingFileId(fileId); // Indicate which file is being deleted
         setUploadError(null); // Clear general upload error if any
         try {
            await assignmentService.deleteSubmissionFile(mySubmission.id, fileId);
            await fetchMySubmissionData(); // Refresh file list
             // TODO: Add success toast
         } catch (err: any) {
              setUploadError(err.message || 'Failed to delete file.'); // Show error in upload section
         } finally {
              setDeletingFileId(null);
         }
     };

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


    // --- Render Logic ---
    if (isLoadingAssignment || isLoadingSubmission) return <div className="container mx-auto mt-10 p-6 text-center">Loading assignment data...</div>;
    if (error) return <div className="container mx-auto mt-10 p-6 text-center text-red-600">Error: {error}</div>;
    if (!assignmentDetails) return <div className="container mx-auto mt-10 p-6 text-center">Assignment not found.</div>;

    // Determine view type - simplified check: if mySubmission data could be fetched (even if null meaning 'not started'), assume student view is relevant.
    // A more robust check might involve fetching classroom details again or using context.
    // Let's assume if getMySubmission didn't throw a Forbidden error, the user is likely a student.
    const isStudentView = true; // Placeholder - ideally, confirm role
    const canModifySubmission = isStudentView && !mySubmission?.submittedAt && !mySubmission?.grade;


    // Format Dates Helper
    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return 'N/A';
        try {
            // Example format: Apr 23, 2025, 1:45 PM
            return format(parseISO(dateString), 'PPp');
        } catch {
            return 'Invalid Date';
        }
    };


    return (
        <div className="container mx-auto mt-6 md:mt-10 p-4 md:p-0">
             {/* Back Link & Header */}
            <div className="mb-4 px-4 md:px-0">
                 {/* Link back to the classroom */}
                 <Link to={`/classrooms/${assignmentDetails.classroomId}`} className="text-sm text-blue-600 hover:underline">&larr; Back to Classroom</Link>
            </div>
             <div className="bg-white p-4 md:p-6 shadow rounded-lg mb-6">
                 <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{assignmentDetails.title}</h1>
                 <div className="text-xs text-gray-500 space-x-3 mb-3 border-b pb-2">
                    <span>By: {assignmentDetails.createdByUsername}</span>
                    <span>Created: {formatDate(assignmentDetails.createdAt)}</span>
                    {assignmentDetails.dueDate && <span>Due: {formatDate(assignmentDetails.dueDate)}</span>}
                    {assignmentDetails.maxPoints && <span>Points: {assignmentDetails.maxPoints}</span>}
                 </div>
                 {assignmentDetails.instructions && (
                     <div className="prose prose-sm max-w-none mt-2">
                         <h3 className="text-sm font-semibold mb-1 text-gray-600">Instructions:</h3>
                         {/* Render instructions - could use react-markdown later */}
                         <p className="whitespace-pre-wrap">{assignmentDetails.instructions}</p>
                     </div>
                 )}
            </div>

            {/* Submission Section (Student View) */}
             {isStudentView && (
                 <div className="bg-white p-4 md:p-6 shadow rounded-lg">
                     <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Work</h2>

                     {/* Submission Status */}
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


                     {/* File Upload Area (only if can modify) */}
                     {canModifySubmission && (
                         <div className="mb-6 p-3 border border-dashed border-gray-300 rounded">
                              <h3 className="text-md font-semibold mb-2 text-gray-600">Attach Files</h3>
                              {uploadError && <p className="text-sm text-red-600 mb-2">{uploadError}</p>}
                              <div className="flex items-center space-x-2">
                                 <input
                                     ref={fileInputRef}
                                     type="file"
                                     onChange={handleFileChange}
                                     className="block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 disabled:opacity-50"
                                     disabled={isUploading}
                                 />
                                 <button
                                    onClick={handleFileUpload}
                                    disabled={!selectedFile || isUploading}
                                    className={`px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${isUploading ? 'animate-pulse' : ''}`}
                                 >
                                     {isUploading ? 'Uploading...' : 'Upload'}
                                 </button>
                              </div>
                         </div>
                     )}

                     {/* Submitted Files List */}
                     <div className="mb-6">
                         <h3 className="text-md font-semibold mb-2 text-gray-600">Your Submitted Files ({mySubmission?.submittedFiles?.length ?? 0})</h3>
                         {mySubmission?.submittedFiles && mySubmission.submittedFiles.length > 0 ? (
                             <ul className="space-y-2">
                                 {mySubmission.submittedFiles.map(file => (
                                     <li key={file.id} className="flex justify-between items-center text-sm p-2 border rounded bg-gray-50">
                                         <span>
                                            {/* TODO: Add download link here */}
                                            <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline font-medium">{file.fileName}</a>
                                             <span className="text-gray-500 ml-2">({(file.fileSize / 1024).toFixed(1)} KB)</span>
                                         </span>
                                         {canModifySubmission && ( // Only show delete if submission can be modified
                                              <button
                                                onClick={() => handleDeleteFile(file.id)}
                                                disabled={deletingFileId === file.id}
                                                className="text-red-500 hover:text-red-700 disabled:opacity-50 text-xs font-semibold"
                                                title="Delete file"
                                              >
                                                 {deletingFileId === file.id ? 'Deleting...' : 'Delete'}
                                              </button>
                                         )}
                                     </li>
                                 ))}
                             </ul>
                         ) : (
                             <p className="text-sm text-gray-500 italic">No files submitted yet.</p>
                         )}
                     </div>

                     {/* Submit Button (only if can modify) */}
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
                 </div>
            )}

             {/* TODO: Add Teacher View Section Here */}
             {/* This would involve fetching all submissions (using a new service call) */}
             {/* and displaying a list of students + their status/grades */}

        </div>
    );
};

export default AssignmentPage;