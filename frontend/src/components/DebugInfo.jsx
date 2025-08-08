import React from 'react';
import { useSelector } from 'react-redux';

const DebugInfo = () => {
  const { user, loading } = useSelector(store => store.auth);
  
  // Only show in development
  if (import.meta.env.PROD) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🐛 Debug Info</h3>
      <div className="space-y-1">
        <div>
          <strong>Google Client ID:</strong> 
          <span className={import.meta.env.VITE_GOOGLE_CLIENT_ID ? 'text-green-400' : 'text-red-400'}>
            {import.meta.env.VITE_GOOGLE_CLIENT_ID ? '✓ Loaded' : '✗ Missing'}
          </span>
        </div>
        <div>
          <strong>API Base URL:</strong> 
          <span className="text-blue-400">{import.meta.env.VITE_API_BASE_URL || 'Default'}</span>
        </div>
        <div>
          <strong>User Authenticated:</strong> 
          <span className={user ? 'text-green-400' : 'text-red-400'}>
            {user ? '✓ Yes' : '✗ No'}
          </span>
        </div>
        <div>
          <strong>Loading State:</strong> 
          <span className={loading ? 'text-yellow-400' : 'text-gray-400'}>
            {loading ? '⏳ Loading' : '✓ Ready'}
          </span>
        </div>
        {user && (
          <div>
            <strong>User ID:</strong> 
            <span className="text-green-400">{user._id?.slice(-6)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugInfo;
