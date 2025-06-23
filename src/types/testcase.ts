
export interface TestCaseListDto {
    testCaseName: string;
    id: number;
    inputFileName: string;
    expectedOutputFileName: string;
    addedAt: string; 
    addedByUsername: string;
    points: number;
    maxExecutionTimeMs: number;
    maxRamMB: number;
    isPrivate: boolean;
}

export interface TestCaseDetailDto extends TestCaseListDto {
    
}


export interface EditingTestCaseState extends TestCaseListDto {
    inputContent: string;
    outputContent: string;
}
