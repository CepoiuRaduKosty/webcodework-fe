// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [dataError, setDataError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(false);


  useEffect(() => {
    const fetchProtectedData = async () => {
        setDataLoading(true);
        setDataError(null);
        setDataLoading(false);
    };

    fetchProtectedData();
    // Re-fetch won't happen automatically on token change unless triggered
    // You might want to add a dependency on the token if it's accessible and stable
  }, [logout]); // Added logout to dependency array


  return (
    <div className="container mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
            Logout
        </button>
      </div>

      {user && (
        <p className="text-lg text-gray-700 mb-4">
          Welcome back, <span className="font-semibold">{user.username}</span>!
        </p>
      )}

      <div className="mt-6 p-4 border border-gray-200 rounded bg-gray-50">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">Protected API Data:</h2>
            {dataLoading && <p className="text-blue-600">Loading data...</p>}
            {dataError && <p className="text-red-600">Error: {dataError}</p>}
            {!dataLoading && !dataError && (
                <p>Mergeee</p>
            )}
        </div>
    </div>
  );
};

export default DashboardPage;