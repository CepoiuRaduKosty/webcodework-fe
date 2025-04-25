// src/pages/AssignmentManagePage.tsx
import React, { useEffect, useState, useCallback, FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AssignmentDetailsDto, TestCaseListDto } from '../types/assignment'; // Use types index or direct path
import { format, parseISO } from 'date-fns'; // For date formatting
import { Editor } from '@monaco-editor/react';
import { Modal } from '../components/Modal';
import { AssignmentTopElement } from '../components/AssignmentTopElement'
import { TeacherViewSubmissionsTable } from '../components/TeacherViewSubmissionsTable';
import * as assignmentService from '../services/assignmentService';
import { TestCasesSection } from '../components/TestCasesSection';



const AssignmentManagePage: React.FC = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const navigate = useNavigate();

    // State
    const [assignmentDetails, setAssignmentDetails] = useState<AssignmentDetailsDto | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);
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

    useEffect(() => {
        fetchAssignmentData();
    }, [fetchAssignmentData]);

    
    // --- Render Logic ---
     const isLoading = isLoadingDetails;

    if (isLoading && !assignmentDetails) return <div className="container mx-auto mt-10 p-6 text-center">Loading assignment...</div>; // Initial load
    if (error && !assignmentDetails) return <div className="container mx-auto mt-10 p-6 text-center text-red-600">Error: {error}</div>; // Error loading assignment details
    if (!assignmentDetails) return <div className="container mx-auto mt-10 p-6 text-center">Assignment not found.</div>;

    return (
         <div className="container mx-auto mt-6 md:mt-10 p-4 md:p-0">
            {/* Back Link & Header */}
            <div className="mb-4 px-4 md:px-0">
                 <Link to={`/classrooms/${assignmentDetails.classroomId}`} className="text-sm text-blue-600 hover:underline">&larr; Back to Classroom</Link>
            </div>
            <AssignmentTopElement assignmentDetails={assignmentDetails} />
            <TestCasesSection assignmentDetails={assignmentDetails} />
            <TeacherViewSubmissionsTable assignmentDetails={assignmentDetails} />
         </div>
    );
};

export default AssignmentManagePage;