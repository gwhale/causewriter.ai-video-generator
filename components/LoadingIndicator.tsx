import React from 'react';

interface LoadingIndicatorProps {
  message: string;
  elapsedTime: number;
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message, elapsedTime }) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-200/80 text-center">
      <div className="mb-6">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-t-2 border-[#0424aa] mx-auto"></div>
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Creating Your Video...</h2>
      <p className="text-gray-600">
        {message}
      </p>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 my-6 max-w-xs mx-auto">
          <p className="text-2xl font-mono font-semibold text-[#0424aa] tracking-wider">{formatTime(elapsedTime)}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Elapsed Time</p>
      </div>
      
      <p className="text-sm text-gray-500">
        <strong>Heads up:</strong> Average video creation time is 2-5 minutes.
      </p>
    </div>
  );
};