import React from 'react';
import { Sun, Moon, Calendar } from 'lucide-react';
import ActivityCard from '../ui/ActivityCard';

const PlanView = ({ scheduledActivities, handleDragStart, handleDragOver, handleDrop, removeActivity, updateActivityTime }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Weekend Plan</h2>
        <p className="text-gray-600">Drag activities from the browse tab or rearrange your schedule</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Saturday */}
        <div
          className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 min-h-96"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'saturday')}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Sun className="w-6 h-6 text-yellow-500" />
              <h3 className="text-xl font-bold text-gray-900">Saturday</h3>
            </div>
            <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-600">
              {scheduledActivities.saturday.length} activities
            </span>
          </div>

          <div className="space-y-4">
            {scheduledActivities.saturday.length > 0 ? (
              scheduledActivities.saturday
                .sort((a, b) => (a.time || '12:00').localeCompare(b.time || '12:00'))
                .map(activity => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    day="saturday"
                    onDragStart={handleDragStart}
                    onRemove={removeActivity}
                    onTimeChange={updateActivityTime}
                  />
                ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Drop activities here or browse to add them</p>
              </div>
            )}
          </div>
        </div>

        {/* Sunday */}
        <div
          className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-6 min-h-96"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'sunday')}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Moon className="w-6 h-6 text-indigo-500" />
              <h3 className="text-xl font-bold text-gray-900">Sunday</h3>
            </div>
            <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-600">
              {scheduledActivities.sunday.length} activities
            </span>
          </div>

          <div className="space-y-4">
            {scheduledActivities.sunday.length > 0 ? (
              scheduledActivities.sunday
                .sort((a, b) => (a.time || '12:00').localeCompare(b.time || '12:00'))
                .map(activity => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    day="sunday"
                    onDragStart={handleDragStart}
                    onRemove={removeActivity}
                    onTimeChange={updateActivityTime}
                  />
                ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Drop activities here or browse to add them</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanView;
