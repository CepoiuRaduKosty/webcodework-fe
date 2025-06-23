import api from './api';
import { ChangeUsernamePayload, ChangePasswordPayload } from '../types/account';
import { UserProfileDto } from '../types/auth';

const API_BASE_PATH = '/api/auth/account';
const PHOTO_API_BASE_PATH = '/api/user/profile/photo';

export const changeUsername = async (payload: ChangeUsernamePayload): Promise<void> => {
    try {
        await api.put(`${API_BASE_PATH}/username`, payload);
    } catch (error: any) {
        const errorMessage = error.response?.data?.errors?.NewUsername?.join(', ') || 
                             error.response?.data?.NewUsername?.join(', ') || 
                             error.response?.data?.message ||                 
                             error.message ||                                 
                             'Failed to change username.';
        throw new Error(errorMessage);
    }
};


export const changePassword = async (payload: ChangePasswordPayload): Promise<void> => {
    try {
        await api.put(`${API_BASE_PATH}/password`, payload);
    } catch (error: any) {
        const newPasswordErrors = error.response?.data?.errors?.NewPassword?.join(', ');
        const currentPasswordErrors = error.response?.data?.errors?.CurrentPassword?.join(', ');
        const generalMessage = error.response?.data?.message;

        let errorMessage = newPasswordErrors || currentPasswordErrors || generalMessage || error.message || 'Failed to change password.';
        if (!newPasswordErrors && !currentPasswordErrors && !generalMessage && error.response?.data?.errors) {
            const otherErrors = Object.values(error.response.data.errors).flat().join(', ');
            if (otherErrors) errorMessage = otherErrors;
        }

        throw new Error(errorMessage);
    }
};

export const uploadProfilePhoto = async (photoFile: File): Promise<UserProfileDto> => {
    const formData = new FormData();
    formData.append('photoFile', photoFile); 

    try {
        const response = await api.post<UserProfileDto>(PHOTO_API_BASE_PATH, formData, {
            headers: {
                'Content-Type': undefined, 
            },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.detail || error.response?.data?.message || 'Failed to upload profile photo.');
    }
};


export const deleteProfilePhoto = async (): Promise<void> => {
    try {
        await api.delete(PHOTO_API_BASE_PATH);
    } catch (error: any) {
        throw new Error(error.response?.data?.detail || error.response?.data?.message || 'Failed to delete profile photo.');
    }
};