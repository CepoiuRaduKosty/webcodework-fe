
import React, { ChangeEvent, JSX, useRef, useState } from "react"; 
import * as assignmentService from '../services/assignmentService';
import { SubmissionDto, SubmittedFileDto } from "../types/assignment";
import {
    FaFileUpload, FaTrashAlt, FaSpinner, FaExclamationCircle,
    FaFilePdf, FaFileWord, FaFileImage, FaFileAlt, FaFileCode 
} from 'react-icons/fa';


const getFileTypeIcon = (fileName: string): JSX.Element => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return <FaFilePdf className="text-red-500 mr-2 flex-shrink-0" size={18} />;
    if (['doc', 'docx'].includes(extension || '')) return <FaFileWord className="text-blue-500 mr-2 flex-shrink-0" size={18}/>;
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension || '')) return <FaFileImage className="text-green-500 mr-2 flex-shrink-0" size={18}/>;
    if (['c', 'py', 'java', 'js', 'ts', 'go', 'rs'].includes(extension || '') || fileName.toLowerCase() === 'solution') {
        return <FaFileCode className="text-purple-500 mr-2 flex-shrink-0" size={18}/>;
    }
    return <FaFileAlt className="text-gray-500 mr-2 flex-shrink-0" size={18}/>;
};


export const AssignmentStudentManageFiles: React.FC<{
    mySubmission: SubmissionDto | null,
    canModifySubmission: boolean,
    assignmentId: string | undefined,
    callbackRefetchFiles: () => Promise<void>
}> = ({ canModifySubmission, assignmentId, callbackRefetchFiles, mySubmission }) => {

    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [downloadingFileId, setDownloadingFileId] = useState<number | null>(null);

    const handleDownloadFile = async (file: SubmittedFileDto) => {
        if (!mySubmission?.id) return;
        setDownloadingFileId(file.id);
        try {
            await assignmentService.downloadSubmittedFile(mySubmission.id, file.id, file.fileName);
        } catch (error) {
            
            console.error("Download trigger failed:", error);
        } finally {
            setDownloadingFileId(null);
        }
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
            setUploadError(null);
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
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            await callbackRefetchFiles();
            
        } catch (err: any) {
            setUploadError(err.message || 'File upload failed.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteFile = async (fileId: number) => {
        if (!mySubmission?.id) return;
        if (!window.confirm("Are you sure you want to delete this file?")) return;
        setDeletingFileId(fileId);
        setUploadError(null);
        try {
            await assignmentService.deleteSubmissionFile(mySubmission.id, fileId);
            await callbackRefetchFiles();
            
        } catch (err: any) {
            setUploadError(err.message || 'Failed to delete file.'); 
        } finally {
            setDeletingFileId(null);
        }
    };

    return (
        <div className="text-[#112D4E] space-y-6">
            {/* File Upload Section - only if submission can be modified */}
            {canModifySubmission && (
                <div className="p-4 md:p-6 bg-[#DBE2EF] rounded-xl shadow"> {/* Palette: Light blue/gray accent bg */}
                    <h3 className="text-lg font-semibold text-[#112D4E] mb-3 flex items-center">
                        <FaFileUpload className="mr-2 text-[#3F72AF]" /> Attach Files
                    </h3>
                    {uploadError && (
                        <p className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md mb-3 flex items-center">
                           <FaExclamationCircle className="mr-2 h-4 w-4"/> {uploadError}
                        </p>
                    )}
                    <div className="flex flex-col sm:flex-row items-center sm:space-x-3 space-y-3 sm:space-y-0">
                        <label htmlFor="file-upload-student" className="sr-only">Choose file</label>
                        <input
                            id="file-upload-student"
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileChange}
                            className={`block w-full text-sm text-[#112D4E] rounded-lg border border-[#B0C4DE] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF]
                                file:mr-4 file:py-2.5 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold
                                file:bg-[#3F72AF] file:text-white hover:file:bg-[#112D4E] disabled:opacity-60
                                ${isUploading ? 'opacity-60' : ''}`}
                            disabled={isUploading}
                        />
                        <button
                            onClick={handleFileUpload}
                            disabled={!selectedFile || isUploading}
                            className={`w-full sm:w-auto flex-shrink-0 flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-[#3F72AF] rounded-lg hover:bg-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:ring-offset-2 focus:ring-offset-[#DBE2EF] disabled:opacity-60 transition-colors duration-150
                                ${isUploading ? 'cursor-not-allowed' : ''}`}
                        >
                            {isUploading ? <FaSpinner className="animate-spin mr-2" /> : <FaFileUpload className="mr-2" />}
                            {isUploading ? 'Uploading...' : `Upload ${selectedFile ? '(' + (selectedFile.size / 1024).toFixed(1) + 'KB)' : ''}`}
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Max file size: 10MB. Allowed types: common document/image/code files.</p>
                </div>
            )}

            {/* Submitted Files List Section */}
            <div className={`${canModifySubmission ? '' : 'mt-0'}`}> {/* Remove margin if upload section is hidden */}
                <h3 className="text-lg font-semibold text-[#112D4E] mb-3">
                    Your Submitted Files ({mySubmission?.submittedFiles?.length ?? 0})
                </h3>
                {mySubmission?.submittedFiles && mySubmission.submittedFiles.length > 0 ? (
                    <ul className="space-y-3">
                        {mySubmission.submittedFiles.map(file => (
                            <li key={file.id} className="flex items-center justify-between text-sm p-3 bg-[#F9F7F7] border border-[#DBE2EF] rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center min-w-0">
                                    {getFileTypeIcon(file.fileName)}
                                    <button
                                       onClick={() => handleDownloadFile(file)}
                                       disabled={downloadingFileId === file.id}
                                       className="font-medium text-[#3F72AF] hover:text-[#112D4E] hover:underline truncate text-left disabled:opacity-70 disabled:cursor-not-allowed"
                                       title={`Download ${file.fileName}`}
                                    >
                                        {downloadingFileId === file.id ? 'Downloading...' : file.fileName}
                                    </button>
                                    <span className="ml-2 text-xs text-slate-500 flex-shrink-0">({(file.fileSize / 1024).toFixed(1)} KB)</span>
                                </div>
                                {canModifySubmission && (
                                    <button
                                        onClick={() => handleDeleteFile(file.id)}
                                        disabled={deletingFileId === file.id || isUploading}
                                        className="ml-3 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title={`Delete ${file.fileName}`}
                                    >
                                        {deletingFileId === file.id ?
                                            <FaSpinner className="animate-spin h-4 w-4" /> :
                                            <FaTrashAlt className="h-4 w-4" />
                                        }
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-6 px-4 bg-[#F9F7F7] border-2 border-dashed border-[#DBE2EF] rounded-lg">
                        <FaFileAlt className="mx-auto h-10 w-10 text-[#DBE2EF]" />
                        <p className="mt-2 text-sm text-[#112D4E] opacity-75 italic">
                            No files submitted yet. {canModifySubmission ? "Use the section above to attach files." : ""}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};