
import api from './api';
import { UserClassroomDto, ClassroomDetailsDto, ClassroomMemberDto, CreateClassroomPayload, AddMemberPayload, ClassroomRole, ClassroomPhotoUploadResponseDto, UpdateClassroomPayload, UserSearchResultDto, LeaveClassroomPayload} from '../types/classroom.ts'; 

const API_BASE_CLASSROOMS = `${import.meta.env.VITE_API_BASE_CLASSROOMS}`

export const getMyClassrooms = async (): Promise<UserClassroomDto[]> => {
  try {
    const response = await api.get<UserClassroomDto[]>(`${API_BASE_CLASSROOMS}/my`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || new Error('Failed to fetch classrooms');
  }
};

export const createClassroom = async (payload: CreateClassroomPayload): Promise<any> => { 
  try {
    
    const response = await api.post(API_BASE_CLASSROOMS, payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || new Error('Failed to create classroom');
  }
};


export const getClassroomDetails = async (classroomId: string | number): Promise<ClassroomDetailsDto> => {
  try {
    const response = await api.get<ClassroomDetailsDto>(`${API_BASE_CLASSROOMS}/${classroomId}/details`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || new Error(`Failed to fetch details for classroom ${classroomId}`);
  }
};

export const addTeacher = async (classroomId: string | number, payload: AddMemberPayload): Promise<ClassroomMemberDto> => {
    try {
        const response = await api.post<ClassroomMemberDto>(`${API_BASE_CLASSROOMS}/${classroomId}/teachers`, payload);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to add teacher');
    }
};

export const addStudent = async (classroomId: string | number, payload: AddMemberPayload): Promise<ClassroomMemberDto> => {
    try {
        const response = await api.post<ClassroomMemberDto>(`${API_BASE_CLASSROOMS}/${classroomId}/students`, payload);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to add student');
    }
};

export const uploadClassroomPhoto = async (classroomId: string | number, photoFile: File): Promise<ClassroomPhotoUploadResponseDto> => {
    const formData = new FormData();
    formData.append('photoFile', photoFile);

    try {
        const response = await api.post<ClassroomPhotoUploadResponseDto>(`${API_BASE_CLASSROOMS}/${classroomId}/photo`, formData, {
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
        await api.delete(`${API_BASE_CLASSROOMS}/${classroomId}/photo`);
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to delete classroom photo');
    }
};

export const updateClassroomDetails = async (
    classroomId: string | number,
    payload: UpdateClassroomPayload
): Promise<ClassroomDetailsDto> => { 
    try {
        const response = await api.put<ClassroomDetailsDto>(`${API_BASE_CLASSROOMS}/${classroomId}`, payload);
        return response.data;
    } catch (error: any) {
        const errorMessage = error.response?.data?.errors?.Name?.join(', ') || 
                             error.response?.data?.errors?.Description?.join(', ') ||
                             error.response?.data?.message ||
                             error.message ||
                             'Failed to update classroom details.';
        throw new Error(errorMessage);
    }
};

export const deleteClassroom = async (classroomId: string | number): Promise<void> => {
    try {
        await api.delete(`${API_BASE_CLASSROOMS}/${classroomId}`);
    } catch (error: any) {
        throw error.response?.data || new Error('Failed to delete classroom');
    }
};

export const searchPotentialMembers = async (
    classroomId: string | number,
    searchTerm: string,
    limit: number = 5
): Promise<UserSearchResultDto[]> => {
    if (!searchTerm || searchTerm.trim().length < 2) { 
        return Promise.resolve([]); 
    }
    try {
        const response = await api.get<UserSearchResultDto[]>(
            `${API_BASE_CLASSROOMS}/${classroomId}/potential-members/search`,
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

export const leaveClassroom = async (
    classroomId: string | number,
    payload?: LeaveClassroomPayload
): Promise<void> => {
    try {
        
        await api.post(`${API_BASE_CLASSROOMS}/${classroomId}/leave`, payload || {}); 
    } catch (error: any) {
        const errorMessage = error.response?.data?.detail || 
                             error.response?.data?.message || 
                             error.message ||
                             'Failed to leave classroom.';
        throw new Error(errorMessage);
    }
};

export const removeMemberFromClassroom = async (
    classroomId: string | number,
    memberUserIdToRemove: string | number
): Promise<void> => {
    try {
        
        await api.delete(`${API_BASE_CLASSROOMS}/${classroomId}/members/${memberUserIdToRemove}`);
    } catch (error: any) {
        const errorMessage = error.response?.data?.detail || 
                             error.response?.data?.message ||
                             error.message ||
                             'Failed to remove member.';
        throw new Error(errorMessage);
    }
};