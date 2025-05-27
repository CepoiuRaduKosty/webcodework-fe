// src/components/ClassroomAssignmentsSection.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react'; // Added React and useMemo
import { AssignmentBasicDto } from "../types/assignment";
import { ClassroomDetailsDto, ClassroomRole } from "../types/classroom";
import * as assignmentService from '../services/assignmentService';
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { CreateAssignmentModal } from "./modals/CreateAssignmentModal"; // Assuming modal is here
import { FaSearch, FaPlus, FaChevronLeft, FaChevronRight, FaExclamationCircle, FaClipboardList } from 'react-icons/fa'; // Example icons

const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try { return format(parseISO(dateString), 'PPp'); } catch { return 'Invalid Date'; }
};

const ITEMS_PER_PAGE = 10;

export const ClassroomAssignmentsSection: React.FC<{ details: ClassroomDetailsDto }> = ({ details }) => {
    const [assignments, setAssignments] = useState<AssignmentBasicDto[]>([]);
    const [isLoadingAssignments, setIsLoadingAssignments] = useState<boolean>(true);
    const [assignmentError, setAssignmentError] = useState<string | null>(null);
    const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);

    // --- NEW State for Search and Pagination ---
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    // -------------------------------------------

    const fetchAssignments = useCallback(async () => {
        if (!details?.id) return;
        setIsLoadingAssignments(true);
        setAssignmentError(null);
        try {
            const data = await assignmentService.getAssignmentsForClassroom(details.id);
            // Backend already sorts by CreatedAt descending
            setAssignments(data);
        } catch (err: any) {
            setAssignmentError(err.message || 'Failed to load assignments.');
        } finally {
            setIsLoadingAssignments(false);
        }
    }, [details?.id]); // Depend on details.id

    useEffect(() => {
        if (details?.id) { // Fetch only if details.id is available
            fetchAssignments();
        }
    }, [fetchAssignments]); // fetchAssignments callback depends on details.id

    const onModalCloseHandler = () => setShowCreateAssignmentModal(false);
    const onModalSuccessHandler = async () => {
        setShowCreateAssignmentModal(false);
        await fetchAssignments();
    };

    const canCreateAssignments = details.currentUserRole === ClassroomRole.Owner || details.currentUserRole === ClassroomRole.Teacher;
    const isTeacherOrOwner = details.currentUserRole === ClassroomRole.Owner || details.currentUserRole === ClassroomRole.Teacher;

    // --- Filtered and Paginated Assignments ---
    const filteredAssignments = useMemo(() => {
        return assignments.filter(assignment =>
            assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [assignments, searchTerm]);

    const totalPages = Math.ceil(filteredAssignments.length / ITEMS_PER_PAGE);

    const paginatedAssignments = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAssignments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAssignments, currentPage]);

    // Reset to page 1 if search term changes and current page becomes invalid
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    // --------------------------------------------

    return (
        <>
            {/* Assignments Section (Main Column) */}
            <div className="lg:col-span-2 bg-white p-4 md:p-6 shadow-xl rounded-2xl text-[#112D4E]">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-[#DBE2EF]">
                    <h2 className="text-2xl font-bold text-[#112D4E] mb-3 sm:mb-0">Assignments</h2>
                    {canCreateAssignments && (
                        <button
                            onClick={() => setShowCreateAssignmentModal(true)}
                            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#3F72AF] rounded-md hover:bg-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:ring-offset-2 transition-colors duration-150"
                        >
                            <FaPlus className="mr-2 h-4 w-4" /> Create Assignment
                        </button>
                    )}
                </div>

                {/* Search Bar */}
                <div className="mb-6 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search assignments by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-[#DBE2EF] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-transparent sm:text-sm text-[#112D4E] bg-white"
                    />
                </div>

                {/* Assignment List */}
                {isLoadingAssignments && (
                    <div className="flex justify-center items-center py-10">
                        <svg className="animate-spin h-8 w-8 text-[#3F72AF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="ml-3 text-[#112D4E]">Loading assignments...</p>
                    </div>
                )}
                {assignmentError && (
                    <div className="p-4 my-4 bg-red-50 text-red-700 border border-red-300 rounded-md text-center flex items-center justify-center">
                        <FaExclamationCircle className="inline mr-2 h-5 w-5" /> Error: {assignmentError}
                    </div>
                )}
                {!isLoadingAssignments && !assignmentError && (
                    paginatedAssignments.length === 0 ? (
                        searchTerm ? (
                             <p className="text-center py-10 text-gray-500 italic">No assignments found matching "{searchTerm}".</p>
                        ) : (
                            <div className="text-center py-10 px-6">
                                <FaClipboardList size={48} className="mx-auto text-[#DBE2EF]" />
                                <p className="mt-4 text-lg text-[#112D4E]">No assignments created yet.</p>
                                {canCreateAssignments && <p className="text-sm text-gray-500 mt-1">Why not create one?</p>}
                            </div>
                        )
                    ) : (
                        <ul className="space-y-4">
                            {paginatedAssignments.map((assignment) => {
                                const assignmentLink = isTeacherOrOwner
                                    ? `/assignments/${assignment.id}/manage`
                                    : `/assignments/${assignment.id}`;
                                const statusStyles = assignment.submissionStatus === 'Graded' ? 'bg-green-100 text-green-800' :
                                                     assignment.submissionStatus?.includes('Submitted') ? 'bg-blue-100 text-blue-800' :
                                                     'bg-gray-100 text-gray-700'; // Default/Not Submitted/In Progress

                                return (
                                    <li key={assignment.id} className="bg-white border border-[#DBE2EF] rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <Link to={assignmentLink} className="block p-4">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-semibold text-lg text-[#3F72AF] group-hover:text-[#112D4E] transition-colors">
                                                    {assignment.title}
                                                </span>
                                                {assignment.submissionStatus && (
                                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles}`}>
                                                        {assignment.submissionStatus}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500 space-x-1 sm:space-x-3 flex flex-wrap items-center">
                                                <span>Created: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                                                {assignment.dueDate && <span className="hidden sm:inline">|</span>}
                                                {assignment.dueDate && <span>Due: {formatDate(assignment.dueDate)}</span>}
                                                {assignment.maxPoints != null && <span className="hidden sm:inline">|</span>}
                                                {assignment.maxPoints != null && <span>Points: {assignment.maxPoints}</span>}
                                                {assignment.isCodeAssignment && <span className="hidden sm:inline">|</span>}
                                                {assignment.isCodeAssignment && <span className="font-semibold text-[#3F72AF]">Code Assignment</span>}
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && !isLoadingAssignments && !assignmentError && paginatedAssignments.length > 0 && (
                    <div className="mt-8 flex justify-between items-center text-sm">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-[#DBE2EF] rounded-md hover:bg-[#DBE2EF] text-[#3F72AF] disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                        >
                           <FaChevronLeft className="mr-2 h-3 w-3"/> Previous
                        </button>
                        <span className="text-slate-600">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-[#DBE2EF] rounded-md hover:bg-[#DBE2EF] text-[#3F72AF] disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                        >
                            Next <FaChevronRight className="ml-2 h-3 w-3"/>
                        </button>
                    </div>
                )}
            </div>

            {/* Create Assignment Modal */}
            {details && ( // Ensure details is loaded before rendering modal if it depends on it
                <CreateAssignmentModal
                    details={details}
                    show={showCreateAssignmentModal}
                    onSuccessCallback={onModalSuccessHandler}
                    onCancelCallback={onModalCloseHandler}
                />
            )}
        </>
    );
};