// src/services/classroomService.ts
import api from './api';
import { UserClassroomDto, ClassroomDetailsDto, ClassroomMemberDto, CreateClassroomPayload, AddMemberPayload, ClassroomRole, ClassroomPhotoUploadResponseDto, UpdateClassroomPayload, UserSearchResultDto} from '../types/classroom.ts'; // Define these types next

export const getMyClassrooms = async (): Promise<UserClassroomDto[]> => {
  try {
    const response = await api.get<UserClassroomDto[]>('/api/classrooms/my');
    return response.data;
  } catch (error: any) {
    throw error.response?.data || new Error('Failed to fetch classrooms');
  }
};

export const createClassroom = async (payload: CreateClassroomPayload): Promise<any> => { // Define specific return type if needed
  try {
    // Assuming backend returns the created classroom on 201 Created
    const response = await api.post('/api/classrooms', payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || new Error('Failed to create classroom');
  }
};

// Assumes backend endpoint GET /api/classrooms/{classroomId}/details exists!
export const getClassroomDetails = async (classroomId: string | number): Promise<ClassroomDetailsDto> => {
  try {
    const response = await api.get<ClassroomDetailsDto>(`/api/classrooms/${classroomId}/details`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || new Error(`Failed to fetch details for classroom ${classroomId}`);
  }
};

export const addTeacher = async (classroomId: string | number, payload: AddMemberPayload): Promise<ClassroomMemberDto> => {
    try {
        const response = await api.post<ClassroomMemberDto>(`/api/classrooms/${classroomId}/teachers`, payload);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to add teacher');
    }
};

export const addStudent = async (classroomId: string | number, payload: AddMemberPayload): Promise<ClassroomMemberDto> => {
    try {
        const response = await api.post<ClassroomMemberDto>(`/api/classrooms/${classroomId}/students`, payload);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to add student');
    }
};

export const uploadClassroomPhoto = async (classroomId: string | number, photoFile: File): Promise<ClassroomPhotoUploadResponseDto> => {
    const formData = new FormData();
    formData.append('photoFile', photoFile);

    try {
        const response = await api.post<ClassroomPhotoUploadResponseDto>(`/api/classrooms/${classroomId}/photo`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to upload classroom photo');
    }
};

export const deleteClassroomPhoto = async (classroomId: string | number): Promise<void> => {
    try {
        await api.delete(`/api/classrooms/${classroomId}/photo`);
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to delete classroom photo');
    }
};

export const updateClassroomDetails = async (
    classroomId: string | number,
    payload: UpdateClassroomPayload
): Promise<ClassroomDetailsDto> => { // Assuming backend returns full details or ClassroomDto
    try {
        const response = await api.put<ClassroomDetailsDto>(`/api/classrooms/${classroomId}`, payload);
        return response.data;
    } catch (error: any) {
        const errorMessage = error.response?.data?.errors?.Name?.join(', ') || // For ValidationProblemDetails
                             error.response?.data?.errors?.Description?.join(', ') ||
                             error.response?.data?.message ||
                             error.message ||
                             'Failed to update classroom details.';
        throw new Error(errorMessage);
    }
};

export const deleteClassroom = async (classroomId: string | number): Promise<void> => {
    try {
        await api.delete(`/api/classrooms/${classroomId}`);
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to delete classroom');
    }
};

export const searchPotentialMembers = async (
    classroomId: string | number,
    searchTerm: string,
    limit: number = 5
): Promise<UserSearchResultDto[]> => {
    if (!searchTerm || searchTerm.trim().length < 2) { // Basic client-side check
        return Promise.resolve([]); // Don't search for very short terms
    }
    try {
        const response = await api.get<UserSearchResultDto[]>(
            `/api/classrooms/${classroomId}/potential-members/search`,
            {
                params: { searchTerm, limit }
            }
        );
        return response.data;
    } catch (error: any) {
        console.error("Search Potential Members Error:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to search for users.');
    }
};
