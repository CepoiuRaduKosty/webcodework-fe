
import api from './api';
import { FrontendEvaluateResponseDto, LegitimacyEvaluationDto } from '../types/evaluation';

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

export const getLegitimacyEvaluation = async (submissionId: number): Promise<LegitimacyEvaluationDto> => {
    try {
        const response = await api.get<LegitimacyEvaluationDto>(`/api/submissions/${submissionId}/legitimacy-evaluation`);
        return response.data;
    } catch (error: any) {
        console.error("Get Legitimacy Evaluation Error:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to retrieve legitimacy evaluation.');
    }
};

export const requestLegitimacyEvaluation = async (submissionId: number, forceRevaluation: boolean = false): Promise<LegitimacyEvaluationDto> => {
    try {
        const response = await api.post<LegitimacyEvaluationDto>(`/api/submissions/${submissionId}/legitimacy-evaluation`, {
            forceRevaluation
        });
        return response.data;
    } catch (error: any) {
        console.error("Request Legitimacy Evaluation Error:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to request legitimacy evaluation.');
    }
};