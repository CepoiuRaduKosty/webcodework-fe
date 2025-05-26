// src/components/ClassroomTopElement.tsx
import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { ClassroomDetailsDto, ClassroomRole, UpdateClassroomPayload } from "../types/classroom";
import * as classroomService from '../services/classroomService'; // Assuming service functions are here
import { Modal } from './Modal'; // Assuming you have a reusable Modal component
import { FaEdit, FaTrashAlt, FaImage, FaCamera, FaBan } from 'react-icons/fa'; // Example icons


export const ClassroomTopElement: React.FC<{
    classroomDetails: ClassroomDetailsDto;
    onClassroomUpdate: () => Promise<void>; // Callback to refresh data in parent
    onClassroomDelete: () => void; // Callback to navigate away after deletion
}> = ({ classroomDetails, onClassroomUpdate, onClassroomDelete }) => {
    const isOwner = classroomDetails.currentUserRole === ClassroomRole.Owner;
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Edit Details Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editedName, setEditedName] = useState(classroomDetails.name);
    const [editedDescription, setEditedDescription] = useState(classroomDetails.description || '');
    const [isUpdatingDetails, setIsUpdatingDetails] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

    // Photo States
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
    const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);

    // Delete Classroom State
    const [isDeletingClassroom, setIsDeletingClassroom] = useState(false);


    const handleOpenEditModal = () => {
        setEditedName(classroomDetails.name);
        setEditedDescription(classroomDetails.description || '');
        setEditError(null);
        setShowEditModal(true);
    };

    const handleSaveChanges = async (e: FormEvent) => {
        e.preventDefault();
        if (!editedName.trim()) {
            setEditError("Classroom name cannot be empty.");
            return;
        }
        setIsUpdatingDetails(true);
        setEditError(null);
        try {
            const payload: UpdateClassroomPayload = { name: editedName, description: editedDescription };
            await classroomService.updateClassroomDetails(classroomDetails.id, payload);
            setShowEditModal(false);
            await onClassroomUpdate(); // Refresh data in parent
        } catch (err: any) {
            setEditError(err.message || "Failed to save changes.");
        } finally {
            setIsUpdatingDetails(false);
        }
    };

    const handlePhotoInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploadingPhoto(true);
        setPhotoUploadError(null);
        try {
            await classroomService.uploadClassroomPhoto(classroomDetails.id, file);
            await onClassroomUpdate();
        } catch (err: any) {
            setPhotoUploadError(err.message || "Failed to upload photo.");
        } finally {
            setIsUploadingPhoto(false);
            if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        }
    };

    const handleDeletePhoto = async () => {
        if (!window.confirm("Are you sure you want to remove the classroom photo?")) return;
        setIsDeletingPhoto(true);
        setPhotoUploadError(null); // Clear previous upload errors
        try {
            await classroomService.deleteClassroomPhoto(classroomDetails.id);
            await onClassroomUpdate();
        } catch (err: any) {
             // Use photoUploadError state for consistency or create a new one
            setPhotoUploadError(err.message || "Failed to delete photo.");
        } finally {
            setIsDeletingPhoto(false);
        }
    };

    const handleDeleteClassroom = async () => {
         if (!window.confirm(`Are you sure you want to permanently delete the classroom "${classroomDetails.name}"? This action cannot be undone.`)) return;
        setIsDeletingClassroom(true);
        try {
            await classroomService.deleteClassroom(classroomDetails.id);
            onClassroomDelete(); // Navigate away
        } catch (err: any) {
            alert(`Failed to delete classroom: ${err.message}`); // Simple alert for critical error
        } finally {
            setIsDeletingClassroom(false);
        }
    };


    return (
        <div className="bg-white shadow-xl rounded-2xl mb-8 overflow-hidden">
            {/* Photo Section */}
            <div className={`relative h-48 md:h-64 w-full ${classroomDetails.photoUrl ? '' : 'bg-[#DBE2EF]'}`}>
                {classroomDetails.photoUrl ? (
                    <img src={classroomDetails.photoUrl} alt={`${classroomDetails.name} cover`} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <FaImage size={60} className="text-[#3F72AF] opacity-50" />
                    </div>
                )}
                {/* Photo Action Buttons (only for owner) */}
                {isOwner && (
                    <div className="absolute top-3 right-3 flex flex-col space-y-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingPhoto || isDeletingPhoto}
                            title={classroomDetails.photoUrl ? "Change Photo" : "Upload Photo"}
                            className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-opacity duration-200 disabled:opacity-50"
                        >
                            {isUploadingPhoto ? <FaCamera className="animate-pulse" /> : <FaCamera />}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handlePhotoInputChange} accept="image/jpeg, image/png, image/gif, image/webp" className="hidden" />

                        {classroomDetails.photoUrl && (
                            <button
                                onClick={handleDeletePhoto}
                                disabled={isDeletingPhoto || isUploadingPhoto}
                                title="Remove Photo"
                                className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-opacity duration-200 disabled:opacity-50"
                            >
                                 {isDeletingPhoto ? <FaBan className="animate-pulse" /> : <FaBan />}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Details Section */}
            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#112D4E] mb-1">{classroomDetails.name}</h1>
                        {classroomDetails.description && (
                            <p className="mt-1 text-sm text-gray-600 max-w-prose">{classroomDetails.description}</p>
                        )}
                         <p className="mt-2 text-xs text-gray-500">
                            Your role: <span className="font-semibold text-[#3F72AF]">{ClassroomRole[classroomDetails.currentUserRole]}</span>
                         </p>
                    </div>
                    {/* Owner Action Buttons for Details/Delete */}
                    {isOwner && (
                         <div className="flex space-x-2 mt-3 sm:mt-0 flex-shrink-0">
                            <button
                                onClick={handleOpenEditModal}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-[#3F72AF] rounded-md hover:bg-[#112D4E] flex items-center"
                            >
                                <FaEdit className="mr-1.5" /> Edit Details
                            </button>
                             <button
                                onClick={handleDeleteClassroom}
                                disabled={isDeletingClassroom}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-800 flex items-center disabled:opacity-50"
                            >
                               {isDeletingClassroom ? <FaTrashAlt className="animate-pulse mr-1.5"/> : <FaTrashAlt className="mr-1.5" />}
                               {isDeletingClassroom ? 'Deleting...' : 'Delete Classroom'}
                            </button>
                         </div>
                    )}
                </div>
                 {photoUploadError && <p className="text-sm text-red-600 mt-3">{photoUploadError}</p>}
            </div>


            {/* Edit Details Modal */}
            {isOwner && (
                <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Classroom Details">
                    <form onSubmit={handleSaveChanges} className="space-y-4">
                        {editError && <p className="text-sm text-red-600 p-2 bg-red-50 rounded border border-red-200">{editError}</p>}
                        <div>
                            <label htmlFor="classroomNameEdit" className="block text-sm font-medium text-[#112D4E] mb-1">Classroom Name <span className="text-red-500">*</span></label>
                            <input type="text" id="classroomNameEdit" value={editedName} onChange={(e) => setEditedName(e.target.value)} required minLength={3} maxLength={150}
                                className="w-full px-3 py-2 border border-[#DBE2EF] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF]" />
                        </div>
                        <div>
                            <label htmlFor="classroomDescEdit" className="block text-sm font-medium text-[#112D4E] mb-1">Description <span className="text-xs text-gray-500">(Optional)</span></label>
                            <textarea id="classroomDescEdit" value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} rows={4} maxLength={500}
                                className="w-full px-3 py-2 border border-[#DBE2EF] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF]" />
                        </div>
                        <div className="flex justify-end space-x-3 pt-3">
                            <button type="button" onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400">
                                Cancel
                            </button>
                            <button type="submit" disabled={isUpdatingDetails}
                                className="px-4 py-2 text-sm font-medium text-white bg-[#3F72AF] rounded-md hover:bg-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] disabled:opacity-60">
                                {isUpdatingDetails ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};