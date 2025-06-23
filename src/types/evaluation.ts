


export enum EvaluationStatus {
    Accepted = "ACCEPTED",
    WrongAnswer = "WRONG_ANSWER",
    CompileError = "COMPILE_ERROR",
    RuntimeError = "RUNTIME_ERROR",
    TimeLimitExceeded = "TIME_LIMIT_EXCEEDED",
    MemoryLimitExceeded = "MEMORY_LIMIT_EXCEEDED",
    FileError = "FILE_ERROR",
    LanguageNotSupported = "LANGUAGE_NOT_SUPPORTED",
    InternalError = "INTERNAL_ERROR"
}


export interface FrontendTestCaseResultDto {
    testCaseInputPath: string;
    testCaseId?: string | null; 
    status: EvaluationStatus | string; 
    stdout?: string | null;
    stderr?: string | null;
    message?: string | null;
    durationMs?: number | null;
    testCaseName?: string | null;
    isPrivate?: boolean | null;
    maximumMemoryException?: boolean | null;
}


export interface FrontendEvaluateResponseDto {
    submissionId?: number;
    evaluatedLanguage?: string;
    overallStatus: string;
    compilationSuccess: boolean;
    compilerOutput?: string | null;
    results: FrontendTestCaseResultDto[];
    pointsObtained?: number | null;
    totalPossiblePoints?: number | null;
}