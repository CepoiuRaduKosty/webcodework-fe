// src/pages/AssignmentPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as assignmentService from '../services/assignmentService';
import { AssignmentDetailsDto } from '../types/assignment';
import { AssignmentTopElement } from '../components/AssignmentTopElement';
import { AssignmentStudentWork } from '../components/AssignmentStudentWork';

const AssignmentPage: React.FC = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const [assignmentDetails, setAssignmentDetails] = useState<AssignmentDetailsDto | null>(null);
    const [isLoadingAssignment, setIsLoadingAssignment] = useState(true);
    const [error, setError] = useState<string | null>(null);


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

    useEffect(() => {
        fetchAssignmentData();
    }, [fetchAssignmentData]);

    // --- Render Logic ---
    if (isLoadingAssignment) return <div className="container mx-auto mt-10 p-6 text-center">Loading assignment data...</div>;
    if (error) return <div className="container mx-auto mt-10 p-6 text-center text-red-600">Error: {error}</div>;
    if (!assignmentDetails) return <div className="container mx-auto mt-10 p-6 text-center">Assignment not found.</div>;

    const isStudentView = true; // Placeholder - ideally, confirm role

    return (
        <div className="container mx-auto mt-6 md:mt-10 p-4 md:p-0">
            <div className="mb-4 px-4 md:px-0">
                <Link to={`/classrooms/${assignmentDetails.classroomId}`} className="text-sm text-blue-600 hover:underline">&larr; Back to Classroom</Link>
            </div>
            <AssignmentTopElement assignmentDetails={assignmentDetails}/>
            {isStudentView && <AssignmentStudentWork assignmentId={assignmentId} assignmentDetails={assignmentDetails}/>}
        </div>
    );
};

export default AssignmentPage;