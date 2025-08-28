
import React from 'react';
import { DownloadIcon, RefreshCwIcon } from './icons';

interface VideoPlayerProps {
  videoUrl: string;
  onReset: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onReset }) => {
  return (
    <div className="w-full bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200/80 flex flex-col items-center">
      <h2 className="text-3xl font-bold text-[#0424aa] mb-6">
        Your Masterpiece is Ready!
      </h2>
      <div className="w-full aspect-video rounded-lg overflow-hidden mb-6 shadow-inner bg-gray-900">
        <video
          src={videoUrl}
          controls
          autoPlay
          loop
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <a
          href={videoUrl}
          download="ai-generated-video.mp4"
          className="flex-1 flex items-center justify-center bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition-all duration-300"
        >
          <DownloadIcon className="w-5 h-5 mr-2" />
          Download
        </a>
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center bg-[#0424aa] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#031e8d] transition-all duration-300"
        >
          <RefreshCwIcon className="w-5 h-5 mr-2" />
          Create Another
        </button>
      </div>
    </div>
  );
};