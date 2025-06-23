
import React, { useEffect, useState, useCallback, FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as assignmentService from '../services/assignmentService';
import { AssignmentDetailsDto, SubmissionDto, GradeSubmissionPayload } from '../types/assignment';
import { format, parseISO, isValid } from 'date-fns';
import { Editor } from '@monaco-editor/react';
import { FaUserCircle, FaPaperPlane, FaClock, FaCheckCircle, FaInfoCircle, FaExclamationTriangle, FaSpinner, FaSave } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext'; 
import { SubmittedFilesList } from '../components/SubmittedFileList';
import { AssignmentEvaluationResult } from '../components/AssignmentEvaluationResult';
import { FrontendEvaluateResponseDto } from '../types/evaluation';

const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid Date';
    try { return format(date, 'MMM d, yyyy, h:mm a'); } catch { return 'Invalid Date'; }
};

const GradeSubmissionPage: React.FC = () => {
    const { submissionId } = useParams<{ submissionId: string }>();
    const navigate = useNavigate();
    const { user: authUser } = useAuth(); 

    const [submission, setSubmission] = useState<SubmissionDto | null>(null);
    const [assignment, setAssignment] = useState<AssignmentDetailsDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [grade, setGrade] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);
    const [gradeSubmitError, setGradeSubmitError] = useState<string | null>(null);
    const [gradeSubmitSuccess, setGradeSubmitSuccess] = useState<string | null>(null);

    const [codeFileContent, setCodeFileContent] = useState<string | null>(null);
    const [isCodeLoading, setIsCodeLoading] = useState(false);

    const fetchData = useCallback(async () => {
        if (!submissionId) {
            setError("Submission ID is missing."); setIsLoading(false); return;
        }
        setIsLoading(true); setError(null);
        try {
            const subData = await assignmentService.getSubmissionDetails(submissionId);
            setSubmission(subData);
            setGrade(subData.grade?.toString() || ''); 
            setFeedback(subData.feedback || '');

            if (subData.assignmentId) {
                const assignData = await assignmentService.getAssignmentDetails(subData.assignmentId);
                setAssignment(assignData);

                if (assignData.isCodeAssignment) {
                    const solutionFile = subData.submittedFiles.find(f => f.fileName.toLowerCase() === "solution");
                    if (solutionFile) {
                        setIsCodeLoading(true);
                        try {
                            const content = await assignmentService.getFileContent(subData.id, solutionFile.id);
                            setCodeFileContent(content);
                        } catch (contentError) {
                            console.error("Failed to load code content:", contentError);
                            setCodeFileContent("Error: Could not load solution content.");
                        } finally {
                            setIsCodeLoading(false);
                        }
                    }
                }
            }
        } catch (err: any) { setError(err.message || "Failed to load submission or assignment details."); }
        finally { setIsLoading(false); }
    }, [submissionId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleGradeSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!submission || !assignment) return;

        const gradeNum = grade.trim() === '' ? null : parseInt(grade, 10);

        if (grade.trim() !== '' && (gradeNum === null || isNaN(gradeNum))) {
            setGradeSubmitError("Grade must be a valid number or empty."); return;
        }
        if (gradeNum !== null && assignment.maxPoints != null && (gradeNum < 0 || gradeNum > assignment.maxPoints)) {
            setGradeSubmitError(`Grade must be between 0 and ${assignment.maxPoints}.`); return;
        }

        setIsSubmittingGrade(true); setGradeSubmitError(null); setGradeSubmitSuccess(null);
        const payload: GradeSubmissionPayload = {
            grade: gradeNum,
            feedback: feedback.trim() || undefined,
        };
        try {
            const updatedSubmission = await assignmentService.gradeSubmission(submission.id, payload);
            setSubmission(updatedSubmission); 
            setGrade(updatedSubmission.grade?.toString() || '');
            setFeedback(updatedSubmission.feedback || '');
            setGradeSubmitSuccess("Grade and feedback submitted successfully!");
            
        } catch (err: any) {
            setGradeSubmitError(err.message || "Failed to submit grade.");
        } finally {
            setIsSubmittingGrade(false);
        }
    };

    if (isLoading) return <div className="container mx-auto mt-10 p-6 text-center text-[#112D4E]">Loading submission...</div>;
    if (error) return <div className="container mx-auto mt-10 p-6 text-center text-red-600">Error: {error}</div>;
    if (!submission || !assignment) return <div className="container mx-auto mt-10 p-6 text-center text-[#112D4E]">Submission or Assignment not found.</div>;

    const submissionStatusInfo = submission.submittedAt
        ? (submission.isLate ? { text: 'Turned In (Late)', icon: <FaClock />, color: 'text-red-600' }
                             : { text: 'Turned In', icon: <FaPaperPlane />, color: 'text-[#3F72AF]' })
        : { text: 'In Progress (Not Turned In)', icon: <FaInfoCircle />, color: 'text-orange-500' };


    return (
        <div className="min-h-screen bg-[#F9F7F7] text-[#112D4E]">
            <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link to={`/assignments/${assignment.id}/manage`} className="text-sm text-[#3F72AF] hover:text-[#112D4E] hover:underline inline-flex items-center">
                        &larr; Back to Assignment Submissions
                    </Link>
                </div>

                <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8">
                    <div className="pb-4 mb-6 border-b border-[#DBE2EF]">
                        <h1 className="text-2xl md:text-3xl font-bold text-[#112D4E]">{assignment.title}</h1>
                        <div className="mt-2 flex items-center space-x-3 text-sm text-slate-600">
                            <FaUserCircle className="w-8 h-8 text-gray-400"/>
                            <span>Student: <span className="font-medium text-[#112D4E]">{submission.studentUsername}</span></span>
                        </div>
                        <div className={`mt-2 text-sm font-semibold flex items-center ${submissionStatusInfo.color}`}>
                            {submissionStatusInfo.icon} <span className="ml-1.5">{submissionStatusInfo.text}</span>
                            {submission.submittedAt && <span className="ml-2 font-normal text-slate-500">on {formatDate(submission.submittedAt)}</span>}
                        </div>
                    </div>

                    {/* Submitted Files & Code Viewer Section */}
                    <div className="grid grid-cols-1 gap-6 mb-8">
                        <div>
                            <SubmittedFilesList submission={submission} files={submission.submittedFiles} />
                        </div>
                        {assignment.isCodeAssignment && ( <>
                            <div className="border border-[#DBE2EF] rounded-lg p-4 bg-[#F9F7F7]">
                                <h4 className="text-md font-semibold text-[#112D4E] mb-2">Solution Code ({submission.submittedFiles.find(f=>f.fileName.toLowerCase() === 'solution')?.fileName || 'solution'})</h4>
                                {isCodeLoading && <p className="text-sm text-gray-500">Loading code...</p>}
                                {codeFileContent === null && !isCodeLoading && <p className="text-sm text-gray-500 italic">No 'solution' file content to display or failed to load.</p>}
                                {codeFileContent !== null && !isCodeLoading && (
                                    <div className="h-80 md:h-96 border border-[#DBE2EF] rounded overflow-hidden shadow-sm">
                                        <Editor
                                            height="100%" language={submission.lastEvaluatedLanguage || "c"} 
                                            theme="vs-dark" value={codeFileContent}
                                            options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false }}
                                        />
                                    </div>
                                )}
                            </div>
                            <AssignmentEvaluationResult isEvaluating={false} evaluationResult={submission.lastEvaluationDetailsJson? JSON.parse(submission.lastEvaluationDetailsJson) as FrontendEvaluateResponseDto : null} evaluationError={null} />
                        </>)}
                    </div>


                    {/* Grading Form Section */}
                    <div className="pt-6 border-t border-[#DBE2EF]">
                        <h3 className="text-xl font-semibold text-[#112D4E] mb-4">Grade Submission</h3>
                        <form onSubmit={handleGradeSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="grade" className="block text-sm font-medium text-[#112D4E] mb-1">
                                    Grade {assignment.maxPoints != null ? `(out of ${assignment.maxPoints})` : ''}
                                </label>
                                <input
                                    type="number" id="grade" value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    min="0" max={assignment.maxPoints ?? undefined} step="0.5"
                                    className="w-full sm:w-1/2 md:w-1/3 px-3 py-2 border border-[#DBE2EF] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF] text-[#112D4E]"
                                    placeholder="Enter grade"
                                />
                            </div>
                            <div>
                                <label htmlFor="feedback" className="block text-sm font-medium text-[#112D4E] mb-1">
                                    Feedback <span className="text-xs text-gray-500">(Optional)</span>
                                </label>
                                <textarea
                                    id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={5}
                                    className="w-full px-3 py-2 border border-[#DBE2EF] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF] text-[#112D4E]"
                                    placeholder="Provide feedback to the student..."
                                />
                            </div>

                            {gradeSubmitError && <p className="text-sm text-red-600 p-2 bg-red-100 rounded border border-red-200">{gradeSubmitError}</p>}
                            {gradeSubmitSuccess && <p className="text-sm text-green-600 p-2 bg-green-100 rounded border border-green-200">{gradeSubmitSuccess}</p>}

                            <div className="flex justify-end">
                                <button
                                    type="submit" disabled={isSubmittingGrade}
                                    className="flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-[#3F72AF] rounded-lg shadow-md hover:bg-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:ring-offset-2 disabled:opacity-70 transition-colors duration-150"
                                >
                                    {isSubmittingGrade && <FaSpinner className="animate-spin mr-2" />}
                                    {isSubmittingGrade ? 'Submitting...' : 'Submit Grade & Feedback'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GradeSubmissionPage;