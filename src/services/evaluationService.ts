
import api from './api';
import { FrontendEvaluateResponseDto } from '../types/evaluation';

const API_BASE_EVALUATION = `${import.meta.env.VITE_API_BASE_EVALUATION}`

export const triggerSubmissionEvaluation = async (submissionId: number | string, language: string): Promise<FrontendEvaluateResponseDto> => {
    try {
        const response = await api.post<FrontendEvaluateResponseDto>(`${API_BASE_EVALUATION}/${submissionId}/trigger?language=${language}`);
        return response.data;
    } catch (error: any) {
        console.error("Trigger Evaluation Error:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to trigger submission evaluation.');
    }
};