// src/pages/ClassroomPage.tsx
import React, { useEffect, useState, useCallback, FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as classroomService from '../services/classroomService';
import * as assignmentService from '../services/assignmentService'
import { ClassroomDetailsDto, ClassroomMemberDto, ClassroomRole, AddMemberPayload } from '../types/classroom';
import { AssignmentBasicDto, CreateAssignmentDto } from '../types/assignment';
import { formatDate } from 'date-fns';
import { Modal } from '../components/Modal';
//import { assignmentService } from '../services/assignmentService'



const ClassroomPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const [details, setDetails] = useState<ClassroomDetailsDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for modals
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [userIdToAdd, setUserIdToAdd] = useState<string>('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);

  // Assignment List State
  const [assignments, setAssignments] = useState<AssignmentBasicDto[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState<boolean>(true);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  // Create Assignment Modal State
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newAssignmentInstructions, setNewAssignmentInstructions] = useState('');
  const [newAssignmentDueDate, setNewAssignmentDueDate] = useState(''); // Store as string from input type="datetime-local"
  const [newAssignmentMaxPoints, setNewAssignmentMaxPoints] = useState<string>(''); // Store as string, parse later
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [createAssignmentError, setCreateAssignmentError] = useState<string | null>(null);


  const fetchClassroomData = useCallback(async () => {
    if (!classroomId) {
      setError("Classroom ID is missing.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await classroomService.getClassroomDetails(classroomId);
      setDetails(data);
    } catch (err: any) {
      setError(err.message || `Failed to load classroom ${classroomId}.`);
    } finally {
      setIsLoading(false);
    }
  }, [classroomId]);

  // Fetch Assignments Callback
  const fetchAssignments = useCallback(async () => {
    if (!classroomId) return; // Don't fetch if no ID
    setIsLoadingAssignments(true);
    setAssignmentError(null);
    try {
      const data = await assignmentService.getAssignmentsForClassroom(classroomId);
      setAssignments(data);
    } catch (err: any) {
      // Don't overwrite details error if assignments fail, show separate error
      setAssignmentError(err.message || 'Failed to load assignments.');
    } finally {
      setIsLoadingAssignments(false);
    }
  }, [classroomId]);

  useEffect(() => {
    fetchClassroomData();
    fetchAssignments();
  }, [fetchClassroomData, fetchAssignments]);

  const handleAddMember = async (roleToAdd: 'Teacher' | 'Student') => {
    const userIdNum = parseInt(userIdToAdd, 10);
    if (isNaN(userIdNum) || userIdNum <= 0) {
      setAddMemberError("Please enter a valid User ID.");
      return;
    }
    if (!classroomId) {
      setAddMemberError("Classroom ID is missing.");
      return;
    }

    setAddMemberError(null);
    setIsAddingMember(true);
    const payload: AddMemberPayload = { userId: userIdNum };

    try {
      if (roleToAdd === 'Teacher') {
        await classroomService.addTeacher(classroomId, payload);
      } else {
        await classroomService.addStudent(classroomId, payload);
      }
      // Success
      setShowAddTeacherModal(false);
      setShowAddStudentModal(false);
      setUserIdToAdd('');
      await fetchClassroomData(); // Refresh members list
      // TODO: Add success toast/message
    } catch (err: any) {
      setAddMemberError(err.message || `Failed to add ${roleToAdd.toLowerCase()}.`);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleCreateAssignment = async (e: FormEvent) => {
    e.preventDefault();
    if (!classroomId || !newAssignmentTitle.trim()) {
      setCreateAssignmentError("Title is required."); return;
    }

    const maxPointsNum = newAssignmentMaxPoints ? parseInt(newAssignmentMaxPoints, 10) : null;
    if (newAssignmentMaxPoints && (isNaN(maxPointsNum ?? NaN) || (maxPointsNum ?? -1) < 0)) {
      setCreateAssignmentError("Max points must be a non-negative number if provided."); return;
    }

    setCreateAssignmentError(null);
    setIsCreatingAssignment(true);

    const payload: CreateAssignmentDto = {
      title: newAssignmentTitle.trim(),
      instructions: newAssignmentInstructions.trim() || undefined,
      // Convert local datetime-local string to ISO string or null
      dueDate: newAssignmentDueDate ? new Date(newAssignmentDueDate).toISOString() : null,
      maxPoints: maxPointsNum
    };

    try {
      await assignmentService.createAssignment(classroomId, payload);
      // Success
      setShowCreateAssignmentModal(false);
      setNewAssignmentTitle('');
      setNewAssignmentInstructions('');
      setNewAssignmentDueDate('');
      setNewAssignmentMaxPoints('');
      await fetchAssignments(); // Refresh assignment list
      // TODO: Add success toast
    } catch (err: any) {
      setCreateAssignmentError(err.message || 'Failed to create assignment.');
    } finally {
      setIsCreatingAssignment(false);
    }
  };

  // Render helpers
  const renderMemberList = (members: ClassroomMemberDto[], title: string) => (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2 text-gray-600">{title} ({members.length})</h3>
      {members.length === 0 ? (
        <p className="text-sm text-gray-500">No {title.toLowerCase()} yet.</p>
      ) : (
        <ul className="space-y-1 list-disc list-inside pl-2">
          {members.map(member => (
            <li key={member.userId} className="text-sm text-gray-700">
              {member.username} <span className="text-gray-500">(ID: {member.userId})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // Loading and Error States
  if (isLoading) return <div className="container mx-auto mt-10 p-6 text-center">Loading classroom...</div>;
  if (error) return <div className="container mx-auto mt-10 p-6 text-center text-red-600">Error: {error}</div>;
  if (!details) return <div className="container mx-auto mt-10 p-6 text-center">Classroom not found.</div>;

  // Determine user permissions
  const canAddTeacher = details.currentUserRole === ClassroomRole.Owner;
  const canAddStudent = details.currentUserRole === ClassroomRole.Owner || details.currentUserRole === ClassroomRole.Teacher;
  const canCreateAssignments = details.currentUserRole === ClassroomRole.Owner || details.currentUserRole === ClassroomRole.Teacher;

  // Filter members by role
  const owners = details.members.filter(m => m.role === ClassroomRole.Owner);
  const teachers = details.members.filter(m => m.role === ClassroomRole.Teacher);
  const students = details.members.filter(m => m.role === ClassroomRole.Student);

  const isTeacherOrOwner = details?.currentUserRole === ClassroomRole.Owner || details?.currentUserRole === ClassroomRole.Teacher;

  return (
    <div className="container mx-auto mt-6 md:mt-10 p-4 md:p-0">
      {/* Back Link & Header */}
      <div className="mb-4 px-4 md:px-0">
        <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">&larr; Back to Dashboard</Link>
      </div>
      <div className="bg-white p-4 md:p-6 shadow rounded-lg mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{details.name}</h1>
        {details.description && <p className="mt-1 text-gray-600">{details.description}</p>}
        <p className="mt-2 text-sm text-gray-500">Your role: <span className="font-semibold">{details.currentUserRole}</span></p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Assignments Section (Main Column) */}
        <div className="lg:col-span-2 bg-white p-4 md:p-6 shadow rounded-lg">
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700">Assignments</h2>
            {canCreateAssignments && (
              <button
                onClick={() => { setCreateAssignmentError(null); setShowCreateAssignmentModal(true); }}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 text-sm"
              >
                + Create Assignment
              </button>
            )}
          </div>

          {/* Assignment List */}
          {isLoadingAssignments && <p className="text-gray-600">Loading assignments...</p>}
          {assignmentError && <p className="text-red-600 text-sm">Error loading assignments: {assignmentError}</p>}
          {!isLoadingAssignments && !assignmentError && (
            assignments.length === 0 ? (
              <p className="text-gray-500 italic">No assignments created yet.</p>
            ) : (
              <ul className="space-y-4">
                {assignments.map((assignment) => {
                  // Determine the link based on the user's role in THIS classroom
                  const assignmentLink = isTeacherOrOwner
                    ? `/assignments/${assignment.id}/manage` // Link for Teachers/Owners
                    : `/assignments/${assignment.id}`;      // Link for Students

                  return (
                    <li key={assignment.id} className="border border-gray-200 rounded p-3 hover:bg-gray-50 transition duration-150">
                      {/* Use the determined link */}
                      <Link to={assignmentLink} className="block">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-indigo-700 hover:underline">{assignment.title}</span>
                          {/* Conditionally render status ONLY if user is likely a student */}
                          {/* We check 'assignment.submissionStatus' which is ONLY populated for students by the API */}
                          {assignment.submissionStatus && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${assignment.submissionStatus === 'Graded' ? 'bg-green-100 text-green-800' :
                                assignment.submissionStatus.includes('Submitted') ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-600'
                              }`}>
                              {assignment.submissionStatus}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 space-x-3">
                          <span>Created: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                          {assignment.dueDate && <span>Due: {formatDate(assignment.dueDate, 'dd.mm.yy')}</span>}
                          {assignment.maxPoints && <span>Points: {assignment.maxPoints}</span>}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )
          )}
        </div>

        {/* Members Section (Sidebar) */}
        <div className="lg:col-span-1 bg-white p-4 md:p-6 shadow rounded-lg">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4 pb-2 border-b">Members</h2>
          <div className="space-y-2 mb-4">
            {/* Add Teacher Button */}
            {canAddTeacher && (
              <button
                onClick={() => { setAddMemberError(null); setUserIdToAdd(''); setShowAddTeacherModal(true); }}
                className="w-full text-left px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 text-sm font-medium"
              >
                + Add Teacher...
              </button>
            )}
            {/* Add Student Button */}
            {canAddStudent && (
              <button
                onClick={() => { setAddMemberError(null); setUserIdToAdd(''); setShowAddStudentModal(true); }}
                className="w-full text-left px-3 py-1.5 bg-teal-50 text-teal-700 rounded hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 text-sm font-medium"
              >
                + Add Student...
              </button>
            )}
          </div>
          {renderMemberList(owners, "Owner")}
          {renderMemberList(teachers, "Teachers")}
          {renderMemberList(students, "Students")}
        </div>

      </div>


      {/* --- Modals --- */}

      {/* Add Teacher Modal */}
      <Modal isOpen={showAddTeacherModal} onClose={() => setShowAddTeacherModal(false)} title="Add Teacher">
        {/* ... (form content from previous step) ... */}
        <form onSubmit={(e) => { e.preventDefault(); handleAddMember('Teacher'); }}>
          {addMemberError && <p className="text-sm text-red-600 mb-2">{addMemberError}</p>}
          <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
          <input id="teacherId" type="number" value={userIdToAdd} onChange={(e) => setUserIdToAdd(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Enter the ID of the user to add" required />
          <button type="submit" disabled={isAddingMember} className={`mt-4 w-full px-4 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${isAddingMember ? 'opacity-50 cursor-not-allowed' : ''}`}> {isAddingMember ? 'Adding...' : 'Add Teacher'} </button>
        </form>
      </Modal>

      {/* Add Student Modal */}
      <Modal isOpen={showAddStudentModal} onClose={() => setShowAddStudentModal(false)} title="Add Student">
        {/* ... (form content from previous step) ... */}
        <form onSubmit={(e) => { e.preventDefault(); handleAddMember('Student'); }}>
          {addMemberError && <p className="text-sm text-red-600 mb-2">{addMemberError}</p>}
          <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
          <input id="studentId" type="number" value={userIdToAdd} onChange={(e) => setUserIdToAdd(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Enter the ID of the user to add" required />
          <button type="submit" disabled={isAddingMember} className={`mt-4 w-full px-4 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${isAddingMember ? 'opacity-50 cursor-not-allowed' : ''}`}> {isAddingMember ? 'Adding...' : 'Add Student'} </button>
        </form>
      </Modal>

      {/* Create Assignment Modal */}
      <Modal isOpen={showCreateAssignmentModal} onClose={() => setShowCreateAssignmentModal(false)} title="Create New Assignment">
        <form onSubmit={handleCreateAssignment}>
          {createAssignmentError && <p className="text-sm text-red-600 mb-2">{createAssignmentError}</p>}
          <div className="mb-3">
            <label htmlFor="assignmentTitle" className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input id="assignmentTitle" type="text" value={newAssignmentTitle} onChange={(e) => setNewAssignmentTitle(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
          </div>
          <div className="mb-3">
            <label htmlFor="assignmentInstructions" className="block text-sm font-medium text-gray-700 mb-1">Instructions (Optional)</label>
            <textarea id="assignmentInstructions" value={newAssignmentInstructions} onChange={(e) => setNewAssignmentInstructions(e.target.value)} rows={4} className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
            <div>
              <label htmlFor="assignmentDueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
              <input id="assignmentDueDate" type="datetime-local" value={newAssignmentDueDate} onChange={(e) => setNewAssignmentDueDate(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="assignmentMaxPoints" className="block text-sm font-medium text-gray-700 mb-1">Max Points (Optional)</label>
              <input id="assignmentMaxPoints" type="number" value={newAssignmentMaxPoints} onChange={(e) => setNewAssignmentMaxPoints(e.target.value)} min="0" step="1" className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>
          <button type="submit" disabled={isCreatingAssignment} className={`mt-2 w-full px-4 py-1.5 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 ${isCreatingAssignment ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isCreatingAssignment ? 'Creating...' : 'Create Assignment'}
          </button>
        </form>
      </Modal>

    </div>
  );
};

export default ClassroomPage;