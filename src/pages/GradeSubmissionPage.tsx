
import React, { useEffect, useState, useCallback, FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as assignmentService from '../services/assignmentService';
import * as evaluationService from '../services/evaluationService';
import { AssignmentDetailsDto, SubmissionDto, GradeSubmissionPayload } from '../types/assignment';
import { LegitimacyEvaluationDto } from '../types/evaluation';
import { format, parseISO, isValid } from 'date-fns';
import { Editor } from '@monaco-editor/react';
import { FaUserCircle, FaPaperPlane, FaClock, FaCheckCircle, FaInfoCircle, FaExclamationTriangle, FaSpinner, FaSave, FaRobot, FaTimes, FaQuestionCircle } from 'react-icons/fa';
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

    const [legitimacyEvaluation, setLegitimacyEvaluation] = useState<LegitimacyEvaluationDto | null>(null);
    const [isRequestingEvaluation, setIsRequestingEvaluation] = useState(false);
    const [showEvaluationModal, setShowEvaluationModal] = useState(false);
    const [evaluationError, setEvaluationError] = useState<string | null>(null);

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

                    // Try to load existing legitimacy evaluation for code assignments
                    try {
                        const existingEval = await evaluationService.getLegitimacyEvaluation(subData.id);
                        setLegitimacyEvaluation(existingEval);
                    } catch (evalError) {
                        // No existing evaluation found, which is fine
                        console.debug("No existing evaluation found:", evalError);
                    }
                }
            }
        } catch (err: any) { setError(err.message || "Failed to load submission or assignment details."); }
        finally { setIsLoading(false); }
    }, [submissionId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRequestAIEvaluation = async (forceRevaluation: boolean = false) => {
        if (!submissionId) return;
        setIsRequestingEvaluation(true);
        setEvaluationError(null);
        setShowEvaluationModal(false);
        
        try {
            const result = await evaluationService.requestLegitimacyEvaluation(parseInt(submissionId), forceRevaluation);
            setLegitimacyEvaluation(result);
            setShowEvaluationModal(true);
        } catch (err: any) {
            const errorMsg = err.detail || err.message || "Failed to request AI evaluation.";
            setEvaluationError(errorMsg);
            alert(`Error: ${errorMsg}`);
        } finally {
            setIsRequestingEvaluation(false);
        }
    };

    const handleViewAIEvaluation = async () => {
        if (!submissionId) return;
        setIsRequestingEvaluation(true);
        setEvaluationError(null);
        setShowEvaluationModal(false);
        
        try {
            const result = await evaluationService.getLegitimacyEvaluation(parseInt(submissionId));
            setLegitimacyEvaluation(result);
            setShowEvaluationModal(true);
        } catch (err: any) {
            const errorMsg = err.detail || err.message || "No evaluation found. Would you like to request one?";
            setEvaluationError(errorMsg);
            alert(`Error: ${errorMsg}`);
        } finally {
            setIsRequestingEvaluation(false);
        }
    };

    const getStatusColorForLegitimacy = (status: string): { bgColor: string; textColor: string; icon: React.JSX.Element } => {
        const normalizedStatus = status?.toLowerCase().trim() || '';
        switch (normalizedStatus) {
            case 'legitimate':
                return { bgColor: 'bg-green-100', textColor: 'text-green-700', icon: <FaCheckCircle className="text-green-600" /> };
            case 'suspicious':
                return { bgColor: 'bg-red-100', textColor: 'text-red-700', icon: <FaExclamationTriangle className="text-red-600" /> };
            case 'inconclusive':
                return { bgColor: 'bg-amber-100', textColor: 'text-amber-700', icon: <FaQuestionCircle className="text-amber-600" /> };
            default:
                return { bgColor: 'bg-slate-100', textColor: 'text-slate-700', icon: <FaInfoCircle className="text-slate-600" /> };
        }
    };

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
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-md font-semibold text-[#112D4E]">Solution Code ({submission.submittedFiles.find(f=>f.fileName.toLowerCase() === 'solution')?.fileName || 'solution'})</h4>
                                    {assignment.isCodeAssignment && (
                                        <button
                                            onClick={() => {
                                                if (legitimacyEvaluation) {
                                                    handleViewAIEvaluation();
                                                } else {
                                                    handleRequestAIEvaluation();
                                                }
                                            }}
                                            disabled={isRequestingEvaluation}
                                            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                                            title={legitimacyEvaluation ? "View AI evaluation" : "Request AI legitimacy evaluation"}
                                        >
                                            {isRequestingEvaluation ? (
                                                <>
                                                    <FaSpinner className="animate-spin" />
                                                    <span>Evaluating...</span>
                                                </>
                                            ) : legitimacyEvaluation ? (
                                                <>
                                                    <FaRobot />
                                                    <span>View AI Eval</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaRobot />
                                                    <span>Request AI Eval</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
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

            {/* AI Legitimacy Evaluation Modal */}
            {showEvaluationModal && legitimacyEvaluation && legitimacyEvaluation.confidenceScore !== undefined && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-4 flex items-center justify-between sticky top-0">
                            <div className="flex items-center">
                                <FaRobot className="mr-3 h-6 w-6" />
                                <h3 className="text-lg font-semibold">AI Legitimacy Evaluation</h3>
                            </div>
                            <button
                                onClick={() => {
                                    setShowEvaluationModal(false);
                                }}
                                className="text-white hover:bg-purple-700 p-2 rounded-lg transition-colors"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Status Badge */}
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-[#112D4E]">Status</h4>
                                <div className={`px-4 py-2 rounded-full flex items-center space-x-2 ${getStatusColorForLegitimacy(legitimacyEvaluation.status).bgColor} ${getStatusColorForLegitimacy(legitimacyEvaluation.status).textColor}`}>
                                    {getStatusColorForLegitimacy(legitimacyEvaluation.status).icon}
                                    <span className="font-semibold capitalize">{legitimacyEvaluation.status}</span>
                                </div>
                            </div>

                            {/* Confidence Score */}
                            <div className="border-t border-[#DBE2EF] pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-semibold text-[#112D4E]">Confidence Score</h4>
                                    <span className="text-lg font-bold text-purple-600">
                                        {typeof legitimacyEvaluation.confidenceScore === 'number' ? legitimacyEvaluation.confidenceScore.toFixed(1) : 'N/A'}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all ${
                                            legitimacyEvaluation.confidenceScore >= 80 ? 'bg-green-500' :
                                            legitimacyEvaluation.confidenceScore >= 50 ? 'bg-yellow-500' :
                                            'bg-red-500'
                                        }`}
                                        style={{ width: `${typeof legitimacyEvaluation.confidenceScore === 'number' ? legitimacyEvaluation.confidenceScore : 0}%` }}
                                    />
                                </div>
                            </div>

                            {/* Analysis */}
                            <div className="border-t border-[#DBE2EF] pt-4">
                                <h4 className="text-sm font-semibold text-[#112D4E] mb-2">Analysis</h4>
                                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    {legitimacyEvaluation.analysis}
                                </p>
                            </div>

                            {/* Metadata */}
                            <div className="border-t border-[#DBE2EF] pt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <h5 className="text-xs font-semibold text-[#112D4E] uppercase tracking-wider text-gray-500">AI Model</h5>
                                    <p className="text-sm text-[#112D4E] font-medium mt-1">{legitimacyEvaluation.evaluatedByModel}</p>
                                </div>
                                <div>
                                    <h5 className="text-xs font-semibold text-[#112D4E] uppercase tracking-wider text-gray-500">Evaluated At</h5>
                                    <p className="text-sm text-[#112D4E] font-medium mt-1">
                                        {formatDate(legitimacyEvaluation.evaluatedAt)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 border-t border-[#DBE2EF] flex justify-between sticky bottom-0">
                            <button
                                onClick={() => handleRequestAIEvaluation(true)}
                                disabled={isRequestingEvaluation}
                                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isRequestingEvaluation ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        <span>Re-evaluating...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaRobot />
                                        <span>Re-evaluate</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setShowEvaluationModal(false)}
                                className="px-4 py-2 bg-[#3F72AF] text-white rounded-lg hover:bg-[#112D4E] transition-colors font-medium text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GradeSubmissionPage;