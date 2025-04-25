import { format, parseISO } from 'date-fns'; // For date formatting
import { AssignmentDetailsDto } from "../types/assignment"

// Format Dates Helper
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try { return format(parseISO(dateString), 'PPp'); } catch { return 'Invalid Date'; }
};

export const AssignmentTopElement: React.FC<{ assignmentDetails: AssignmentDetailsDto }> = ({ assignmentDetails }) => {

    // --- Handlers (Placeholder for future actions) ---
    const handleEditAssignment = () => {
        // TODO: Navigate to an edit page or open an edit modal
        alert('Edit Assignment functionality not implemented yet.');
    };

    const handleDeleteAssignment = async () => {
        // TODO: Implement delete assignment call
        if (!assignmentDetails.id) return;
        if (window.confirm("Are you sure you want to delete this assignment and all associated submissions?")) {
            alert('Delete Assignment functionality not implemented yet.');
            // try {
            //     await assignmentService.deleteAssignment(assignmentId);
            //     navigate(`/classrooms/${assignmentDetails?.classroomId}`); // Go back to classroom
            // } catch(err: any) { setError(err.message || 'Failed to delete'); }
        }
    };

    return ( // 
        <div className="bg-white p-4 md:p-6 shadow rounded-lg mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-3 pb-3 border-b">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">{assignmentDetails.title}</h1>
                    <div className="text-xs text-gray-500 space-x-3">
                        <span>By: {assignmentDetails.createdByUsername}</span>
                        <span>Created: {formatDate(assignmentDetails.createdAt)}</span>
                        {assignmentDetails.dueDate && <span>Due: {formatDate(assignmentDetails.dueDate)}</span>}
                        {assignmentDetails.maxPoints && <span>Points: {assignmentDetails.maxPoints}</span>}
                    </div>
                </div>
                {/* TODO: Add Edit/Delete Buttons */}
                <div className="flex space-x-2 mt-2 sm:mt-0">
                    <button onClick={handleEditAssignment} className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600">Edit</button>
                    <button onClick={handleDeleteAssignment} className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                </div>
            </div>
            {assignmentDetails.instructions && (
                <div className="prose prose-sm max-w-none mt-2">
                    <h3 className="text-sm font-semibold mb-1 text-gray-600">Instructions:</h3>
                    <p className="whitespace-pre-wrap">{assignmentDetails.instructions}</p>
                </div>
            )}
        </div>
    )
}