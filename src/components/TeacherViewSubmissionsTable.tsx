
import React, { useMemo, useState, useEffect, JSX } from "react";
import { AssignmentDetailsDto, TeacherSubmissionViewDto } from "../types/assignment";
import { format, parseISO, isValid } from "date-fns";
import {
    FaUserCircle, FaCheckCircle, FaTimesCircle, FaExclamationTriangle,
    FaCog, FaHourglassHalf, FaFileArchive, FaQuestionCircle, FaEdit,
    FaSpinner, FaClipboardList, FaMemory, FaInfoCircle, FaSearch,
    FaChevronLeft, FaChevronRight,
    FaUndo
} from 'react-icons/fa';
import { EvaluationStatus } from "../types/evaluation"; 
import * as assignmentService from '../services/assignmentService';
import { useNavigate } from "react-router-dom";


const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '–';
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid Date';
    try { return format(date, 'MMM d, yyyy HH:mm'); } catch { return 'Invalid Date'; }
};

const getStatusInfo = (statusKey: string): {
    bgColor: string,
    textColor: string,
    icon: JSX.Element,
    label: string
} => {
    const normalizedStatus = statusKey.toString().toUpperCase();
    let displayLabel = statusKey.toString().replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
    displayLabel = displayLabel.charAt(0).toUpperCase() + displayLabel.slice(1).toLowerCase();
    if (normalizedStatus === "NOT SUBMITTED") displayLabel = "Not Submitted"; 
    switch (normalizedStatus) {
        case EvaluationStatus.Accepted.toUpperCase(): 
            return { bgColor: 'bg-blue-100', textColor: 'text-[#3F72AF]', icon: <FaCheckCircle className="text-[#3F72AF]" />, label: displayLabel };
        case EvaluationStatus.WrongAnswer.toUpperCase():
            return { bgColor: 'bg-red-100', textColor: 'text-red-700', icon: <FaTimesCircle className="text-red-600" />, label: displayLabel };
        case EvaluationStatus.CompileError.toUpperCase():
            return { bgColor: 'bg-orange-100', textColor: 'text-orange-700', icon: <FaExclamationTriangle className="text-orange-600" />, label: displayLabel };
        case EvaluationStatus.RuntimeError.toUpperCase():
            return { bgColor: 'bg-red-100', textColor: 'text-red-700', icon: <FaCog className="text-red-600" />, label: displayLabel };
        case EvaluationStatus.TimeLimitExceeded.toUpperCase():
            return { bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', icon: <FaHourglassHalf className="text-yellow-600" />, label: displayLabel };
        case EvaluationStatus.MemoryLimitExceeded.toUpperCase(): 
            return { bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', icon: <FaMemory className="text-yellow-600" />, label: displayLabel };
        case "SUBMITTED": 
        case "SUBMITTED (LATE)":
            return { bgColor: 'bg-blue-100', textColor: 'text-[#3F72AF]', icon: <FaCheckCircle className="text-[#3F72AF]" />, label: displayLabel };
        case "GRADED":
            return { bgColor: 'bg-green-100', textColor: 'text-green-700', icon: <FaCheckCircle className="text-green-600" />, label: displayLabel };
        case "IN PROGRESS":
            return { bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', icon: <FaHourglassHalf className="text-yellow-600" />, label: displayLabel };
        case "NOT SUBMITTED":
            return { bgColor: 'bg-gray-100', textColor: 'text-gray-600', icon: <FaInfoCircle className="text-gray-500" />, label: displayLabel };
        default:
            return { bgColor: 'bg-gray-100', textColor: 'text-gray-700', icon: <FaQuestionCircle className="text-gray-500" />, label: displayLabel || "Unknown" };
    }
};

const ITEMS_PER_PAGE = 10;

interface TeacherViewSubmissionsTableProps {
    assignmentDetails: AssignmentDetailsDto;
    submissions: TeacherSubmissionViewDto[];
    isLoadingSubmissions: boolean; 
    fetchSubmissionsError: string | null;
    refreshSubmissions: () => Promise<void>; 
}

export const TeacherViewSubmissionsTable: React.FC<TeacherViewSubmissionsTableProps> = ({
    assignmentDetails,
    submissions,
    isLoadingSubmissions,
    fetchSubmissionsError,
    refreshSubmissions
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [unsubmittingSubmissionId, setUnsubmittingSubmissionId] = useState<number | null>(null);
    const [unsubmitError, setUnsubmitError] = useState<string | null>(null);
    const navigate = useNavigate();

    const filteredSubmissions = useMemo(() => {
        return submissions.filter(sub =>
            sub.studentUsername.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [submissions, searchTerm]);

    const totalPages = Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE);

    const paginatedSubmissions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredSubmissions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredSubmissions, currentPage]);

    useEffect(() => {
        setCurrentPage(1); 
    }, [searchTerm, submissions]);

    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    const handleViewSubmission = (submissionId: number | null | undefined, studentUsername: string) => {
        if (!submissionId) {
            alert(`No submission to view for ${studentUsername}.`);
            return;
        }
        navigate(`/submissions/${submissionId}/grade`); 
    };

    if (isLoadingSubmissions) {
        return (
            <div className="bg-white p-6 shadow-xl rounded-2xl text-center text-[#112D4E] mt-8">
                <div className="flex flex-col items-center justify-center py-10 text-[#3F72AF]">
                    <FaSpinner className="animate-spin h-8 w-8 mb-3" />
                    <p className="text-sm font-medium text-[#112D4E]">Loading student submissions...</p>
                </div>
            </div>
        );
    }
    if (fetchSubmissionsError) {
        return (
            <div className="bg-white p-6 shadow-xl rounded-2xl text-center text-red-700 mt-8">
                <div className="p-4 my-4 bg-red-50 border-2 border-red-300 rounded-lg flex flex-col items-center justify-center">
                    <FaExclamationTriangle className="h-8 w-8 mb-2 text-red-600" />
                    <p className="font-semibold">Error Loading Submissions</p>
                    <p className="text-sm">{fetchSubmissionsError}</p>
                </div>
            </div>
        );
    }

    const handleUnsubmit = async (submissionId: number, studentUsername: string) => {
        if (!window.confirm(`Are you sure you want to "unsubmit" the assignment for ${studentUsername}? This will revert their submission to 'In Progress' and clear any existing grade/feedback for this turn-in.`)) {
            return;
        }
        setUnsubmittingSubmissionId(submissionId);
        setUnsubmitError(null);
        try {
            await assignmentService.unsubmitStudentSubmission(submissionId);
            await refreshSubmissions(); 
            
        } catch (err: any) {
            setUnsubmitError(err.message || "Failed to unsubmit.");
            alert(`Error: ${err.message || "Failed to unsubmit."}`); 
        } finally {
            setUnsubmittingSubmissionId(null);
        }
    };

    return (
        <div className="bg-white p-4 md:p-6 shadow-xl rounded-2xl text-[#112D4E] mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-[#DBE2EF]">
                <h2 className="text-2xl font-bold text-[#112D4E] mb-3 sm:mb-0">
                    Student Submissions
                    <span className="text-base font-normal text-gray-500 ml-2">({filteredSubmissions.length} / {submissions.length})</span>
                </h2>
                {/* Search Bar */}
                <div className="w-full sm:w-auto sm:max-w-xs relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by student name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 border border-[#DBE2EF] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-transparent sm:text-sm text-[#112D4E] bg-white"
                    />
                </div>
            </div>

            {paginatedSubmissions.length === 0 && (
                <div className="text-center py-10 px-6">
                    <FaClipboardList size={48} className="mx-auto text-[#DBE2EF]" />
                    <p className="mt-4 text-lg text-[#112D4E]">
                        {searchTerm ? `No submissions found matching "${searchTerm}".` : "No submissions to display."}
                    </p>
                    {!searchTerm && <p className="text-sm text-gray-500 mt-1">Students may not have submitted yet, or there are no students in the class.</p>}
                </div>
            )}

            {paginatedSubmissions.length > 0 && (
                <>
                    <div className="overflow-x-auto rounded-lg border border-[#DBE2EF] shadow-sm">
                        <table className="min-w-full divide-y divide-[#DBE2EF]">
                            <thead className="bg-[#F9F7F7]">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#112D4E] uppercase tracking-wider">Student</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#112D4E] uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#112D4E] uppercase tracking-wider">Submitted At</th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-[#112D4E] uppercase tracking-wider">Grade</th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-[#112D4E] uppercase tracking-wider">Files</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#112D4E] uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-[#DBE2EF]">
                                {paginatedSubmissions.map((sub) => {
                                    const statusInfo = getStatusInfo(sub.status);
                                    const isTurnedIn = sub.submittedAt != null;
                                    return (
                                        <tr key={sub.studentId} className="hover:bg-[#F9F7F7] transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        {sub.profilePhotoUrl ? (
                                                            <img className="h-10 w-10 rounded-full object-cover border border-gray-200" src={sub.profilePhotoUrl} alt={sub.studentUsername} />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-[#DBE2EF] flex items-center justify-center text-[#3F72AF] font-semibold text-lg">
                                                                {sub.studentUsername.substring(0, 1).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-[#112D4E]">{sub.studentUsername}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2.5 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                                                    {React.cloneElement(statusInfo.icon, { className: "mr-1.5 h-3.5 w-3.5" })}
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDate(sub.submittedAt)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium text-center">{sub.grade?.toString() ?? '–'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                {sub.hasFiles ?
                                                    <FaFileArchive className="text-[#3F72AF] inline-block" title="Files attached" /> :
                                                    <span className="text-gray-400">–</span>
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleViewSubmission(sub.submissionId, sub.studentUsername)}
                                                        disabled={!sub.submissionId}
                                                        className="text-[#3F72AF] hover:text-[#112D4E] hover:underline disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline flex items-center text-xs p-1"
                                                        title="View or Grade Submission"
                                                    >
                                                        <FaEdit className="mr-1"/> View/Grade
                                                    </button>
                                                    {isTurnedIn && sub.submissionId && ( 
                                                        <button
                                                            onClick={() => handleUnsubmit(sub.submissionId!, sub.studentUsername)}
                                                            disabled={unsubmittingSubmissionId === sub.submissionId}
                                                            className="text-yellow-600 hover:text-yellow-800 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center text-xs p-1 hover:bg-yellow-50 rounded"
                                                            title="Revert submission to 'In Progress'"
                                                        >
                                                            {unsubmittingSubmissionId === sub.submissionId ? (
                                                                <FaSpinner className="animate-spin mr-1" />
                                                            ) : (
                                                                <FaUndo className="mr-1" />
                                                            )}
                                                            {unsubmittingSubmissionId === sub.submissionId ? 'Processing...' : 'Unsubmit'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex justify-between items-center text-sm text-[#112D4E]">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-[#DBE2EF] bg-white rounded-md hover:bg-[#F9F7F7] text-[#3F72AF] disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                            >
                                <FaChevronLeft className="mr-2 h-3 w-3" /> Previous
                            </button>
                            <span className="text-slate-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-[#DBE2EF] bg-white rounded-md hover:bg-[#F9F7F7] text-[#3F72AF] disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                            >
                                Next <FaChevronRight className="ml-2 h-3 w-3" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};