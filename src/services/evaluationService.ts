// src/services/evaluationService.ts
import api from './api';
import { FrontendEvaluateResponseDto } from '../types/evaluation';

export const triggerSubmissionEvaluation = async (submissionId: number | string, language: string): Promise<FrontendEvaluateResponseDto> => {
    try {
        const response = await api.post<FrontendEvaluateResponseDto>(`/api/submission-evaluations/${submissionId}/trigger?language=${language}`);
        return response.data;
    } catch (error: any) {
        console.error("Trigger Evaluation Error:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to trigger submission evaluation.');
    }
};