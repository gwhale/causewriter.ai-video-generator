import React from 'react';
import { FilmIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-10 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-[#0424aa] p-2 rounded-lg">
              <FilmIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">
              CauseWriter.AI Video Studio
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};