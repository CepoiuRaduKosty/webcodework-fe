// src/services/classroomService.ts
import api from './api';
import { UserClassroomDto, ClassroomDetailsDto, ClassroomMemberDto, CreateClassroomPayload, AddMemberPayload, ClassroomRole} from '../types/classroom.ts'; // Define these types next

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