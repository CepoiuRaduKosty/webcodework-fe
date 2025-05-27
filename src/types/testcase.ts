// src/types/testcase.ts
export interface TestCaseListDto {
    testCaseName: string;
    id: number;
    inputFileName: string;
    expectedOutputFileName: string;
    addedAt: string; // ISO date string
    addedByUsername: string;
    points: number;
    maxExecutionTimeMs: number;
    maxRamMB: number;
    isPrivate: boolean;
}

export interface TestCaseDetailDto extends TestCaseListDto {
    // Add other details if returned by backend
}

// Optional: Type for the currently editing test case state
export interface EditingTestCaseState extends TestCaseListDto {
    inputContent: string;
    outputContent: string;
}
