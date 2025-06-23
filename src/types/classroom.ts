


export enum ClassroomRole {
    Owner = 0,
    Teacher = 1,
    Student = 2
}


export interface UserClassroomDto {
  classroomId: number;
  name: string;
  description?: string;
  userRole: ClassroomRole; 
  joinedAt: string; 
  photoUrl?: string | null;
}


export interface CreateClassroomPayload {
    name: string;
    description?: string;
}


export interface ClassroomMemberDto {
    userId: number;
    username: string;
    role: ClassroomRole;
    joinedAt: string; 
    classroomId?: number; 
    profilePhotoUrl?: string | null;
}


export interface ClassroomDetailsDto {
    id: number;
    name: string;
    description?: string;
    currentUserRole: ClassroomRole; 
    members: ClassroomMemberDto[];
    photoUrl?: string | null;
}


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

export interface UpdateClassroomPayload {
    name: string;
    description?: string | null; 
}

export interface UserSearchResultDto { 
    userId: number;
    username: string;
    profilePhotoUrl?: string | null;
}

export interface LeaveClassroomPayload {
    newOwnerUserId?: number | null; 
}
