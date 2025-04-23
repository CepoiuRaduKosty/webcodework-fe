import React, { useEffect, useState, useCallback, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as classroomService from '../services/classroomService'; // Import classroom service
import { UserClassroomDto, CreateClassroomPayload, ClassroomRole } from '../types/classroom'; // Import types

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [classrooms, setClassrooms] = useState<UserClassroomDto[]>([]);
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState<boolean>(true);
  const [classroomError, setClassroomError] = useState<string | null>(null);

  // State for creating a classroom
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newClassroomName, setNewClassroomName] = useState<string>('');
  const [newClassroomDesc, setNewClassroomDesc] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Fetch user's classrooms
  const fetchClassrooms = useCallback(async () => {
    setIsLoadingClassrooms(true);
    setClassroomError(null);
    try {
      const data = await classroomService.getMyClassrooms();
      setClassrooms(data);
    } catch (err: any) {
      setClassroomError(err.message || 'Failed to load classrooms.');
    } finally {
      setIsLoadingClassrooms(false);
    }
  }, []);

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);


  // Handle create classroom form submission
  const handleCreateClassroom = async (e: FormEvent) => {
    e.preventDefault();
    if (!newClassroomName.trim()) {
      setCreateError("Classroom name is required.");
      return;
    }
    setCreateError(null);
    setIsCreating(true);

    const payload: CreateClassroomPayload = {
      name: newClassroomName,
      description: newClassroomDesc || undefined // Send undefined if empty
    };

    try {
      await classroomService.createClassroom(payload);
      // Success
      setShowCreateForm(false);
      setNewClassroomName('');
      setNewClassroomDesc('');
      await fetchClassrooms(); // Refresh the list
      // TODO: Add a success toast/message
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create classroom.');
    } finally {
      setIsCreating(false);
    }
  };


  return (
    <div className="container mx-auto mt-10 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 shadow rounded-lg">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 sm:mb-0">Dashboard</h1>
        {user && (
          <p className="text-md text-gray-600 mb-2 sm:mb-0">
            Welcome, <span className="font-semibold">{user.username}</span>!
          </p>
        )}
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 text-sm"
        >
          Logout
        </button>
      </div>

      {/* Classroom Section */}
      <div className="bg-white p-4 md:p-6 shadow rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-700">My Classrooms</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 text-sm"
          >
            {showCreateForm ? 'Cancel' : '+ Create Classroom'}
          </button>
        </div>

        {/* Create Classroom Form */}
        {showCreateForm && (
          <form onSubmit={handleCreateClassroom} className="mb-6 p-4 border border-gray-200 rounded bg-gray-50">
            <h3 className="text-lg font-semibold mb-2 text-gray-600">New Classroom</h3>
            {createError && <p className="text-sm text-red-600 mb-2">{createError}</p>}
            <div className="mb-3">
              <label htmlFor="classroomName" className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
              <input
                id="classroomName"
                type="text"
                value={newClassroomName}
                onChange={(e) => setNewClassroomName(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., Introduction to Physics"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="classroomDesc" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                id="classroomDesc"
                value={newClassroomDesc}
                onChange={(e) => setNewClassroomDesc(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="A brief description of the classroom's purpose"
              />
            </div>
            <button
              type="submit"
              disabled={isCreating}
              className={`px-4 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </form>
        )}

        {/* Classroom List */}
        {isLoadingClassrooms && <p className="text-gray-600">Loading classrooms...</p>}
        {classroomError && <p className="text-red-600">Error: {classroomError}</p>}
        {!isLoadingClassrooms && !classroomError && (
          classrooms.length === 0 ? (
            <p className="text-gray-500">You are not currently in any classrooms.</p>
          ) : (
            <ul className="space-y-3">
              {classrooms.map((classroom) => (
                <li key={classroom.classroomId} className="border border-gray-200 rounded p-3 hover:bg-gray-50 transition duration-150">
                  <Link to={`/classrooms/${classroom.classroomId}`} className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-blue-700 hover:underline">{classroom.name}</span>
                      {classroom.description && <p className="text-sm text-gray-500 mt-1">{classroom.description}</p>}
                    </div>
                    <span className="text-xs font-medium text-white bg-gray-500 px-2 py-0.5 rounded-full">
                      {ClassroomRole[classroom.userRole]} {/* Display user's role */}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  );
};

export default DashboardPage;