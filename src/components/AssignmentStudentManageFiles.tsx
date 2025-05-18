import { ChangeEvent, useRef, useState } from "react";
import * as assignmentService from '../services/assignmentService';
import { SubmissionDto } from "../types/assignment";

export const AssignmentStudentManageFiles: React.FC<{ mySubmission: SubmissionDto | null, canModifySubmission: boolean, assignmentId: string | undefined, callbackRefetchFiles: () => Promise<void>}> = ({ canModifySubmission, assignmentId, callbackRefetchFiles, mySubmission }) => {

    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
            setUploadError(null); // Clear previous upload error
        } else {
            setSelectedFile(null);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile || !assignmentId) return;
        setIsUploading(true);
        setUploadError(null);
        try {
            await assignmentService.uploadSubmissionFile(assignmentId, selectedFile);
            // Success
            setSelectedFile(null); // Clear selection
            if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input visually
            await callbackRefetchFiles(); // Refresh submission details (including files)
            // TODO: Add success toast
        } catch (err: any) {
            setUploadError(err.message || 'File upload failed.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteFile = async (fileId: number) => {
        if (!mySubmission?.id) return; // Need submission ID
        if (!window.confirm("Are you sure you want to delete this file?")) return;

        setDeletingFileId(fileId); // Indicate which file is being deleted
        setUploadError(null); // Clear general upload error if any
        try {
            await assignmentService.deleteSubmissionFile(mySubmission.id, fileId);
            await callbackRefetchFiles(); // Refresh file list
            // TODO: Add success toast
        } catch (err: any) {
            setUploadError(err.message || 'Failed to delete file.'); // Show error in upload section
        } finally {
            setDeletingFileId(null);
        }
    };

    return <>
        {canModifySubmission && (
            <div className="mb-6 p-3 border border-dashed border-gray-300 rounded">
                <h3 className="text-md font-semibold mb-2 text-gray-600">Attach Files</h3>
                {uploadError && <p className="text-sm text-red-600 mb-2">{uploadError}</p>}
                <div className="flex items-center space-x-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 disabled:opacity-50"
                        disabled={isUploading}
                    />
                    <button
                        onClick={handleFileUpload}
                        disabled={!selectedFile || isUploading}
                        className={`px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${isUploading ? 'animate-pulse' : ''}`}
                    >
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </div>
        )}

        {/* Submitted Files List */}
        <div className="mb-6">
            <h3 className="text-md font-semibold mb-2 text-gray-600">Your Submitted Files ({mySubmission?.submittedFiles?.length ?? 0})</h3>
            {mySubmission?.submittedFiles && mySubmission.submittedFiles.length > 0 ? (
                <ul className="space-y-2">
                    {mySubmission.submittedFiles.map(file => (
                        <li key={file.id} className="flex justify-between items-center text-sm p-2 border rounded bg-gray-50">
                            <span>
                                {/* TODO: Add download link here */}
                                <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline font-medium">{file.fileName}</a>
                                <span className="text-gray-500 ml-2">({(file.fileSize / 1024).toFixed(1)} KB)</span>
                            </span>
                            {canModifySubmission && ( // Only show delete if submission can be modified
                                <button
                                    onClick={() => handleDeleteFile(file.id)}
                                    disabled={deletingFileId === file.id}
                                    className="text-red-500 hover:text-red-700 disabled:opacity-50 text-xs font-semibold"
                                    title="Delete file"
                                >
                                    {deletingFileId === file.id ? 'Deleting...' : 'Delete'}
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500 italic">No files submitted yet.</p>
            )}
        </div>
    </>
}