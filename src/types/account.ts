export interface ChangeUsernamePayload {
    newUsername: string;
}

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string; // For client-side confirmation
}