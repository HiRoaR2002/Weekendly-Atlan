import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { themes, activityCategories as initialActivityCategories, weekendOptions } from '../constants';

const useWeekendPlanner = () => {
  const [selectedTheme, setSelectedTheme] = useState('balanced');
  const [weather, setWeather] = useState(null);
  const [weekendOption, setWeekendOption] = useState('twoDays');
  const [scheduledActivities, setScheduledActivities] = useState(() => {
    const saved = localStorage.getItem('weekendly-schedule');
    const initialSchedule = {};
    weekendOptions[weekendOption].days.forEach(day => {
      initialSchedule[day] = [];
    });
    return saved ? JSON.parse(saved) : initialSchedule;
  });
  const [draggedActivity, setDraggedActivity] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentView, setCurrentView] = useState('browse');
  const [activityBucket, setActivityBucket] = useState(() => {
    const saved = localStorage.getItem('weekendly-bucket');
    return saved ? JSON.parse(saved) : [];
  });
  const [isBucketOpen, setIsBucketOpen] = useState(false);
  const [activityCategories, setActivityCategories] = useState(initialActivityCategories);

  useEffect(() => {
    localStorage.setItem('weekendly-schedule', JSON.stringify(scheduledActivities));
  }, [scheduledActivities]);

  useEffect(() => {
    localStorage.setItem('weekendly-bucket', JSON.stringify(activityBucket));
  }, [activityBucket]);

  useEffect(() => {
    const fetchWeather = async (latitude, longitude) => {
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode&timezone=auto`);
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        setWeather({
          saturday: data.daily.weathercode[0],
          sunday: data.daily.weathercode[1],
        });
      } catch (error) {
        console.error("Error fetching weather:", error);
      }
    };

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeather(position.coords.latitude, position.coords.longitude);
          },
          (error) => {
            console.error("Error getting location:", error);
            // Fallback to a default location if user denies access
            fetchWeather(51.5074, -0.1278); // London
          }
        );
      } else {
        // Fallback to a default location if geolocation is not supported
        fetchWeather(51.5074, -0.1278); // London
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    if (!weather) return;

    const suggestAlternatives = (day) => {
      const dayWeather = weather[day];
      if (dayWeather >= 51) { // Rainy, snowy, or stormy
        const outdoorActivity = scheduledActivities[day].find(a => a.category === 'Outdoor');
        if (outdoorActivity) {
          const indoorAlternative = getAllActivities().find(a => a.category === 'Indoor' && !scheduledActivities[day].some(sa => sa.id === a.id));
          if (indoorAlternative) {
            toast((t) => (
              <span>
                Looks like rain on {day}! How about swapping <b>{outdoorActivity.name}</b> for <b>{indoorAlternative.name}</b>?
                <button
                  className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
                  onClick={() => {
                    removeActivity(outdoorActivity.id, day);
                    addActivity(indoorAlternative, day);
                    toast.dismiss(t.id);
                  }}
                >
                  Swap
                </button>
              </span>
            ), { duration: 10000 });
          }
        }
      }
    };

    suggestAlternatives('saturday');
    suggestAlternatives('sunday');
  }, [weather, scheduledActivities]);

  const getAllActivities = () => {
    return Object.values(activityCategories).flatMap(category =>
      category.activities.map(activity => ({ ...activity, category: category.name, categoryColor: category.color }))
    );
  };

  const isConflict = (day, activity, newTime) => {
    const newStartTime = newTime || activity.time;
    const newEndTime = new Date(new Date(`1970-01-01T${newStartTime}`).getTime() + activity.duration * 60000).toTimeString().slice(0, 5);

    return scheduledActivities[day].find(a => {
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

    const days = weekendOptions[weekendOption].days;
    const newSchedule = {};
    days.forEach(day => {
      newSchedule[day] = [];
    });

    themeActivities.forEach((activity, index) => {
      const dayIndex = index % days.length;
      const day = days[dayIndex];
      newSchedule[day].push(activity);
    });

    setScheduledActivities(newSchedule);
    toast.success(`${theme.name} added to plan`);
  };

  const handleDragStart = (e, activity) => {
    setDraggedActivity(activity);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    if (currentView === 'browse') {
      setIsBucketOpen(true);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (currentView === 'browse') {
      setIsBucketOpen(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, day) => {
    e.preventDefault();
    if (draggedActivity) {
      const originalDay = Object.keys(scheduledActivities).find(d =>
        scheduledActivities[d].some(a => a.id === draggedActivity.id)
      );

      if (originalDay && originalDay !== day) {
        const conflict = isConflict(day, draggedActivity);
        if (conflict) {
          toast.error(`Time conflict on ${day} with ${conflict.name}.`);
          setDraggedActivity(null);
          return;
        }
        removeActivity(draggedActivity.id, originalDay);
      }

      addActivity(draggedActivity, day);
      setDraggedActivity(null);
    }
  };

  const handleDropOnBucket = (e) => {
    e.preventDefault();
    if (draggedActivity) {
      addActivityToBucket(draggedActivity);
      setDraggedActivity(null);
    }
  };

  const addActivity = (activity, day) => {
    if (!day) {
      // Find the first day with no conflict
      const availableDay = weekendOptions[weekendOption].days.find(d => !isConflict(d, activity));
      if (availableDay) {
        day = availableDay;
      } else {
        toast.error(`No available slot for ${activity.name}.`);
        return;
      }
    }

    const isAlreadyOnDay = scheduledActivities[day] && scheduledActivities[day].some(a => a.id === activity.id);

    if (isAlreadyOnDay) {
      // If it's already on the target day, do nothing.
      return;
    }

    const conflict = isConflict(day, activity);
    if (conflict) {
      toast.error(`Time conflict on ${day} with ${conflict.name}.`);
      return;
    }

    setScheduledActivities(prev => ({
      ...prev,
      [day]: [...prev[day], activity]
    }));
  };

  const addActivityToBucket = (activity) => {
    if (activityBucket.some(a => a.id === activity.id)) {
      toast.error('Activity already in the bucket!');
      return;
    }
    setActivityBucket(prev => [...prev, activity]);
    toast.success('Activity added to bucket!');
  };

  const removeActivity = (activityId, day) => {
    setScheduledActivities(prev => ({
      ...prev,
      [day]: prev[day].filter(a => a.id !== activityId)
    }));
  };

  const removeActivityFromBucket = (activityId) => {
    setActivityBucket(prev => prev.filter(a => a.id !== activityId));
  };

  const resetDay = (day) => {
    setScheduledActivities(prev => ({
      ...prev,
      [day]: []
    }));
    toast.success(`All activities for ${day} have been cleared.`);
  };

  const pushBucketToPlan = () => {
    let newScheduledActivities = { ...scheduledActivities };
    let bucket = [...activityBucket];
    let changesMade = false;

    // 1. Sort activities by start time
    bucket.sort((a, b) => a.time.localeCompare(b.time));

    const days = weekendOptions[weekendOption].days;
    let dayIndex = 0;

    bucket.forEach(activity => {
      const isAlreadyScheduled = Object.values(newScheduledActivities).flat().some(a => a.id === activity.id);

      if (isAlreadyScheduled) {
        toast.error(`${activity.name} is already planned for the weekend.`);
        return; // continue to next activity in forEach
      }

      let assigned = false;
      // Start from the current dayIndex and try all days
      for (let i = 0; i < days.length; i++) {
        const currentDay = days[(dayIndex + i) % days.length];

        if (!isConflict(currentDay, activity)) {
          newScheduledActivities = {
            ...newScheduledActivities,
            [currentDay]: [...newScheduledActivities[currentDay], activity]
          };
          changesMade = true;
          assigned = true;
          // For the next activity, we want to start with the next day
          dayIndex = (dayIndex + i + 1) % days.length;
          break; // Activity assigned, move to the next one
        }
      }

      if (!assigned) {
        toast.error(`No available slot for ${activity.name}.`);
      }
    });

    if (changesMade) {
      setScheduledActivities(newScheduledActivities);
      toast.success('Activities from the bucket have been added to your plan!');
    }
    setActivityBucket([]);
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

  const updateActivityBucketTime = (activityId, newTime) => {
    setActivityBucket(prev =>
      prev.map(a =>
        a.id === activityId ? { ...a, time: newTime } : a
      )
    );
  };

  const updateActivityTimeInBrowse = (activityId, categoryKey, newTime) => {
    setActivityCategories(prev => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        activities: prev[categoryKey].activities.map(a =>
          a.id === activityId ? { ...a, time: newTime } : a
        )
      }
    }));
  };

  const generateSummary = () => {
    const totalActivities = Object.values(scheduledActivities).flat().length;
    if (totalActivities === 0) return "Plan your perfect weekend with Weekendly!";

    return `My ${themes[selectedTheme].name.toLowerCase()} includes ${totalActivities} amazing activities! 🎉`;
  };

  const handleWeekendOptionChange = (option) => {
    setWeekendOption(option);
    const newSchedule = {};
    const newDays = weekendOptions[option].days;
    newDays.forEach(day => {
      newSchedule[day] = scheduledActivities[day] || [];
    });

    const oldDays = Object.keys(scheduledActivities);
    const removedDays = oldDays.filter(day => !newDays.includes(day));
    const activitiesToReassign = removedDays.flatMap(day => scheduledActivities[day]);

    activitiesToReassign.forEach(activity => {
      let assigned = false;
      for (const day of newDays) {
        const newStartTime = activity.time;
        const newEndTime = new Date(new Date(`1970-01-01T${newStartTime}`).getTime() + activity.duration * 60000).toTimeString().slice(0, 5);

        const conflict = newSchedule[day].find(a => {
          if (a.id === activity.id) return false;
          const existingStartTime = a.time;
          const existingEndTime = new Date(new Date(`1970-01-01T${existingStartTime}`).getTime() + a.duration * 60000).toTimeString().slice(0, 5);
          return (newStartTime < existingEndTime && newEndTime > existingStartTime);
        });

        if (!conflict) {
          newSchedule[day].push(activity);
          assigned = true;
          break;
        }
      }

      if (!assigned) {
        addActivityToBucket(activity);
      }
    });

    setScheduledActivities(newSchedule);
  };

  return {
    selectedTheme,
    scheduledActivities,
    weekendOption,
    handleWeekendOptionChange,
    weather,
    currentView,
    setCurrentView,
    applyTheme,
    handleDragStart,
    handleDragEnd,
    isDragging,
    handleDragOver,
    handleDrop,
    addActivity,
    addActivityToBucket,
    activityBucket,
    handleDropOnBucket,
    removeActivityFromBucket,
    pushBucketToPlan,
    resetDay,
    removeActivity,
    updateActivityTime,
    updateActivityBucketTime,
    updateActivityTimeInBrowse,
    generateSummary,
    themes,
    activityCategories,
    weekendOptions,
    isBucketOpen,
    setIsBucketOpen
  };
};

export default useWeekendPlanner;
