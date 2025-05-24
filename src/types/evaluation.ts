// src/types/evaluation.ts

// Corresponds to EvaluationStatus constants on the backend
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

// Corresponds to OrchestrationTestCaseResult from main backend
export interface FrontendTestCaseResultDto {
    testCaseInputPath: string;
    testCaseId?: string | null; // Optional ID passed in request
    status: EvaluationStatus | string; // Use enum for better type safety if possible
    stdout?: string | null;
    stderr?: string | null;
    message?: string | null;
    durationMs?: number | null;
}

// Corresponds to OrchestrationEvaluateResponse from main backend
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