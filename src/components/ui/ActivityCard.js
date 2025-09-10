import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import * as Icons from 'lucide-react';

const vibeColors = {
  happy: 'bg-yellow-400 text-yellow-900',
  relaxed: 'bg-blue-400 text-[#FFFAFA]',
  energetic: 'bg-red-400 text-[#FFFAFA]',
  peaceful: 'bg-green-400 text-green-900',
  adventurous: 'bg-orange-400 text-orange-900'
};

const ActivityCard = ({ activity, day, showTime = true, isDraggable = true, onDragStart, onDragEnd, onRemove, onTimeChange }) => {
  const IconComponent = Icons[activity.icon] || Star;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-purple-200 transition-all duration-200 p-4 ${isDraggable ? 'cursor-move hover:shadow-md' : ''} ${isHovered ? 'shake' : ''}`}
      draggable={isDraggable}
      onDragStart={(e) => isDraggable && onDragStart(e, activity)}
      onDragEnd={() => isDraggable && onDragEnd && onDragEnd()}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${activity.categoryColor || 'bg-gray-500'}`}>
            <IconComponent className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{activity.name}</h3>
            <p className="text-sm text-gray-500">{activity.duration} min</p>
          </div>
        </div>
        {onRemove && (
          <button
            onClick={() => onRemove(activity.id, day)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${vibeColors[activity.vibe] || 'bg-gray-200'}`}>
          {activity.vibe}
        </span>
        {showTime && onTimeChange && (
          <input
            type="time"
            value={activity.time || '12:00'}
            onChange={(e) => onTimeChange(activity.id, day, e.target.value)}
            className="text-sm border rounded px-2 py-1"
          />
        )}
      </div>
    </div>
  );
};

export default ActivityCard;
