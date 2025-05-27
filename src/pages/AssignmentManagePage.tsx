// src/pages/AssignmentManagePage.tsx
import React, { useEffect, useState, useCallback, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AssignmentDetailsDto } from '../types/assignment'; 
import { AssignmentTopElement } from '../components/AssignmentTopElement'
import { TeacherViewSubmissionsTable } from '../components/TeacherViewSubmissionsTable';
import * as assignmentService from '../services/assignmentService';
import { TestCasesSection } from '../components/TestCasesSection';
import { useAuth } from '../contexts/AuthContext';
import { ClassroomRole } from '../types/classroom';
import * as classroomService from '../services/classroomService';

const AssignmentManagePage: React.FC = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const [assignmentDetails, setAssignmentDetails] = useState<AssignmentDetailsDto | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const [currentUserClassroomRole, setCurrentUserClassroomRole] = useState<ClassroomRole | undefined>(undefined);

    // Fetch Assignment Details Callback
    const fetchAssignmentData = useCallback(async () => {
        if (!assignmentId) { setError("Assignment ID missing."); setIsLoadingDetails(false); return; }
        setIsLoadingDetails(true);
        setError(null); // Clear previous errors
        try {
            const assignmentData = await assignmentService.getAssignmentDetails(assignmentId);
            setAssignmentDetails(assignmentData);

            if (assignmentData?.classroomId && user?.id) {
                const classroomData = await classroomService.getClassroomDetails(assignmentData.classroomId);
                setCurrentUserClassroomRole(classroomData.currentUserRole);
            }
        } catch (err: any) {
            setError(err.message || `Failed to load assignment ${assignmentId}.`);
        } finally {
            setIsLoadingDetails(false);
        }
    }, [assignmentId]);

    useEffect(() => {
        fetchAssignmentData();
    }, [fetchAssignmentData]);

    const isLoading = isLoadingDetails;

    if (isLoading && !assignmentDetails) return <div className="container mx-auto mt-10 p-6 text-center">Loading assignment...</div>; // Initial load
    if (error && !assignmentDetails) return <div className="container mx-auto mt-10 p-6 text-center text-red-600">Error: {error}</div>; // Error loading assignment details
    if (!assignmentDetails) return <div className="container mx-auto mt-10 p-6 text-center">Assignment not found.</div>;

    return (
        <div className="min-h-screen bg-[#F9F7F7] text-[#112D4E]">
            <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-4 px-4 md:px-0">
                    <Link to={`/classrooms/${assignmentDetails.classroomId}`} className="text-sm text-[#3F72AF] hover:text-[#112D4E] hover:underline">
                        &larr; Back to Classroom
                    </Link>
                </div>
                <AssignmentTopElement
                    assignmentDetails={assignmentDetails}
                    currentUserId={user?.id}
                    currentUserClassroomRole={currentUserClassroomRole}
                    onAssignmentUpdated={fetchAssignmentData}
                    onAssignmentDeleted={fetchAssignmentData}
                />
                <TestCasesSection assignmentDetails={assignmentDetails} />
                <TeacherViewSubmissionsTable assignmentDetails={assignmentDetails} />
            </div>
        </div>
    );
};

export default AssignmentManagePage;