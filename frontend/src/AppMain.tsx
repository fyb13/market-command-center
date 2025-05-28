import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import moment from 'moment';
import PortfolioModule from './components/PortfolioModule';
import MacroModule from './components/MacroModule';
import NewsModule from './components/NewsModule';
import TweetsModule from './components/TweetsModule';
import RefreshTimer from './components/RefreshTimer';

// Backend URL - change this in production
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextUpdate, setNextUpdate] = useState(null);
  const [socket, setSocket] = useState(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    // Clean up on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Set up Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    // Handle initial data
    socket.on('initialData', (initialData) => {
      setData(initialData);
      setLoading(false);
      if (initialData.nextUpdate) {
        setNextUpdate(new Date(initialData.nextUpdate));
      }
    });

    // Handle data updates
    socket.on('dataUpdate', (updateInfo) => {
      if (updateInfo.status === 'success') {
        fetchData();
      } else {
        setError(`Update failed: ${updateInfo.message || 'Unknown error'}`);
      }
    });

    // Handle connection errors
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Failed to connect to server. Retrying...');
    });

    // Handle reconnection
    socket.on('reconnect', () => {
      setError(null);
      fetchData();
    });

    return () => {
      socket.off('initialData');
      socket.off('dataUpdate');
      socket.off('connect_error');
      socket.off('reconnect');
    };
  }, [socket]);

  // Fetch data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/data`);
      setData(response.data);
      setLoading(false);
      setError(null);
      if (response.data.nextUpdate) {
        setNextUpdate(new Date(response.data.nextUpdate));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data from server');
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Manual refresh handler
  const handleRefresh = async () => {
    try {
      setLoading(true);
      await axios.post(`${BACKEND_URL}/api/update`);
      // Data will be updated via socket event
    } catch (err) {
      console.error('Error triggering update:', err);
      setError('Failed to trigger data update');
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-dark-100 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Market Command Center</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-dark-300 dark:bg-dark-200"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleRefresh}
                className={`p-2 rounded-full bg-primary text-white ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
                aria-label="Refresh data"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
          <div className="mt-2 flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {data?.timestamp ? `Last updated: ${moment(data.timestamp).format('MMMM D, YYYY h:mm A')}` : 'Loading...'}
            </p>
            <RefreshTimer nextUpdate={nextUpdate} onRefresh={fetchData} />
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-secondary bg-opacity-20 border border-secondary rounded-lg">
            <p className="text-secondary">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortfolioModule data={data?.portfolio} loading={loading} />
          <MacroModule data={data?.macro} loading={loading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <NewsModule data={data?.news} loading={loading} />
          <TweetsModule data={data?.tweets} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default App;
