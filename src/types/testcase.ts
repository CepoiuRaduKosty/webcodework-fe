// src/types/testcase.ts
export interface TestCaseListDto {
    id: number;
    inputFileName: string;
    expectedOutputFileName: string;
    addedAt: string; // ISO date string
    addedByUsername: string;
}

export interface TestCaseDetailDto extends TestCaseListDto {
    // Add other details if returned by backend
}

// Optional: Type for the currently editing test case state
export interface EditingTestCaseState extends TestCaseListDto {
    inputContent: string;
    outputContent: string;
}
