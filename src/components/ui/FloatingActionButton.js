import React from 'react';
import { Calendar, Plus } from 'lucide-react';

const FloatingActionButton = ({ currentView, onClick }) => {
  return (
    <div className="fixed bottom-6 right-6 md:hidden">
      <button
        onClick={onClick}
        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        {currentView === 'browse' ? <Calendar className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default FloatingActionButton;
