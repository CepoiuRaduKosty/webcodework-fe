import { FormEvent, useCallback, useEffect, useState } from "react";
import { AssignmentBasicDto, CreateAssignmentDto } from "../types/assignment";
import { ClassroomDetailsDto, ClassroomRole } from "../types/classroom";
import * as assignmentService from '../services/assignmentService';
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { CreateAssignmentModal } from "./modals/CreateAssignmentModal";

const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try { return format(parseISO(dateString), 'PPp'); } catch { return 'Invalid Date'; }
};

export const ClassroomAssignmentsSection: React.FC<{ details: ClassroomDetailsDto }> = ({ details }) => {
    const [assignments, setAssignments] = useState<AssignmentBasicDto[]>([]);
    const [isLoadingAssignments, setIsLoadingAssignments] = useState<boolean>(true);
    const [assignmentError, setAssignmentError] = useState<string | null>(null);
    const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);



    // Fetch Assignments Callback
    const fetchAssignments = useCallback(async () => {
        if (!details!.id) return; // Don't fetch if no ID
        setIsLoadingAssignments(true);
        setAssignmentError(null);
        try {
            const data = await assignmentService.getAssignmentsForClassroom(details.id);
            setAssignments(data);
        } catch (err: any) {
            // Don't overwrite details error if assignments fail, show separate error
            setAssignmentError(err.message || 'Failed to load assignments.');
        } finally {
            setIsLoadingAssignments(false);
        }
    }, [details]);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    const onModalCloseHandler = () => {
        setShowCreateAssignmentModal(false);
    }

    const onModalSuccessHandler = async () => {
        setShowCreateAssignmentModal(false);
        await fetchAssignments();
    }

    const canCreateAssignments = details.currentUserRole === ClassroomRole.Owner || details.currentUserRole === ClassroomRole.Teacher;
    const isTeacherOrOwner = details?.currentUserRole === ClassroomRole.Owner || details?.currentUserRole === ClassroomRole.Teacher;

    return <>
        {/* Assignments Section (Main Column) */}
        <div className="lg:col-span-2 bg-white p-4 md:p-6 shadow rounded-lg">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-700">Assignments</h2>
                {canCreateAssignments && (
                    <button
                        onClick={() => { setShowCreateAssignmentModal(true); }}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 text-sm"
                    >
                        + Create Assignment
                    </button>
                )}
            </div>

            {/* Assignment List */}
            {isLoadingAssignments && <p className="text-gray-600">Loading assignments...</p>}
            {assignmentError && <p className="text-red-600 text-sm">Error loading assignments: {assignmentError}</p>}
            {!isLoadingAssignments && !assignmentError && (
                assignments.length === 0 ? (
                    <p className="text-gray-500 italic">No assignments created yet.</p>
                ) : (
                    <ul className="space-y-4">
                        {assignments.map((assignment) => {
                            // Determine the link based on the user's role in THIS classroom
                            const assignmentLink = isTeacherOrOwner
                                ? `/assignments/${assignment.id}/manage` // Link for Teachers/Owners
                                : `/assignments/${assignment.id}`;      // Link for Students

                            return (
                                <li key={assignment.id} className="border border-gray-200 rounded p-3 hover:bg-gray-50 transition duration-150">
                                    {/* Use the determined link */}
                                    <Link to={assignmentLink} className="block">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold text-indigo-700 hover:underline">{assignment.title}</span>
                                            {/* Conditionally render status ONLY if user is likely a student */}
                                            {/* We check 'assignment.submissionStatus' which is ONLY populated for students by the API */}
                                            {assignment.submissionStatus && (
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${assignment.submissionStatus === 'Graded' ? 'bg-green-100 text-green-800' :
                                                    assignment.submissionStatus.includes('Submitted') ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {assignment.submissionStatus}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 space-x-3">
                                            <span>Created: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                                            {assignment.dueDate && <span>Due: {formatDate(assignment.dueDate)}</span>}
                                            {assignment.maxPoints && <span>Points: {assignment.maxPoints}</span>}
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )
            )}
        </div>
        {/* Create Assignment Modal */}
        <CreateAssignmentModal details={details} show={showCreateAssignmentModal} onSuccessCallback={onModalSuccessHandler} onCancelCallback={onModalCloseHandler} />
    </>
}