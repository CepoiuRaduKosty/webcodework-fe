
import api from './api';
import {
    AssignmentBasicDto,
    AssignmentDetailsDto,
    CreateAssignmentDto,
    SubmissionDto,
    SubmittedFileDto,
    CreateVirtualFilePayload,
    UpdateAssignmentPayload,
    GradeSubmissionPayload,
} from '../types/assignment.ts'; 
import { TeacherSubmissionViewDto } from '../types/assignment.ts'



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



export const getMySubmission = async (assignmentId: string | number): Promise<SubmissionDto> => {
    try {
        const response = await api.get<SubmissionDto>(`/api/assignments/${assignmentId}/submissions/my`);
        return response.data;
    } catch (error: any) {
        
        if (error.response?.status === 404) {
             
             
             throw { status: 404, message: error.response?.data?.message || 'Submission not started.' };
        }
        throw error.response?.data || new Error('Failed to fetch submission details');
    }
};

export const uploadSubmissionFile = async (assignmentId: string | number, file: File): Promise<SubmittedFileDto> => {
    const formData = new FormData();
    formData.append('file', file); 

    try {
        const response = await api.post<SubmittedFileDto>(`/api/assignments/${assignmentId}/submissions/my/files`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', 
            },
            
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
        
        const response = await api.get<string>(`/api/submissions/${submissionId}/files/${fileId}/content`, {
            headers: { 'Accept': 'text/plain' }, 
            
            
            
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to fetch file content');
    }
};

export const updateFileContent = async (submissionId: string | number, fileId: string | number, content: string): Promise<void> => { 
    try {
        await api.put(`/api/submissions/${submissionId}/files/${fileId}/content`, content, { 
            headers: { 'Content-Type': 'text/plain' }, 
        });
        
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

export const updateAssignment = async (
    assignmentId: string | number,
    payload: UpdateAssignmentPayload
): Promise<AssignmentDetailsDto> => { 
    try {
        const response = await api.put<AssignmentDetailsDto>(`/api/assignments/${assignmentId}`, payload);
        return response.data;
    } catch (error: any) {
        const errorMessage = error.response?.data?.errors?.Title?.join(', ') ||
                             error.response?.data?.message ||
                             error.message ||
                             'Failed to update assignment.';
        throw new Error(errorMessage);
    }
};

export const deleteAssignment = async (assignmentId: string | number): Promise<void> => {
    try {
        await api.delete(`/api/assignments/${assignmentId}`);
    } catch (error: any) {
        throw error.response?.data?.message || error.message || 'Failed to delete assignment.';
    }
};

export const downloadSubmittedFile = async (
    submissionId: number | string,
    fileId: number | string,
    originalFileName: string
): Promise<void> => {
    try {
        const response = await api.get(
            
            `/api/submissions/${submissionId}/files/${fileId}/download`,
            
            
            {
                responseType: 'blob', 
            }
        );

        
        const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' });

        
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', originalFileName); 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href); 

    } catch (error: any) {
        console.error("Download File Error:", error.response?.data || error.message);
        
        let errorMessage = 'Failed to download file.';
        if (error.response && error.response.data && error.response.data.type === 'application/problem+json') {
             try {
                const errorBlob = error.response.data as Blob;
                const errorText = await errorBlob.text();
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.detail || errorJson.title || errorMessage;
             } catch (e) {
                
             }
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        alert(errorMessage); 
        throw new Error(errorMessage);
    }
};

export const unsubmitStudentSubmission = async (submissionId: string | number): Promise<SubmissionDto> => {
    try {
        const response = await api.post<SubmissionDto>(`/api/submissions/${submissionId}/unsubmit`);
        return response.data;
    } catch (error: any) {
        const errorMessage = error.response?.data?.detail || 
                             error.response?.data?.message ||
                             error.message ||
                             'Failed to unsubmit assignment.';
        throw new Error(errorMessage);
    }
};

export const getSubmissionDetails = async (submissionId: string | number): Promise<SubmissionDto> => {
    try {
        const response = await api.get<SubmissionDto>(`/api/submissions/${submissionId}`);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || new Error(`Failed to fetch submission details for ID ${submissionId}`);
    }
};

export const gradeSubmission = async (
    submissionId: string | number,
    payload: GradeSubmissionPayload
): Promise<SubmissionDto> => { 
    try {
        const response = await api.put<SubmissionDto>(`/api/submissions/${submissionId}/grade`, payload);
        return response.data;
    } catch (error: any) {
        const errorMessage = error.response?.data?.errors?.Grade?.join(', ') ||
                             error.response?.data?.message ||
                             error.message ||
                             'Failed to submit grade.';
        throw new Error(errorMessage);
    }
};

