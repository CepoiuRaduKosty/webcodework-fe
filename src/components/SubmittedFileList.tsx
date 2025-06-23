
import React, { JSX, useState } from 'react';
import { SubmittedFileDto, SubmissionDto } from '../types/assignment';
import * as assignmentService from '../services/assignmentService'; 
import { FaFilePdf, FaFileWord, FaFileImage, FaFileAlt, FaFileCode, FaDownload, FaSpinner } from 'react-icons/fa';

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

interface SubmittedFilesListProps {
    submission: SubmissionDto | null; 
    files: SubmittedFileDto[];
    
}

export const SubmittedFilesList: React.FC<SubmittedFilesListProps> = ({ submission, files }) => {
    const [downloadingFileId, setDownloadingFileId] = useState<number | null>(null);

    const handleDownloadFile = async (file: SubmittedFileDto) => {
        if (!submission?.id) return;
        setDownloadingFileId(file.id);
        try {
            await assignmentService.downloadSubmittedFile(submission.id, file.id, file.fileName);
        } catch (error) {
            alert(`Failed to download file: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setDownloadingFileId(null);
        }
    };

    if (!files || files.length === 0) {
        return <p className="text-sm text-gray-500 italic">No files were submitted for this assignment.</p>;
    }

    return (
        <div className="space-y-3">
            <h4 className="text-md font-semibold text-[#112D4E] mb-2">Submitted Files:</h4>
            <ul className="space-y-2">
                {files.map(file => (
                    <li key={file.id} className="flex items-center justify-between text-sm p-3 bg-[#F9F7F7] border border-[#DBE2EF] rounded-lg shadow-sm">
                        <div className="flex items-center min-w-0">
                            {getFileTypeIcon(file.fileName)}
                            <span className="font-medium text-[#112D4E] truncate ml-1" title={file.fileName}>
                                {file.fileName}
                            </span>
                            <span className="ml-2 text-xs text-slate-500 flex-shrink-0">({(file.fileSize / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                            onClick={() => handleDownloadFile(file)}
                            disabled={downloadingFileId === file.id}
                            className="ml-3 p-1.5 text-[#3F72AF] hover:text-[#112D4E] hover:bg-[#DBE2EF] rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title={`Download ${file.fileName}`}
                        >
                            {downloadingFileId === file.id ?
                                <FaSpinner className="animate-spin h-4 w-4" /> :
                                <FaDownload className="h-4 w-4" />
                            }
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};