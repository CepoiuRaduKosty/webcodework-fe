// src/pages/ClassroomPage.tsx
import React, { useEffect, useState, useCallback, FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as classroomService from '../services/classroomService';
import { ClassroomDetailsDto, ClassroomMemberDto, ClassroomRole, AddMemberPayload } from '../types/classroom';
import { formatDate } from 'date-fns';
import { Modal } from '../components/Modal';
import { ClassroomTopElement } from '../components/ClassroomTopElement';
import { ClassroomAssignmentsSection } from '../components/ClassroomAssignmentsSection';

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

  const navigate = useNavigate();

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



  useEffect(() => {
    fetchClassroomData();
  }, [fetchClassroomData]);

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

  const handleClassroomDeleted = () => {
    navigate('/dashboard', { replace: true });
  };

  // Loading and Error States
  if (isLoading) return <div className="container mx-auto mt-10 p-6 text-center">Loading classroom...</div>;
  if (error) return <div className="container mx-auto mt-10 p-6 text-center text-red-600">Error: {error}</div>;
  if (!details) return <div className="container mx-auto mt-10 p-6 text-center">Classroom not found.</div>;

  // Determine user permissions
  const canAddTeacher = details.currentUserRole === ClassroomRole.Owner;
  const canAddStudent = details.currentUserRole === ClassroomRole.Owner || details.currentUserRole === ClassroomRole.Teacher;


  // Filter members by role
  const owners = details.members.filter(m => m.role === ClassroomRole.Owner);
  const teachers = details.members.filter(m => m.role === ClassroomRole.Teacher);
  const students = details.members.filter(m => m.role === ClassroomRole.Student);

  return (
    <div className="min-h-screen bg-[#F9F7F7] text-[#112D4E]"> 
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8"> 
        <div className="mb-6 px-4 md:px-0">
          <Link to="/dashboard" className="text-sm text-[#3F72AF] hover:text-[#112D4E] hover:underline inline-flex items-center">
            &larr; Back to Dashboard
          </Link>
        </div>
        <ClassroomTopElement classroomDetails={details} onClassroomDelete={handleClassroomDeleted} onClassroomUpdate={fetchClassroomData} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <ClassroomAssignmentsSection details={details} />

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
      </div>
    </div>
  );
};

export default ClassroomPage;