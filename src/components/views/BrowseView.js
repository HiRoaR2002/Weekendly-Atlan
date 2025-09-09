import React from 'react';
import { Plus } from 'lucide-react';
import ActivityCard from '../ui/ActivityCard';
import * as Icons from 'lucide-react';

const BrowseView = ({ themes, selectedTheme, applyTheme, activityCategories, addActivity }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Vibe</h2>
        <p className="text-gray-600">Select a theme or pick individual activities</p>
      </div>

      {/* Theme Selection */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {Object.entries(themes).map(([key, theme]) => {
          const IconComponent = Icons[theme.icon];
          return (
            <button
              key={key}
              onClick={() => applyTheme(key)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${selectedTheme === key
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
                }`}
            >
              <IconComponent className="w-8 h-8 mx-auto mb-2" />
              <div className="font-semibold text-sm">{theme.name}</div>
            </button>
          );
        })}
      </div>

      {/* Activity Categories */}
      <div className="space-y-6">
        {Object.entries(activityCategories).map(([categoryKey, category]) => {
          const IconComponent = Icons[category.icon];
          return (
            <div key={categoryKey}>
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 rounded-lg ${category.color}`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.activities.map(activity => (
                  <div key={activity.id} className="relative">
                    <ActivityCard activity={{ ...activity, categoryColor: category.color }} isDraggable={false} showTime={false} />
                    <button
                      onClick={() => addActivity({ ...activity, categoryColor: category.color })}
                      className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1 hover:bg-purple-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BrowseView;
