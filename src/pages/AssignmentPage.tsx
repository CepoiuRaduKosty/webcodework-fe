
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as assignmentService from '../services/assignmentService';
import { AssignmentDetailsDto } from '../types/assignment';
import { AssignmentTopElement } from '../components/AssignmentTopElement';
import { AssignmentStudentWork } from '../components/AssignmentStudentWork';
import { useAuth } from '../contexts/AuthContext';
import { ClassroomRole } from '../types/classroom';
import { TestCasesSection } from '../components/TestCasesSection';

const AssignmentPage: React.FC = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const [assignmentDetails, setAssignmentDetails] = useState<AssignmentDetailsDto | null>(null);
    const [isLoadingAssignment, setIsLoadingAssignment] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    
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

    
    if (isLoadingAssignment) return <div className="container mx-auto mt-10 p-6 text-center">Loading assignment data...</div>;
    if (error) return <div className="container mx-auto mt-10 p-6 text-center text-red-600">Error: {error}</div>;
    if (!assignmentDetails) return <div className="container mx-auto mt-10 p-6 text-center">Loading assignment details...</div>;

    const isStudentView = true; 

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
                    currentUserClassroomRole={ClassroomRole.Student}
                    onAssignmentUpdated={fetchAssignmentData}
                    onAssignmentDeleted={fetchAssignmentData}
                />
                {assignmentDetails.isCodeAssignment && <TestCasesSection assignmentDetails={assignmentDetails} isEditable={false} />}
                {isStudentView && <AssignmentStudentWork assignmentId={assignmentId} assignmentDetails={assignmentDetails} />}
            </div>
        </div>
    );
};

export default AssignmentPage;