


export interface CreateAssignmentDto {
    title: string;
    instructions?: string;
    dueDate?: string | null; 
    maxPoints?: number | null;
    isCodeAssignment: boolean;
}


export interface AssignmentBasicDto {
    id: number;
    title: string;
    createdAt: string; 
    dueDate?: string | null; 
    maxPoints?: number | null;
    submissionStatus?: string | null; 
}


export interface AssignmentDetailsDto extends AssignmentBasicDto {
    instructions?: string | null;
    createdById: number;
    createdByUsername: string;
    classroomId: number;
    isCodeAssignment: boolean;
    
}


export interface SubmittedFileDto {
    id: number;
    fileName: string;
    contentType: string;
    fileSize: number;
    uploadedAt: string; 
}

export interface SubmissionDto {
    id: number;
    assignmentId: number;
    studentId: number;
    studentUsername: string;
    submittedAt?: string | null;
    isLate: boolean;
    grade?: number | null;
    feedback?: string | null;
    gradedAt?: string | null;
    gradedById?: number | null;
    gradedByUsername?: string | null;
    submittedFiles: SubmittedFileDto[];
    lastEvaluationPointsObtained?: number | null;
    lastEvaluationTotalPossiblePoints?: number | null;
    lastEvaluationAt?: Date | null;
    lastEvaluationOverallStatus?: string | null;
    lastEvaluationDetailsJson?: string | null;
    lastEvaluatedLanguage?: string | null;
}

export interface GradeSubmissionPayload {
  grade?: number | null;
  feedback?: string | null;
}

export interface TeacherSubmissionViewDto {
    studentId: number;
    studentUsername: string;
    submissionId?: number | null; 
    submittedAt?: string | null; 
    isLate: boolean;
    grade?: number | null;
    hasFiles: boolean;
    status: string; 
    profilePhotoUrl?: string | null;
}

export interface CreateVirtualFilePayload {
    fileName: string;
}

export interface UpdateAssignmentPayload {
    title: string;
    instructions?: string | null;
    dueDate?: string | null;
    maxPoints?: number | null;
}