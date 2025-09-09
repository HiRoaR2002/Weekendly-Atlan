import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { themes, activityCategories } from '../constants';

const useWeekendPlanner = () => {
  const [selectedTheme, setSelectedTheme] = useState('balanced');
  const [weather, setWeather] = useState(null);
  const [scheduledActivities, setScheduledActivities] = useState(() => {
    const saved = localStorage.getItem('weekendly-schedule');
    return saved ? JSON.parse(saved) : { saturday: [], sunday: [] };
  });
  const [draggedActivity, setDraggedActivity] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentView, setCurrentView] = useState('plan');
  const [activityBucket, setActivityBucket] = useState(() => {
    const saved = localStorage.getItem('weekendly-bucket');
    return saved ? JSON.parse(saved) : [];
  });

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

    const saturday = themeActivities.slice(0, Math.ceil(themeActivities.length / 2));
    const sunday = themeActivities.slice(Math.ceil(themeActivities.length / 2));

    setScheduledActivities({ saturday, sunday });
  };

  const handleDragStart = (e, activity) => {
    setDraggedActivity(activity);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
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

  const handleDropOnBucket = (e) => {
    e.preventDefault();
    if (draggedActivity) {
      addActivityToBucket(draggedActivity);
      setDraggedActivity(null);
    }
  };

  const addActivity = (activity, day = 'saturday') => {
    const conflict = isConflict(day, activity);
    if (conflict) {
      toast.error(
        `Time conflict with ${conflict.name} (${conflict.time} - ${new Date(new Date(`1970-01-01T${conflict.time}`).getTime() + conflict.duration * 60000).toTimeString().slice(0, 5)})`
      );
      return;
    }
    setScheduledActivities(prev => ({
      ...prev,
      [day]: [...prev[day].filter(a => a.id !== activity.id), activity]
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

  const pushBucketToPlan = () => {
    const newScheduledActivities = {
      saturday: [...scheduledActivities.saturday],
      sunday: [...scheduledActivities.sunday]
    };
    const unaddedActivities = [];

    activityBucket.forEach((activity, index) => {
      const primaryDay = index % 2 === 0 ? 'saturday' : 'sunday';
      const secondaryDay = primaryDay === 'saturday' ? 'sunday' : 'saturday';

      let conflict = isConflict(primaryDay, activity);
      if (conflict) {
        conflict = isConflict(secondaryDay, activity);
        if (conflict) {
          unaddedActivities.push({ activity, conflict });
        } else {
          newScheduledActivities[secondaryDay].push(activity);
        }
      } else {
        newScheduledActivities[primaryDay].push(activity);
      }
    });

    if (unaddedActivities.length > 0) {
      unaddedActivities.forEach(({ activity, conflict }) => {
        toast.error(
          `${activity.name} conflicts with ${conflict.name} (${conflict.time} - ${new Date(new Date(`1970-01-01T${conflict.time}`).getTime() + conflict.duration * 60000).toTimeString().slice(0, 5)})`
        );
      });
    }

    setScheduledActivities(newScheduledActivities);
    setActivityBucket([]);
    if (unaddedActivities.length < activityBucket.length) {
      toast.success('Activities pushed to plan!');
    }
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
    removeActivity,
    updateActivityTime,
    generateSummary,
    themes,
    activityCategories
  };
};

export default useWeekendPlanner;
