import { EvaluationStatus, FrontendEvaluateResponseDto } from "../types/evaluation"


export const AssignmentEvaluationResult: React.FC<{ isEvaluating: boolean, evaluationResult: FrontendEvaluateResponseDto | null, evaluationError: string | null}> = ({ isEvaluating, evaluationResult, evaluationError }) => {
    return <>
        <div className="my-4 p-4 border rounded bg-gray-50 shadow">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Evaluation Output</h3>
            {isEvaluating && (
                <div className="flex items-center text-blue-600">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing your solution against test cases... please wait.
                </div>
            )}
            {evaluationError && (
                <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">
                    <p className="font-semibold">Evaluation Error:</p>
                    <p className="text-sm">{evaluationError}</p>
                </div>
            )}
            {evaluationResult && (
                <div className="p-3 bg-gray-100 border border-gray-300 rounded-md max-h-96 overflow-y-auto">
                    <p className="mb-2">
                        <span className="font-semibold">Overall Status:</span>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${evaluationResult.overallStatus === 'Accepted' ? 'bg-green-100 text-green-800' :
                                evaluationResult.overallStatus.includes('Issues') ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-700'
                            }`}>
                            {evaluationResult.overallStatus}
                        </span>
                    </p>
                    <p className="mb-2"><span className="font-semibold">Compilation Successful:</span> {evaluationResult.compilationSuccess ? 'Yes' : 'No'}</p>
                    {evaluationResult.compilerOutput && (
                        <details className="mb-2">
                            <summary className="cursor-pointer text-sm font-medium text-gray-600">Compiler Output</summary>
                            <pre className="mt-1 p-2 bg-gray-800 text-white text-xs rounded-md overflow-x-auto">
                                <code>{evaluationResult.compilerOutput}</code>
                            </pre>
                        </details>
                    )}
                    <h4 className="font-semibold mt-3 mb-1 text-gray-600">Test Case Results:</h4>
                    {evaluationResult.results.length > 0 ? (
                        <ul className="list-disc list-inside pl-1 space-y-1">
                            {evaluationResult.results.map((res, index) => (
                                <li key={index} className="text-sm">
                                    Test Case {res.testCaseId || `#${index + 1}`} ({res.testCaseInputPath.split('/').pop()}):
                                    <span className={`ml-2 font-semibold ${res.status === EvaluationStatus.Accepted ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {res.status}
                                    </span>
                                    {res.message && <span className="text-xs text-gray-500 italic"> - {res.message}</span>}
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-gray-500 italic">No test case results reported.</p>}

                    <details className="mt-4">
                        <summary className="cursor-pointer text-sm font-medium text-gray-600">Show Raw JSON Response</summary>
                        <pre className="mt-1 p-2 bg-gray-800 text-white text-xs rounded-md overflow-x-auto">
                            <code>{JSON.stringify(evaluationResult, null, 2)}</code>
                        </pre>
                    </details>
                </div>
            )}
        </div>
    </>
}