// src/pages/AssignmentManagePage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AssignmentDetailsDto, TeacherSubmissionViewDto } from '../types/assignment';
import { AssignmentTopElement } from '../components/AssignmentTopElement'
import { TeacherViewSubmissionsTable } from '../components/TeacherViewSubmissionsTable';
import * as assignmentService from '../services/assignmentService';
import { TestCasesSection } from '../components/TestCasesSection';
import { useAuth } from '../contexts/AuthContext';
import { ClassroomRole } from '../types/classroom';
import * as classroomService from '../services/classroomService';
import { GradedSubmissionsPieChart } from '../components/charts/GradedSubmissionsPieChart';
import { SubmissionStatusPieChart } from '../components/charts/SubmissionStatusPieChart';
import { GradeDistributionChart } from '../components/charts/GradeDistributionChart';

const AssignmentManagePage: React.FC = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const [assignmentDetails, setAssignmentDetails] = useState<AssignmentDetailsDto | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const [currentUserClassroomRole, setCurrentUserClassroomRole] = useState<ClassroomRole | undefined>(undefined);
    const [submissions, setSubmissions] = useState<TeacherSubmissionViewDto[]>([]);
    const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);

    const fetchPageData = useCallback(async () => {
        if (!assignmentId) {
            setError("Assignment ID missing.");
            setIsLoadingDetails(false);
            setIsLoadingSubmissions(false);
            return;
        }
        setIsLoadingDetails(true);
        setIsLoadingSubmissions(true);
        setError(null);
        try {
            // Fetch in parallel
            const [assignmentData, submissionsData] = await Promise.all([
                assignmentService.getAssignmentDetails(assignmentId),
                assignmentService.getSubmissionsForAssignment(assignmentId) // Fetch submissions here
            ]);

            setAssignmentDetails(assignmentData);
            setSubmissions(submissionsData);
            
            if (assignmentData?.classroomId && user?.id) {
                const classroomData = await classroomService.getClassroomDetails(assignmentData.classroomId);
                setCurrentUserClassroomRole(classroomData.currentUserRole);
            }
        } catch (err: any) {
            setError(err.message || `Failed to load assignment data.`);
        } finally {
            setIsLoadingDetails(false);
            setIsLoadingSubmissions(false);
        }
    }, [assignmentId, user?.id]); // Added user?.id

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);

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
                    onAssignmentUpdated={fetchPageData}
                    onAssignmentDeleted={fetchPageData}
                />
                {assignmentDetails && !isLoading && (
                    <div className="my-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <GradedSubmissionsPieChart submissions={submissions} />
                        <SubmissionStatusPieChart submissions={submissions} />
                        <GradeDistributionChart submissions={submissions} assignmentDetails={assignmentDetails} />
                    </div>
                )}
                {assignmentDetails.isCodeAssignment && <TestCasesSection assignmentDetails={assignmentDetails} isEditable={true} />}
                <TeacherViewSubmissionsTable assignmentDetails={assignmentDetails} submissions={submissions} isLoadingSubmissions={isLoadingSubmissions} fetchSubmissionsError={error} refreshSubmissions={fetchPageData}/>
            </div>
        </div>
    );
};

export default AssignmentManagePage;