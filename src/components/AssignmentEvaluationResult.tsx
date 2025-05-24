// src/components/AssignmentEvaluationResult.tsx

import React, { useState } from 'react'; // Added React and useState
import { EvaluationStatus, FrontendEvaluateResponseDto } from "../types/evaluation";

// Helper function to get styling based on status
const getStatusStyles = (status: EvaluationStatus | string): {bgColor: string, textColor: string, borderColor: string, icon: string} => {
    switch (status) {
        case EvaluationStatus.Accepted:
            return { bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-300', icon: '✓' }; // Checkmark
        case EvaluationStatus.WrongAnswer:
            return { bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-300', icon: '✕' }; // Cross
        case EvaluationStatus.CompileError:
            return { bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-300', icon: '⚠️' }; // Warning
        case EvaluationStatus.RuntimeError:
            return { bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-300', icon: '⚙️' }; // Gear/Error
        case EvaluationStatus.TimeLimitExceeded:
            return { bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-300', icon: '⏳' }; // Hourglass
        case EvaluationStatus.MemoryLimitExceeded:
            return { bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-300', icon: '💾' }; // Floppy/memory
        case EvaluationStatus.FileError:
        case EvaluationStatus.InternalError:
        case EvaluationStatus.LanguageNotSupported:
            return { bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-300', icon: '🔥' }; // Fire/Critical
        default:
            return { bgColor: 'bg-gray-50', textColor: 'text-gray-700', borderColor: 'border-gray-300', icon: '?' };
    }
};

const CollapsibleOutput: React.FC<{ title: string; content?: string | null }> = ({ title, content }) => {
    const [isOpen, setIsOpen] = useState(false);
    if (!content) return null;

    return (
        <details className="mt-2 text-xs" open={isOpen} onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
            <summary className="cursor-pointer font-medium text-gray-600 hover:text-gray-800 select-none">
                {title} {isOpen ? '▼' : '►'}
            </summary>
            <pre className="mt-1 p-2 bg-gray-800 text-white rounded-md overflow-x-auto max-h-60">
                <code>{content}</code>
            </pre>
        </details>
    );
};


export const AssignmentEvaluationResult: React.FC<{
    isEvaluating: boolean, // Still needed for overall "Processing..." message
    evaluationResult: FrontendEvaluateResponseDto | null,
    evaluationError: string | null
}> = ({ isEvaluating, evaluationResult, evaluationError }) => {

    if (isEvaluating && !evaluationResult && !evaluationError) { // Show only if actively evaluating AND no result/error yet
        return (
            <div className="flex items-center text-blue-600 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing your solution against test cases... please wait.
            </div>
        );
    }

    if (evaluationError) {
        return (
            <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">
                <p className="font-semibold">Evaluation Request Error:</p>
                <p className="text-sm">{evaluationError}</p>
            </div>
        );
    }

    if (!evaluationResult) {
        return null; // Or a message like "No evaluation results to display."
    }

    const overallStatusStyles = getStatusStyles(evaluationResult.overallStatus as EvaluationStatus); // Assuming overallStatus can be cast

    return (
        <div className="p-3 bg-white border border-gray-300 rounded-md shadow-sm space-y-4">
            {/* Overall Summary */}
            <div className={`p-3 rounded-md border ${overallStatusStyles.borderColor} ${overallStatusStyles.bgColor}`}>
                <div className="flex justify-between items-center mb-1">
                    <h4 className={`text-lg font-semibold ${overallStatusStyles.textColor}`}>
                        Overall Status: {evaluationResult.overallStatus}
                    </h4>
                    {(evaluationResult.pointsObtained !== null && evaluationResult.pointsObtained !== undefined) &&
                     (evaluationResult.totalPossiblePoints !== null && evaluationResult.totalPossiblePoints !== undefined) && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${overallStatusStyles.bgColor === 'bg-green-50' ? 'bg-green-600 text-white' : overallStatusStyles.bgColor === 'bg-yellow-50' ? 'bg-yellow-500 text-white' : 'bg-red-600 text-white' }`}>
                            Score: {evaluationResult.pointsObtained} / {evaluationResult.totalPossiblePoints}
                        </span>
                    )}
                </div>
                <p className={`text-sm ${overallStatusStyles.textColor}`}>
                    Compilation: <span className="font-medium">{evaluationResult.compilationSuccess ? 'Successful' : 'Failed'}</span>
                    {evaluationResult.evaluatedLanguage && (
                        <span className="ml-2 text-xs text-gray-500">(Language: {evaluationResult.evaluatedLanguage.toUpperCase()})</span>
                    )}
                </p>
            </div>

            {/* Compiler Output (if any, or if compilation failed) */}
            {(evaluationResult.compilerOutput || !evaluationResult.compilationSuccess) && (
                <div className="p-3 border rounded-md bg-gray-50">
                    <h5 className="font-semibold text-gray-700 mb-1">Compiler Output:</h5>
                    {evaluationResult.compilerOutput ? (
                         <CollapsibleOutput title="Show/Hide Compiler Output" content={evaluationResult.compilerOutput} />
                    ) : (
                        <p className="text-sm text-gray-500 italic">No compiler output (or compilation succeeded silently).</p>
                    )}
                </div>
            )}

            {/* Test Case Results */}
            {evaluationResult.compilationSuccess && evaluationResult.results.length > 0 && (
                 <div className="space-y-3">
                    <h5 className="font-semibold text-gray-700">Test Case Breakdown:</h5>
                    {evaluationResult.results.map((res, index) => {
                        const tcStatusStyles = getStatusStyles(res.status as EvaluationStatus);
                        const inputFileName = res.testCaseInputPath.split('/').pop();
                        return (
                            <div key={res.testCaseId || index} className={`p-3 border rounded-md ${tcStatusStyles.bgColor} ${tcStatusStyles.borderColor}`}>
                                <div className="flex justify-between items-center">
                                    <p className={`font-medium ${tcStatusStyles.textColor}`}>
                                        <span className="mr-2 text-xl">{tcStatusStyles.icon}</span>
                                        Test Case {res.testCaseId || `#${index + 1}`} ({inputFileName}):
                                        <span className="font-bold ml-1">{res.status}</span>
                                    </p>
                                    {res.durationMs !== null && res.durationMs !== undefined && (
                                        <p className={`text-xs ${tcStatusStyles.textColor}`}>Time: {res.durationMs} ms</p>
                                    )}
                                </div>
                                {res.message && <p className={`text-xs mt-1 italic ${tcStatusStyles.textColor}`}>{res.message}</p>}
                                <CollapsibleOutput title="Show STDOUT" content={res.stdout} />
                                <CollapsibleOutput title="Show STDERR" content={res.stderr} />
                            </div>
                        );
                    })}
                </div>
            )}
             {evaluationResult.compilationSuccess && evaluationResult.results.length === 0 && (
                 <p className="text-sm text-gray-500 italic p-3">No test case results reported (but compilation was successful).</p>
             )}
        </div>
    );
};