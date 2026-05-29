import React from 'react';

export default function LoadingSpinner({ message = "Please wait..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="relative flex justify-center items-center">
        {/* Outer Ring */}
        <div className="absolute w-20 h-20 border-4 border-blue-200 rounded-full"></div>
        {/* Inner animated ring */}
        <div className="absolute w-20 h-20 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        {/* Center dot */}
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
      </div>
      <h3 className="mt-8 text-xl font-semibold text-gray-700 animate-pulse">
        {message}
      </h3>
      <p className="mt-2 text-sm text-gray-500">Loading your data</p>
    </div>
  );
}
