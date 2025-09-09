import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { themes, activityCategories } from '../constants';

const useWeekendPlanner = () => {
  const [selectedTheme, setSelectedTheme] = useState('balanced');
  const [scheduledActivities, setScheduledActivities] = useState(() => {
    const saved = localStorage.getItem('weekendly-schedule');
    return saved ? JSON.parse(saved) : { saturday: [], sunday: [] };
  });
  const [draggedActivity, setDraggedActivity] = useState(null);
  const [currentView, setCurrentView] = useState('plan');

  useEffect(() => {
    localStorage.setItem('weekendly-schedule', JSON.stringify(scheduledActivities));
  }, [scheduledActivities]);

  const getAllActivities = () => {
    return Object.values(activityCategories).flatMap(category =>
      category.activities.map(activity => ({ ...activity, category: category.name, categoryColor: category.color }))
    );
  };

  const isConflict = (day, activity, newTime) => {
    const newStartTime = newTime || activity.time;
    const newEndTime = new Date(new Date(`1970-01-01T${newStartTime}`).getTime() + activity.duration * 60000).toTimeString().slice(0, 5);

    return scheduledActivities[day].some(a => {
      if (a.id === activity.id) return false;
      const existingStartTime = a.time;
      const existingEndTime = new Date(new Date(`1970-01-01T${existingStartTime}`).getTime() + a.duration * 60000).toTimeString().slice(0, 5);
      return (newStartTime < existingEndTime && newEndTime > existingStartTime);
    });
  };

  const applyTheme = (themeKey) => {
    setSelectedTheme(themeKey);
    const theme = themes[themeKey];
    const allActivities = getAllActivities();

    const themeActivities = theme.activities.map(activityId =>
      allActivities.find(a => a.id === activityId)
    ).filter(Boolean);

    const saturday = themeActivities.slice(0, Math.ceil(themeActivities.length / 2));
    const sunday = themeActivities.slice(Math.ceil(themeActivities.length / 2));

    setScheduledActivities({ saturday, sunday });
  };

  const handleDragStart = (e, activity) => {
    setDraggedActivity(activity);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, day) => {
    e.preventDefault();
    if (draggedActivity) {
      addActivity(draggedActivity, day);
      setDraggedActivity(null);
    }
  };

  const addActivity = (activity, day = 'saturday') => {
    if (isConflict(day, activity)) {
      toast.error('Time conflict with another activity!');
      return;
    }
    setScheduledActivities(prev => ({
      ...prev,
      [day]: [...prev[day].filter(a => a.id !== activity.id), activity]
    }));
  };

  const removeActivity = (activityId, day) => {
    setScheduledActivities(prev => ({
      ...prev,
      [day]: prev[day].filter(a => a.id !== activityId)
    }));
  };

  const updateActivityTime = (activityId, day, newTime) => {
    const activityToUpdate = scheduledActivities[day].find(a => a.id === activityId);
    if (!activityToUpdate) return;

    if (isConflict(day, activityToUpdate, newTime)) {
      toast.error('Time conflict with another activity!');
      return;
    }

    setScheduledActivities(prev => ({
      ...prev,
      [day]: prev[day].map(a =>
        a.id === activityId ? { ...a, time: newTime } : a
      )
    }));
  };

  const generateSummary = () => {
    const totalActivities = scheduledActivities.saturday.length + scheduledActivities.sunday.length;
    if (totalActivities === 0) return "Plan your perfect weekend with Weekendly!";

    return `My ${themes[selectedTheme].name.toLowerCase()} includes ${totalActivities} amazing activities! 🎉`;
  };

  return {
    selectedTheme,
    scheduledActivities,
    currentView,
    setCurrentView,
    applyTheme,
    handleDragStart,
    handleDragOver,
    handleDrop,
    addActivity,
    removeActivity,
    updateActivityTime,
    generateSummary,
    themes,
    activityCategories
  };
};

export default useWeekendPlanner;
