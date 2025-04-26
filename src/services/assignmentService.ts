// src/services/assignmentService.ts
import api from './api';
import {
    AssignmentBasicDto,
    AssignmentDetailsDto,
    CreateAssignmentDto,
    SubmissionDto,
    SubmittedFileDto,
    GradeSubmissionDto, // Assuming you might need this later for teachers
    CreateVirtualFilePayload,
    TestCaseDetailDto,
    TestCaseListDto
} from '../types/assignment.ts'; // We'll define these types next
import { TeacherSubmissionViewDto } from '../types/assignment.ts'

// === Assignment Management ===

export const getAssignmentsForClassroom = async (classroomId: string | number): Promise<AssignmentBasicDto[]> => {
    try {
        const response = await api.get<AssignmentBasicDto[]>(`/api/classrooms/${classroomId}/assignments`);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to fetch assignments');
    }
};

export const createAssignment = async (classroomId: string | number, payload: CreateAssignmentDto): Promise<AssignmentDetailsDto> => {
    try {
        // Assuming backend returns the created assignment details on 201 Created
        const response = await api.post<AssignmentDetailsDto>(`/api/classrooms/${classroomId}/assignments`, payload);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to create assignment');
    }
};

export const getAssignmentDetails = async (assignmentId: string | number): Promise<AssignmentDetailsDto> => {
    try {
        const response = await api.get<AssignmentDetailsDto>(`/api/assignments/${assignmentId}`);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || new Error(`Failed to fetch details for assignment ${assignmentId}`);
    }
};

// === Submission Management (Student Perspective) ===

export const getMySubmission = async (assignmentId: string | number): Promise<SubmissionDto> => {
    try {
        const response = await api.get<SubmissionDto>(`/api/assignments/${assignmentId}/submissions/my`);
        return response.data;
    } catch (error: any) {
        // Handle 404 specifically - it means submission not started, not necessarily an error
        if (error.response?.status === 404) {
             // Return null or a specific indicator instead of throwing an error for 404
             // Throwing error might be better to handle in component try/catch
             throw { status: 404, message: error.response?.data?.message || 'Submission not started.' };
        }
        throw error.response?.data || new Error('Failed to fetch submission details');
    }
};

export const uploadSubmissionFile = async (assignmentId: string | number, file: File): Promise<SubmittedFileDto> => {
    const formData = new FormData();
    formData.append('file', file); // Key 'file' must match backend parameter name (IFormFile file)

    try {
        const response = await api.post<SubmittedFileDto>(`/api/assignments/${assignmentId}/submissions/my/files`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Axios usually sets this with FormData, but explicit is fine
            },
            // Add onUploadProgress handler if needed
        });
        return response.data;
    } catch (error: any) {
        console.log(error)
        throw error.response?.data || new Error('File upload failed');
    }
};

export const deleteSubmissionFile = async (submissionId: string | number, fileId: string | number): Promise<void> => {
    try {
        await api.delete(`/api/submissions/${submissionId}/files/${fileId}`);
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to delete file');
    }
};

export const submitAssignment = async (assignmentId: string | number): Promise<SubmissionDto> => {
     try {
        // No request body needed for this specific submit action
        const response = await api.post<SubmissionDto>(`/api/assignments/${assignmentId}/submissions/my/submit`);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to submit assignment');
    }
};

export const getSubmissionsForAssignment = async (assignmentId: string | number): Promise<TeacherSubmissionViewDto[]> => {
    try {
        const response = await api.get<TeacherSubmissionViewDto[]>(`/api/assignments/${assignmentId}/submissions`);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to fetch assignment submissions');
    }
};

export const getFileContent = async (submissionId: string | number, fileId: string | number): Promise<string> => {
    try {
        // Expecting plain text response
        const response = await api.get<string>(`/api/submissions/${submissionId}/files/${fileId}/content`, {
            headers: { 'Accept': 'text/plain' }, // Explicitly ask for text
            // Important: Tell Axios the expected response type is text
            // Note: Axios might automatically handle common text types, but this can help
            // responseType: 'text' // Usually not needed for GET if server sets Content-Type correctly
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to fetch file content');
    }
};

export const updateFileContent = async (submissionId: string | number, fileId: string | number, content: string): Promise<void> => { // Or return updated SubmittedFileDto
    try {
        await api.put(`/api/submissions/${submissionId}/files/${fileId}/content`, content, { // Send raw string as data
            headers: { 'Content-Type': 'text/plain' }, // Set content type of request body
        });
        // Optionally return updated file metadata if backend provides it
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to save file content');
    }
};

export const createVirtualFile = async (assignmentId: string | number, fileName: string): Promise<SubmittedFileDto> => {
    try {
        const payload: CreateVirtualFilePayload = { fileName };
        const response = await api.post<SubmittedFileDto>(`/api/assignments/${assignmentId}/submissions/my/create-file`, payload);
        return response.data;
    } catch (error: any) {
         throw error.response?.data || new Error(`Failed to create file '${fileName}'`);
    }
};

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
export const addTestCase = async (assignmentId: string | number, inputFileName: string, outputFileName: string): Promise<TestCaseDetailDto> => {
    const formData = new FormData();
    formData.append('InputFileName', inputFileName);
    formData.append('OutputFileName', outputFileName);
    // No actual file blobs appended here for empty file creation

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