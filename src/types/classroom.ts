// src/types/classroom.ts

// Matches backend Enum (case-sensitive if stored as string)
export enum ClassroomRole {
    Owner = 0,
    Teacher = 1,
    Student = 2
}

// Matches backend DTO: UserClassroomDto
export interface UserClassroomDto {
  classroomId: number;
  name: string;
  description?: string;
  userRole: ClassroomRole; // User's role in this specific classroom
  joinedAt: string; // ISO date string
  photoUrl?: string | null;
}

// Payload for creating a classroom
export interface CreateClassroomPayload {
    name: string;
    description?: string;
}

// Matches backend DTO: ClassroomMemberDto (or similar structure)
export interface ClassroomMemberDto {
    userId: number;
    username: string;
    role: ClassroomRole;
    joinedAt: string; // ISO date string
    classroomId?: number; // Include if needed/returned
}

// Expected response from GET /api/classrooms/{classroomId}/details
export interface ClassroomDetailsDto {
    id: number;
    name: string;
    description?: string;
    currentUserRole: ClassroomRole; // Role of the user making the request
    members: ClassroomMemberDto[];
    photoUrl?: string | null;
}

// Payload for adding teacher/student
export interface AddMemberPayload {
    userId: number;
}

export interface ClassroomPhotoUploadResponseDto {
    id: number;
    name: string;
    description?: string | null;
    createdAt: string;
    photoUrl?: string | null;
}