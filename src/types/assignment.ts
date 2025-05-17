// src/types/assignment.ts

// Matches backend DTO: CreateAssignmentDto
export interface CreateAssignmentDto {
    title: string;
    instructions?: string;
    dueDate?: string | null; // Use ISO string format for dates or Date object
    maxPoints?: number | null;
    isCodeAssignment: boolean;
}

// Matches backend DTO: AssignmentBasicDto
export interface AssignmentBasicDto {
    id: number;
    title: string;
    createdAt: string; // ISO date string
    dueDate?: string | null; // ISO date string
    maxPoints?: number | null;
    submissionStatus?: string | null; // "Not Submitted", "Submitted", "Late", "Graded", "In Progress" etc.
}

// Matches backend DTO: AssignmentDetailsDto
export interface AssignmentDetailsDto extends AssignmentBasicDto {
    instructions?: string | null;
    createdById: number;
    createdByUsername: string;
    classroomId: number;
    isCodeAssignment: boolean;
    // Add currentUserRole if backend provides it, otherwise infer from context/other calls
}

// Matches backend DTO: SubmittedFileDto
export interface SubmittedFileDto {
    id: number;
    fileName: string;
    contentType: string;
    fileSize: number;
    uploadedAt: string; // ISO date string
}

// Matches backend DTO: SubmissionDto
export interface SubmissionDto {
    id: number;
    assignmentId: number;
    studentId: number;
    studentUsername: string;
    submittedAt?: string | null; // ISO date string
    isLate: boolean;
    grade?: number | null;
    feedback?: string | null;
    gradedAt?: string | null; // ISO date string
    gradedById?: number | null;
    gradedByUsername?: string | null;
    submittedFiles: SubmittedFileDto[];
}

// Matches backend DTO: GradeSubmissionDto (For future use)
export interface GradeSubmissionDto {
  grade?: number | null;
  feedback?: string | null;
}

export interface TeacherSubmissionViewDto {
    studentId: number;
    studentUsername: string;
    submissionId?: number | null; // Nullable if not submitted
    submittedAt?: string | null; // ISO date string
    isLate: boolean;
    grade?: number | null;
    hasFiles: boolean;
    status: string; // "Not Submitted", "Submitted", "Late", "Graded", "In Progress"
}

export interface CreateVirtualFilePayload {
    fileName: string;
}
