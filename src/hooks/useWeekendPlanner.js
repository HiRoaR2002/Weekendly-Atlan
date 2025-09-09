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
    const otherDay = day === 'saturday' ? 'sunday' : 'saturday';

    const isAlreadyOnDay = scheduledActivities[day].some(a => a.id === activity.id);
    const isAlreadyOnOtherDay = scheduledActivities[otherDay].some(a => a.id === activity.id);

    if (isAlreadyOnDay) {
      if (isAlreadyOnOtherDay) {
        toast.error(`${activity.name} is already planned for the entire weekend.`);
        return;
      } else {
        const conflictOnOtherDay = isConflict(otherDay, activity);
        if (conflictOnOtherDay) {
          toast.error(
            `${activity.name} is on ${day} and has a time conflict on ${otherDay} with ${conflictOnOtherDay.name}.`
          );
          return;
        } else {
          setScheduledActivities(prev => ({
            ...prev,
            [otherDay]: [...prev[otherDay], activity]
          }));
          toast.success(`${activity.name} was added to ${otherDay}.`);
          return;
        }
      }
    } else {
      const conflictOnDay = isConflict(day, activity);
      if (conflictOnDay) {
        toast.error(
          `Time conflict on ${day} with ${conflictOnDay.name}.`
        );
        return;
      } else {
        setScheduledActivities(prev => ({
          ...prev,
          [day]: [...prev[day], activity]
        }));
      }
    }
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
    let newScheduledActivities = { ...scheduledActivities };
    let bucket = [...activityBucket];
    let changesMade = false;

    bucket.forEach(activity => {
      const isAlreadyOnSaturday = newScheduledActivities.saturday.some(a => a.id === activity.id);
      const isAlreadyOnSunday = newScheduledActivities.sunday.some(a => a.id === activity.id);

      if (isAlreadyOnSaturday && isAlreadyOnSunday) {
        toast.error(`${activity.name} is already planned for the entire weekend.`);
        return;
      }

      const tryAddingToDay = (day) => {
        if (newScheduledActivities[day].some(a => a.id === activity.id)) {
          return false; // Already on this day
        }
        const conflict = isConflict(day, activity);
        if (conflict) {
          toast.error(`Time conflict for ${activity.name} on ${day} with ${conflict.name}.`);
          return false;
        }
        newScheduledActivities = {
          ...newScheduledActivities,
          [day]: [...newScheduledActivities[day], activity]
        };
        changesMade = true;
        return true;
      };

      if (!isAlreadyOnSaturday) {
        if (tryAddingToDay('saturday')) return;
      }
      if (!isAlreadyOnSunday) {
        if (tryAddingToDay('sunday')) return;
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
