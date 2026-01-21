

import { TestCaseDetailDto, TestCaseListDto } from '../types/testcase';
import api from './api';

const API_BASE_TESTCASES = `${import.meta.env.VITE_API_BASE_TESTCASES}`
const API_BASE_ASSIGNMENTS = `${import.meta.env.VITE_API_BASE_ASSIGNMENTS}`

export const getTestCaseInputContent = async (testCaseId: string | number): Promise<string> => {
    try {
        const response = await api.get<string>(`${API_BASE_TESTCASES}/${testCaseId}/input/content`, { headers: { 'Accept': 'text/plain' }});
        return response.data;
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to fetch test case input content');
    }
};

export const getTestCaseOutputContent = async (testCaseId: string | number): Promise<string> => {
    try {
        const response = await api.get<string>(`${API_BASE_TESTCASES}/${testCaseId}/output/content`, { headers: { 'Accept': 'text/plain' }});
        return response.data;
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to fetch test case output content');
    }
};

export const updateTestCaseInputContent = async (testCaseId: string | number, content: string): Promise<void> => {
    try {
        await api.put(`${API_BASE_TESTCASES}/${testCaseId}/input/content`, content, { headers: { 'Content-Type': 'text/plain' } });
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to save test case input content');
    }
};

export const updateTestCaseOutputContent = async (testCaseId: string | number, content: string): Promise<void> => {
     try {
        await api.put(`${API_BASE_TESTCASES}/${testCaseId}/output/content`, content, { headers: { 'Content-Type': 'text/plain' } });
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to save test case output content');
    }
};


export const addTestCase = async (assignmentId: string | number, inputFileName: string, outputFileName: string, points: number, maxExecutionTimeMs: number, maxRamMB: number): Promise<TestCaseDetailDto> => {
    const formData = new FormData();
    formData.append('InputFileName', inputFileName);
    formData.append('OutputFileName', outputFileName);
    formData.append('Points', points.toString());
    formData.append('MaxExecutionTimeMs', maxExecutionTimeMs.toString());
    formData.append('MaxRamMB', maxRamMB.toString());

    try {
        const response = await api.post<TestCaseDetailDto>(
            `${API_BASE_ASSIGNMENTS}/${assignmentId}/testcases`, 
            formData, 
            { 
                headers: {
                    
                    
                    
                    'Content-Type': undefined
                    
                    
                }
            }
        );
        return response.data;
    } catch (error: any) {
        console.error("Add Test Case Error:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to add test case');
    }
};

export const getTestCases = async (assignmentId: string | number): Promise<TestCaseListDto[]> => {
    try {
        const response = await api.get<TestCaseListDto[]>(`${API_BASE_ASSIGNMENTS}/${assignmentId}/testcases`);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to fetch test cases');
    }
};

export const deleteTestCase = async (assignmentId: string | number, testCaseId: string | number): Promise<void> => {
    try {
        await api.delete(`${API_BASE_ASSIGNMENTS}/${assignmentId}/testcases/${testCaseId}`);
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to delete test case');
    }
};

export const updateTestCasePrivacy = async (
    testCaseId: string | number,
    isPrivate: boolean
): Promise<void> => {
    try {
        await api.patch(`${API_BASE_TESTCASES}/${testCaseId}/privacy`, { isPrivate });
    } catch (error: any) {
        console.error("Update Test Case Privacy Error:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to update test case privacy.');
    }
};

export const generateAITestCase = async (assignmentId: string | number): Promise<TestCaseDetailDto> => {
    try {
        const response = await api.post<TestCaseDetailDto>(
            `${API_BASE_ASSIGNMENTS}/${assignmentId}/testcases/generate`
        );
        return response.data;
    } catch (error: any) {
        console.error("Generate AI Test Case Error:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to generate AI test case.');
    }
};
