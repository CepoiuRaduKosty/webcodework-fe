// src/services/testcaseService.ts

import { TestCaseDetailDto, TestCaseListDto } from '../types/testcase';
import api from './api';


export const getTestCaseInputContent = async (testCaseId: string | number): Promise<string> => {
    try {
        const response = await api.get<string>(`/api/testcases/${testCaseId}/input/content`, { headers: { 'Accept': 'text/plain' }});
        return response.data;
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to fetch test case input content');
    }
};

export const getTestCaseOutputContent = async (testCaseId: string | number): Promise<string> => {
    try {
        const response = await api.get<string>(`/api/testcases/${testCaseId}/output/content`, { headers: { 'Accept': 'text/plain' }});
        return response.data;
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to fetch test case output content');
    }
};

export const updateTestCaseInputContent = async (testCaseId: string | number, content: string): Promise<void> => {
    try {
        await api.put(`/api/testcases/${testCaseId}/input/content`, content, { headers: { 'Content-Type': 'text/plain' } });
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to save test case input content');
    }
};

export const updateTestCaseOutputContent = async (testCaseId: string | number, content: string): Promise<void> => {
     try {
        await api.put(`/api/testcases/${testCaseId}/output/content`, content, { headers: { 'Content-Type': 'text/plain' } });
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to save test case output content');
    }
};

// MODIFIED Function to add a test case
export const addTestCase = async (assignmentId: string | number, inputFileName: string, outputFileName: string, points: number, maxExecutionTimeMs: number, maxRamMB: number): Promise<TestCaseDetailDto> => {
    const formData = new FormData();
    formData.append('InputFileName', inputFileName);
    formData.append('OutputFileName', outputFileName);
    formData.append('Points', points.toString());
    formData.append('MaxExecutionTimeMs', maxExecutionTimeMs.toString());
    formData.append('MaxRamMB', maxRamMB.toString());

    try {
        const response = await api.post<TestCaseDetailDto>(
            `/api/assignments/${assignmentId}/testcases`, // URL
            formData, // Data
            { // <--- Axios Request Config Options HERE
                headers: {
                    // Explicitly set Content-Type to undefined for this request.
                    // This tells Axios to IGNORE the global default and correctly
                    // set 'multipart/form-data; boundary=...' based on the FormData object.
                    'Content-Type': undefined
                    // Alternatively, sometimes null works too: 'Content-Type': null
                    // Avoid setting 'multipart/form-data' manually as Axios handles the boundary.
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
        const response = await api.get<TestCaseListDto[]>(`/api/assignments/${assignmentId}/testcases`);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to fetch test cases');
    }
};

export const deleteTestCase = async (assignmentId: string | number, testCaseId: string | number): Promise<void> => {
    try {
        await api.delete(`/api/assignments/${assignmentId}/testcases/${testCaseId}`);
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to delete test case');
    }
};