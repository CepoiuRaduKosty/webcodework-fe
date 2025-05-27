// src/components/ClassroomTopElement.tsx
import React, { useState, useRef, ChangeEvent, FormEvent, useMemo } from 'react';
import { ClassroomDetailsDto, ClassroomMemberDto, ClassroomRole, LeaveClassroomPayload, UpdateClassroomPayload } from "../types/classroom";
import * as classroomService from '../services/classroomService'; // Assuming service functions are here
import { Modal } from './Modal'; // Assuming you have a reusable Modal component
import { FaEdit, FaTrashAlt, FaImage, FaCamera, FaBan, FaSignOutAlt, FaUserCircle, FaSearch } from 'react-icons/fa'; // Example icons


export const ClassroomTopElement: React.FC<{
    classroomDetails: ClassroomDetailsDto;
    onClassroomUpdate: () => Promise<void>;
    onClassroomLeave: () => void;
}> = ({ classroomDetails, onClassroomUpdate, onClassroomLeave }) => {
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

    const [showPromoteOwnerModal, setShowPromoteOwnerModal] = useState(false);
    const [availableTeachers, setAvailableTeachers] = useState<ClassroomMemberDto[]>([]);
    const [selectedNewOwnerId, setSelectedNewOwnerId] = useState<number | null>(null);
    const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
    const [isLeaving, setIsLeaving] = useState(false);
    const [leaveError, setLeaveError] = useState<string | null>(null);


    const handleOpenEditModal = () => {
        setEditedName(classroomDetails.name);
        setEditedDescription(classroomDetails.description || '');
        setEditError(null);
        setShowEditModal(true);
    };

    const handleInitiateLeaveClassroom = () => {
        setLeaveError(null); // Clear previous errors
        if (!window.confirm("Are you sure you want to leave this classroom?")) return;

        if (isOwner) {
            const teachers = classroomDetails.members.filter(
                m => m.role === ClassroomRole.Teacher && m.userId !== classroomDetails.members.find(mem => mem.role === ClassroomRole.Owner)?.userId // Exclude current owner if they are also listed as teacher for some reason
            );
            setAvailableTeachers(teachers);

            if (teachers.length === 0) {
                // Backend will also check this, but good to inform user upfront
                setLeaveError("As the owner, you must promote a teacher to be the new owner before you can leave. If no teachers are available, add one or delete the classroom.");
                // No modal shown in this case, error displayed directly or via alert
                alert("As the owner, you must promote a teacher to be the new owner before you can leave. If no teachers are available, add one or delete the classroom, or consider deleting the classroom if you are the last privileged member.");
                return;
            }
            setShowPromoteOwnerModal(true);
        } else {
            // Student or Teacher leaving
            performLeave();
        }
    };

    const performLeave = async (newOwnerId?: number) => {
        setIsLeaving(true);
        setLeaveError(null);
        try {
            const payload: LeaveClassroomPayload = newOwnerId ? { newOwnerUserId: newOwnerId } : {};
            await classroomService.leaveClassroom(classroomDetails.id, payload);
            onClassroomLeave(); // Callback to parent (e.g., navigate to dashboard)
        } catch (err: any) {
            setLeaveError(err.message || "Failed to leave classroom.");
            // If it's from the modal, error will show in modal. If direct leave, consider how to show.
            if (!showPromoteOwnerModal) alert(`Error leaving classroom: ${err.message}`);

        } finally {
            setIsLeaving(false);
            setShowPromoteOwnerModal(false); // Ensure modal closes if it was open
        }
    };

    const handlePromoteAndLeave = () => {
        if (!selectedNewOwnerId) {
            setLeaveError("Please select a teacher to transfer ownership to.");
            return;
        }
        performLeave(selectedNewOwnerId);
    };

    const filteredTeachers = useMemo(() => {
        return availableTeachers.filter(teacher =>
            teacher.username.toLowerCase().includes(teacherSearchTerm.toLowerCase())
        );
    }, [availableTeachers, teacherSearchTerm]);


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
            onClassroomLeave(); // Navigate away
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
                    <div className="flex space-x-2 mt-3 sm:mt-0 flex-shrink-0">
                    {isOwner && (<>
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
                                {isDeletingClassroom ? <FaTrashAlt className="animate-pulse mr-1.5" /> : <FaTrashAlt className="mr-1.5" />}
                                {isDeletingClassroom ? 'Deleting...' : 'Delete Classroom'}
                            </button>
                        </>
                    )}
                    <button
                        onClick={handleInitiateLeaveClassroom}
                        disabled={isLeaving}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600 flex items-center disabled:opacity-50"
                    >
                        {isLeaving ? <FaSignOutAlt className="animate-pulse mr-1.5" /> : <FaSignOutAlt className="mr-1.5" />}
                        {isLeaving ? 'Leaving...' : 'Leave Classroom'}
                    </button>
                    </div>
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

            {isOwner && (
                <Modal isOpen={showPromoteOwnerModal} onClose={() => { setShowPromoteOwnerModal(false); setLeaveError(null); }} title="Transfer Ownership & Leave">
                    <div className="space-y-4">
                        <p className="text-sm text-[#112D4E]">
                            To leave this classroom, you must transfer ownership to an existing teacher.
                        </p>
                        {leaveError && <p className="text-sm text-red-600 p-2 bg-red-50 rounded border border-red-200">{leaveError}</p>}

                        {/* Teacher Search */}
                        <div className="relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search teachers by name..."
                                value={teacherSearchTerm}
                                onChange={(e) => setTeacherSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-[#DBE2EF] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF] text-[#112D4E] sm:text-sm"
                            />
                        </div>

                        {/* Teacher List */}
                        <div className="max-h-60 overflow-y-auto border border-[#DBE2EF] rounded-md">
                            {filteredTeachers.length > 0 ? (
                                <ul className="divide-y divide-[#DBE2EF]">
                                    {filteredTeachers.map(teacher => (
                                        <li key={teacher.userId} className="p-3 hover:bg-[#DBE2EF] transition-colors">
                                            <label className="flex items-center space-x-3 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="newOwner"
                                                    value={teacher.userId}
                                                    checked={selectedNewOwnerId === teacher.userId}
                                                    onChange={() => setSelectedNewOwnerId(teacher.userId)}
                                                    className="h-4 w-4 text-[#3F72AF] border-gray-300 focus:ring-[#3F72AF]"
                                                />
                                                 {teacher.profilePhotoUrl ? (
                                                    <img src={teacher.profilePhotoUrl} alt={teacher.username} className="w-8 h-8 rounded-full object-cover"/>
                                                ) : (
                                                    <FaUserCircle size={32} className="text-gray-400"/>
                                                )}
                                                <span className="text-sm font-medium text-[#112D4E]">{teacher.username}</span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="p-3 text-sm text-gray-500 italic">
                                    {availableTeachers.length > 0 ? "No teachers match your search." : "No other teachers available in this classroom."}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 pt-3 border-t mt-4">
                            <button type="button" onClick={() => { setShowPromoteOwnerModal(false); setLeaveError(null); }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400">
                                Cancel
                            </button>
                            <button type="button" onClick={handlePromoteAndLeave} disabled={isLeaving || !selectedNewOwnerId}
                                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-60">
                                {isLeaving ? 'Processing...' : 'Promote & Leave'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};