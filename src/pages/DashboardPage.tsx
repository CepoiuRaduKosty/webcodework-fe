// src/pages/DashboardPage.tsx
import React, { useEffect, useState, useCallback, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as classroomService from '../services/classroomService';
import { UserClassroomDto, CreateClassroomPayload, ClassroomRole } from '../types/classroom';
import { FaChalkboardTeacher, FaPlus, FaTimes, FaInfoCircle } from 'react-icons/fa'; // Example icons

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [classrooms, setClassrooms] = useState<UserClassroomDto[]>([]);
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState<boolean>(true);
  const [classroomError, setClassroomError] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newClassroomName, setNewClassroomName] = useState<string>('');
  const [newClassroomDesc, setNewClassroomDesc] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

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

  const handleCreateClassroom = async (e: FormEvent) => {
    e.preventDefault();
    if (!newClassroomName.trim()) {
      setCreateError("Classroom name is required."); return;
    }
    setCreateError(null);
    setIsCreating(true);
    const payload: CreateClassroomPayload = { name: newClassroomName, description: newClassroomDesc || undefined };
    try {
      await classroomService.createClassroom(payload);
      setShowCreateForm(false); setNewClassroomName(''); setNewClassroomDesc('');
      await fetchClassrooms();
      // TODO: Add a success toast
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create classroom.');
    } finally {
      setIsCreating(false);
    }
  };

  const ClassroomCard: React.FC<{ classroom: UserClassroomDto }> = ({ classroom }) => (
    <Link to={`/classrooms/${classroom.classroomId}`} className="block group">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transform group-hover:scale-105 group-hover:shadow-xl transition-all duration-300 ease-in-out h-full flex flex-col">
        {/* Photo Area */}
        <div className="h-40 w-full bg-[#DBE2EF] flex items-center justify-center overflow-hidden">
          {classroom.photoUrl ? (
            <img src={classroom.photoUrl} alt={`${classroom.name} cover`} className="w-full h-full object-cover" />
          ) : (
            // Placeholder with initials or generic icon
            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[#3F72AF] bg-[#DBE2EF]">
              {classroom.name.substring(0, 2).toUpperCase()}
            </div>
            // Or use an icon: <FaChalkboardTeacher size={60} className="text-[#3F72AF] opacity-50" />
          )}
        </div>
        {/* Content Area */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-[#112D4E] group-hover:text-[#3F72AF] transition-colors duration-300 truncate" title={classroom.name}>
            {classroom.name}
          </h3>
          {classroom.description && (
            <p className="text-xs text-gray-500 mt-1 flex-grow h-10 line-clamp-2" title={classroom.description}>
              {classroom.description}
            </p>
          )}
           <div className="mt-auto pt-2 flex justify-end"> {/* Pushes role to bottom */}
            <span className={`text-xs font-medium text-white bg-[#3F72AF] px-2.5 py-1 rounded-full shadow-sm`}>
              {ClassroomRole[classroom.userRole]}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#F9F7F7] text-[#112D4E]">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 p-6 bg-white shadow-md rounded-lg">
          <h1 className="text-3xl md:text-4xl font-bold text-[#112D4E] mb-3 sm:mb-0">
            Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            {user && (
              <p className="text-md text-gray-700">
                Welcome, <span className="font-semibold text-[#112D4E]">{user.username}</span>!
              </p>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#F9F7F7] transition-colors duration-300"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Classroom Section */}
        <section className="bg-transparent p-0 md:p-0"> {/* No card for this section itself */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#112D4E]">My Classrooms</h2>
            <button
              onClick={() => { setShowCreateForm(!showCreateForm); setCreateError(null); }}
              className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#F9F7F7] transition-colors duration-300
                ${showCreateForm ? 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-400' : 'bg-[#3F72AF] hover:bg-[#112D4E] focus:ring-[#3F72AF]'}`}
            >
              {showCreateForm ? <FaTimes className="mr-2" /> : <FaPlus className="mr-2" />}
              {showCreateForm ? 'Cancel Creation' : 'Create Classroom'}
            </button>
          </div>

          {/* Create Classroom Form - More prominent style */}
          {showCreateForm && (
            <div className="mb-8 p-6 bg-[#DBE2EF] shadow-lg rounded-lg border border-gray-200"> {/* Palette: Light Blue/Gray Accent */}
              <h3 className="text-xl font-semibold mb-4 text-[#112D4E]">New Classroom Details</h3>
              {createError && <p className="text-sm text-red-700 bg-red-100 p-3 rounded-md mb-3 border border-red-300">{createError}</p>}
              <form onSubmit={handleCreateClassroom} className="space-y-4">
                <div>
                  <label htmlFor="classroomName" className="block text-sm font-medium text-[#112D4E] mb-1">Name <span className="text-red-500">*</span></label>
                  <input
                    id="classroomName" type="text" value={newClassroomName} onChange={(e) => setNewClassroomName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF] sm:text-sm text-[#112D4E] bg-white"
                    placeholder="e.g., Advanced Algorithms" required
                  />
                </div>
                <div>
                  <label htmlFor="classroomDesc" className="block text-sm font-medium text-[#112D4E] mb-1">Description <span className="text-xs text-gray-500">(Optional)</span></label>
                  <textarea
                    id="classroomDesc" value={newClassroomDesc} onChange={(e) => setNewClassroomDesc(e.target.value)} rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-[#3F72AF] sm:text-sm text-[#112D4E] bg-white"
                    placeholder="A brief description of the classroom's purpose"
                  />
                </div>
                <button
                  type="submit" disabled={isCreating}
                  className={`w-full sm:w-auto flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-[#3F72AF] rounded-md hover:bg-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:ring-offset-2 focus:ring-offset-[#DBE2EF] disabled:opacity-60 transition-colors duration-300
                    ${isCreating ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {isCreating ? 'Creating...' : 'Confirm & Create'}
                </button>
              </form>
            </div>
          )}

          {/* Classroom Grid */}
          {isLoadingClassrooms && (
            <div className="flex justify-center items-center py-10">
              <svg className="animate-spin h-8 w-8 text-[#3F72AF]" /* ... spinner svg ... */></svg>
              <p className="ml-3 text-[#112D4E]">Loading your classrooms...</p>
            </div>
          )}
          {classroomError && (
            <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-md text-center">
                <FaInfoCircle className="inline mr-2" /> Error: {classroomError}
            </div>
          )}
          {!isLoadingClassrooms && !classroomError && (
            classrooms.length === 0 ? (
              <div className="text-center py-10 px-6 bg-white rounded-lg shadow">
                <FaChalkboardTeacher size={48} className="mx-auto text-[#DBE2EF]" />
                <p className="mt-4 text-lg text-[#112D4E]">You haven't joined or created any classrooms yet.</p>
                <p className="text-sm text-gray-500 mt-1">Why not create one to get started?</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {classrooms.map((classroom) => (
                  <ClassroomCard key={classroom.classroomId} classroom={classroom} />
                ))}
              </div>
            )
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;