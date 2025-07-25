
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as classroomService from '../services/classroomService';
import { ClassroomDetailsDto } from '../types/classroom';
import { ClassroomTopElement } from '../components/ClassroomTopElement';
import { ClassroomAssignmentsSection } from '../components/ClassroomAssignmentsSection';
import { ClassroomMembersSection } from '../components/ClassroomMembersSection';
import { useAuth } from '../contexts/AuthContext';

const ClassroomPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const [details, setDetails] = useState<ClassroomDetailsDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
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

  
  const handleClassroomDeleted = () => {
    navigate('/dashboard', { replace: true });
  };

  
  if (isLoading) return <div className="container mx-auto mt-10 p-6 text-center">Loading classroom...</div>;
  if (error) return <div className="container mx-auto mt-10 p-6 text-center text-red-600">Error: {error}</div>;
  if (!details) return <div className="container mx-auto mt-10 p-6 text-center">Classroom not found.</div>;

  return (
    <div className="min-h-screen bg-[#F9F7F7] text-[#112D4E]"> 
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8"> 
        <div className="mb-6 px-4 md:px-0">
          <Link to="/dashboard" className="text-sm text-[#3F72AF] hover:text-[#112D4E] hover:underline inline-flex items-center">
            &larr; Back to Dashboard
          </Link>
        </div>
        <ClassroomTopElement classroomDetails={details} onClassroomLeave={handleClassroomDeleted} onClassroomUpdate={fetchClassroomData} />
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ClassroomAssignmentsSection details={details} />
          <ClassroomMembersSection details={details} refreshClassroomData={fetchClassroomData} loggedInUserId={user?.id}/>
        </div>
      </div>
    </div>
  );
};

export default ClassroomPage;