import React from 'react';
import { Calendar, AlertTriangle } from 'lucide-react';
import ActivityCard from '../ui/ActivityCard';
import WeatherIcon from '../ui/WeatherIcon';
import { weekendOptions } from '../../constants';

const PlanView = ({
  scheduledActivities,
  weather,
  handleDragStart,
  handleDragOver,
  handleDrop,
  removeActivity,
  updateActivityTime,
  weekendOption,
  handleWeekendOptionChange
}) => {
  const isRainy = (day) => {
    if (!weather || !weather[day]) return false;
    const weatherCode = weather[day];
    return weatherCode >= 51;
  };

  const days = Object.keys(scheduledActivities);
  const dayColors = ['from-blue-50 to-purple-50', 'from-orange-50 to-pink-50', 'from-green-50 to-teal-50', 'from-yellow-50 to-amber-50'];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Weekend Plan</h2>
        <p className="text-gray-600">Select your weekend duration and start planning!</p>
        <div className="mt-4">
          <select
            value={weekendOption}
            onChange={(e) => handleWeekendOptionChange(e.target.value)}
            className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {Object.entries(weekendOptions).map(([key, option]) => (
              <option key={key} value={key}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-${days.length > 2 ? '2' : days.length} xl:grid-cols-${days.length} gap-8`}>
        {days.map((day, index) => (
          <div
            key={day}
            className={`bg-gradient-to-br ${dayColors[index % dayColors.length]} rounded-2xl p-6 min-h-96`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, day)}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <WeatherIcon day={day} weather={weather} />
                <h3 className="text-xl font-bold text-gray-900 capitalize">{day}</h3>
              </div>
              {isRainy(day) && (
                <div className="relative group">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <div className="absolute bottom-full mb-2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Outdoor activities not recommended
                  </div>
                </div>
              )}
              <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-600">
                {scheduledActivities[day].length} activities
              </span>
            </div>

            <div className="space-y-4">
              {scheduledActivities[day].length > 0 ? (
                scheduledActivities[day]
                  .sort((a, b) => (a.time || '12:00').localeCompare(b.time || '12:00'))
                  .map(activity => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      day={day}
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
        ))}
      </div>
    </div>
  );
};

export default PlanView;
