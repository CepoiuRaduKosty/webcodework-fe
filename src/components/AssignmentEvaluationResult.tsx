
import React, { JSX, useState } from 'react';
import { EvaluationStatus, FrontendEvaluateResponseDto } from "../types/evaluation";
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaCog, FaHourglassHalf, FaMemory, FaFire, FaQuestionCircle, FaEyeSlash, FaEye, FaExclamationCircle, FaTerminal, FaTools } from 'react-icons/fa'; 


const getStatusInfo = (status: EvaluationStatus | string): {
    bgColor: string,
    textColor: string,
    borderColor: string,
    icon: JSX.Element,
    label: string
} => {
    const normalizedStatus = status.toString().toUpperCase(); 
    let displayLabel: string;

    
    switch (normalizedStatus) {
        case EvaluationStatus.Accepted.toUpperCase(): 
            displayLabel = "Accepted";
            break;
        case EvaluationStatus.WrongAnswer.toUpperCase():
            displayLabel = "Wrong Answer";
            break;
        case EvaluationStatus.CompileError.toUpperCase():
            displayLabel = "Compilation Error";
            break;
        case EvaluationStatus.RuntimeError.toUpperCase():
            displayLabel = "Runtime Error";
            break;
        case EvaluationStatus.TimeLimitExceeded.toUpperCase():
            displayLabel = "Time Limit Exceeded";
            break;
        case EvaluationStatus.MemoryLimitExceeded.toUpperCase():
            displayLabel = "Memory Limit Exceeded";
            break;
        case EvaluationStatus.FileError.toUpperCase():
            displayLabel = "File Processing Error"; 
            break;
        case EvaluationStatus.LanguageNotSupported.toUpperCase():
            displayLabel = "Language Not Supported";
            break;
        case EvaluationStatus.InternalError.toUpperCase():
            displayLabel = "System Error"; 
            break;
        default:
            
            displayLabel = status.toString().replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(); 
            displayLabel = displayLabel.charAt(0).toUpperCase() + displayLabel.slice(1).toLowerCase(); 
            if (!displayLabel) displayLabel = "Unknown Status";
            break;
    }

    switch (normalizedStatus) {
        case EvaluationStatus.Accepted: 
            return { bgColor: 'bg-blue-50', textColor: 'text-[#3F72AF]', borderColor: 'border-[#3F72AF]', icon: <FaCheckCircle className="text-[#3F72AF]" />, label: displayLabel };
        case EvaluationStatus.WrongAnswer:
            return { bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-600', icon: <FaTimesCircle className="text-red-500" />, label: displayLabel };
        case EvaluationStatus.CompileError:
            return { bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-600', icon: <FaExclamationTriangle className="text-orange-500" />, label: displayLabel };
        case EvaluationStatus.RuntimeError:
            return { bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-600', icon: <FaCog className="text-red-500" />, label: displayLabel };
        case EvaluationStatus.TimeLimitExceeded:
            return { bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-600', icon: <FaHourglassHalf className="text-yellow-500" />, label: displayLabel };
        case EvaluationStatus.MemoryLimitExceeded:
            return { bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-600', icon: <FaMemory className="text-yellow-500" />, label: displayLabel };
        case EvaluationStatus.FileError:
        case EvaluationStatus.InternalError:
        case EvaluationStatus.LanguageNotSupported:
            return { bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-600', icon: <FaFire className="text-red-500" />, label: displayLabel };
        default: 
            return { bgColor: 'bg-gray-100', textColor: 'text-gray-700', borderColor: 'border-gray-400', icon: <FaQuestionCircle className="text-gray-500" />, label: displayLabel };
    }
};

const CollapsibleOutput: React.FC<{ title: string; content?: string | null; language?: string }> = ({ title, content, language = "plaintext" }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    if (content == null) return null;

    return (
        <details className="mt-3 text-sm group" open={isOpen} onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
            <summary className="cursor-pointer font-medium text-[#3F72AF] hover:text-[#112D4E] select-none list-none flex items-center py-1">
                {isOpen ? <FaTimesCircle className="mr-2 text-sm" /> : <FaTerminal className="mr-2 text-sm" />}
                {title}
                <span className="ml-1.5 text-xs text-gray-400 group-hover:text-gray-600">{isOpen ? '(Hide)' : '(Show)'}</span>
            </summary>
            <pre className="mt-1 p-3 bg-[#112D4E] text-[#F9F7F7] text-xs rounded-md overflow-x-auto max-h-60 shadow-inner">
                <code>{content.length > 0 ? content : "<empty output>"}</code>
            </pre>
        </details>
    );
};

export const AssignmentEvaluationResult: React.FC<{
    isEvaluating: boolean;
    evaluationResult: FrontendEvaluateResponseDto | null;
    evaluationError: string | null;
}> = ({ isEvaluating, evaluationResult, evaluationError }) => {

    console.log(evaluationResult)

    if (isEvaluating && !evaluationResult && !evaluationError) {
        return (
            <div className="flex items-center text-[#3F72AF] p-4 bg-[#DBE2EF] border border-[#3F72AF] rounded-lg shadow">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#3F72AF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing your solution... please wait.
            </div>
        );
    }

    if (evaluationError) {
        return (
            <div className="p-4 bg-red-100 text-red-800 border-2 border-red-300 rounded-lg shadow-md">
                <div className="flex items-center">
                    <FaExclamationTriangle className="h-6 w-6 mr-3 text-red-600" />
                    <p className="font-semibold text-lg">Evaluation Request Error</p>
                </div>
                <p className="mt-1 text-sm">{evaluationError}</p>
            </div>
        );
    }

    if (!evaluationResult) {
        return <div className="p-4 text-center text-gray-500 italic">No evaluation results to display yet.</div>;
    }

    
    let overallStatusMessage = evaluationResult.overallStatus;
    let overallStatusStyles = getStatusInfo(evaluationResult.overallStatus as EvaluationStatus);

    if (!evaluationResult.compilationSuccess) {
        overallStatusMessage = "Compilation Failed";
        overallStatusStyles = getStatusInfo(EvaluationStatus.CompileError);
    } else if (evaluationResult.overallStatus === EvaluationStatus.Accepted) {
        overallStatusMessage = "All Tests Passed!";
    } else if (evaluationResult.results.some(r => r.status !== EvaluationStatus.Accepted)) {
        overallStatusMessage = "Some Tests Failed";
        
        if (evaluationResult.overallStatus !== EvaluationStatus.WrongAnswer &&
            evaluationResult.overallStatus !== EvaluationStatus.RuntimeError &&
            evaluationResult.overallStatus !== EvaluationStatus.TimeLimitExceeded &&
            evaluationResult.overallStatus !== EvaluationStatus.MemoryLimitExceeded) {
            
            overallStatusStyles = getStatusInfo(EvaluationStatus.WrongAnswer); 
        }
    }


    return (
        
        <div className="p-4 md:p-6 bg-white border border-[#DBE2EF] rounded-xl shadow-lg space-y-6 text-[#112D4E]">

            {/* Overall Summary - No separate box, integrated */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#DBE2EF]">
                <div>
                    <h4 className={`text-xl font-bold ${overallStatusStyles.textColor} flex items-center mb-1 sm:mb-0`}>
                        <span className="mr-3 text-2xl">{overallStatusStyles.icon}</span>
                        {overallStatusMessage}
                    </h4>
                    <p className={`text-sm ${overallStatusStyles.textColor}`}>
                        Compilation: <span className="font-medium">{evaluationResult.compilationSuccess ? 'Successful' : 'Failed'}</span>
                        {evaluationResult.evaluatedLanguage && (
                            <span className="ml-2 text-xs text-slate-500">(Language: {evaluationResult.evaluatedLanguage.toUpperCase()})</span>
                        )}
                    </p>
                </div>
                {(evaluationResult.pointsObtained !== null && evaluationResult.pointsObtained !== undefined) &&
                    (evaluationResult.totalPossiblePoints !== null && evaluationResult.totalPossiblePoints !== undefined) && (
                        <div className={`mt-2 sm:mt-0 text-right`}>
                            <span className="text-sm text-[#112D4E]">Score</span>
                            <span className={`block px-4 py-1.5 rounded-md text-xl font-semibold 
                            ${evaluationResult.compilationSuccess && evaluationResult.overallStatus === EvaluationStatus.Accepted ? 'bg-[#3F72AF] text-white' :
                                    !evaluationResult.compilationSuccess || evaluationResult.overallStatus === EvaluationStatus.CompileError || evaluationResult.overallStatus === EvaluationStatus.InternalError || evaluationResult.overallStatus === EvaluationStatus.FileError ? 'bg-[#3F72AF] text-white' :
                                        'bg-[#3F72AF] text-white' 
                                }`}>
                                {evaluationResult.pointsObtained} / {evaluationResult.totalPossiblePoints}
                            </span>
                        </div>
                    )}
            </div>

            {/* Compiler Output (if any, especially if compilation failed) */}
            {evaluationResult.compilerOutput && (
                <div className="p-4 border border-[#DBE2EF] rounded-lg bg-[#DBE2EF]"> {/* Palette: Light Blue/Gray bg */}
                    <h5 className="text-md font-semibold text-[#112D4E] mb-1 flex items-center">
                        <FaTools className="mr-2 text-[#3F72AF]" /> Compiler Output:
                    </h5>
                    <CollapsibleOutput title="View Details" content={evaluationResult.compilerOutput} />
                </div>
            )}

            {/* Test Case Results */}
            {evaluationResult.compilationSuccess && evaluationResult.results.length > 0 && (
                <div className="space-y-3">
                    <h5 className="text-lg font-semibold text-[#112D4E] border-b border-[#DBE2EF] pb-2">Test Case Breakdown:</h5>
                    {evaluationResult.results.map((res, index) => {
                        const tcStatusInfo = getStatusInfo(res.status as EvaluationStatus);
                        
                        const displayName = res.testCaseName || res.testCaseId || `Test Case #${index + 1}`;

                        return (
                            <div key={res.testCaseId || index} className={`p-3.5 border-l-4 ${tcStatusInfo.borderColor} bg-[#F9F7F7] rounded-r-md shadow-sm`}>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <p className={`font-medium text-md ${tcStatusInfo.textColor} flex items-center`}>
                                        <span className="mr-2 text-lg">{tcStatusInfo.icon}</span>
                                        {displayName}:
                                        <span className="font-bold ml-2">{tcStatusInfo.label}</span>
                                    </p>
                                    {res.durationMs !== null && res.durationMs !== undefined && (
                                        <p className={`text-xs mt-1 sm:mt-0 ${tcStatusInfo.textColor}`}>
                                            Time: <span className="font-medium">{res.durationMs}ms</span>
                                        </p>
                                    )}
                                </div>

                                {res.message && !res.isPrivate && (
                                    <p className={`text-xs mt-2 pl-7 italic ${tcStatusInfo.textColor}`}>{res.message}</p>
                                )}
                                {res.maximumMemoryException && ( 
                                    <p className={`text-xs mt-1 pl-7 font-semibold ${getStatusInfo(EvaluationStatus.MemoryLimitExceeded).textColor} flex items-center`}>
                                        <FaMemory className="mr-1.5" /> (Exceeded Memory Limit)
                                    </p>
                                )}

                                {res.isPrivate ? (
                                    <p className="text-xs mt-2 pl-7 text-slate-500 italic flex items-center">
                                        <FaEyeSlash className="mr-1.5" /> Detailed output is hidden for this private test case.
                                    </p>
                                ) : (
                                    
                                    <div className="pl-7 mt-1">
                                        {(res.stdout || res.stdout === "") && <CollapsibleOutput title="STDOUT" content={res.stdout} />}
                                        {(res.stderr || res.stderr === "") && <CollapsibleOutput title="STDERR" content={res.stderr} />}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            {evaluationResult.compilationSuccess && evaluationResult.results.length === 0 && (
                <p className="text-sm text-slate-500 italic p-3">No test cases were processed for this submission (but compilation was successful).</p>
            )}
        </div>
    );
};