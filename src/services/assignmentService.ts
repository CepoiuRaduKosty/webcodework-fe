// src/services/assignmentService.ts
import api from './api';
import {
    AssignmentBasicDto,
    AssignmentDetailsDto,
    CreateAssignmentDto,
    SubmissionDto,
    SubmittedFileDto,
    GradeSubmissionDto // Assuming you might need this later for teachers
} from '../types/assignment.ts'; // We'll define these types next

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

// Add teacher/grading functions here later if needed...