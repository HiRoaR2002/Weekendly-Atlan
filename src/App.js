import React from 'react';
import Header from './components/layout/Header';
import BrowseView from './components/views/BrowseView';
import PlanView from './components/views/PlanView';
import ShareView from './components/views/ShareView';
import FloatingActionButton from './components/ui/FloatingActionButton';
import useWeekendPlanner from './hooks/useWeekendPlanner';
import { Toaster } from 'react-hot-toast';
import './App.css'

const App = () => {
  const {
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
    updateActivityBucketTime,
    generateSummary,
    themes,
    activityCategories,
    addActivityToBucket,
    activityBucket,
    handleDropOnBucket,
    removeActivityFromBucket,
    pushBucketToPlan,
    isDragging,
    handleDragEnd,
    weather,
    weekendOption,
    handleWeekendOptionChange,
    isBucketOpen,
    setIsBucketOpen
  } = useWeekendPlanner();

  return (
    <div className="min-h-screen from-purple-50 via-white to-pink-50 ">
      <Toaster position="top-center" reverseOrder={false} />
      <Header currentView={currentView} setCurrentView={setCurrentView} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'browse' && (
          <BrowseView
            themes={themes}
            selectedTheme={selectedTheme}
            applyTheme={applyTheme}
            activityCategories={activityCategories}
            addActivityToBucket={addActivityToBucket}
            activityBucket={activityBucket}
            handleDropOnBucket={handleDropOnBucket}
            handleDragOver={handleDragOver}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
            isDragging={isDragging}
            removeActivityFromBucket={removeActivityFromBucket}
            pushBucketToPlan={pushBucketToPlan}
            updateActivityBucketTime={updateActivityBucketTime}
            isBucketOpen={isBucketOpen}
            setIsBucketOpen={setIsBucketOpen}
          />
        )}
        {currentView === 'plan' && (
          <PlanView
            scheduledActivities={scheduledActivities}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            removeActivity={removeActivity}
            updateActivityTime={updateActivityTime}
            handleDragStart={handleDragStart}
            weather={weather}
            weekendOption={weekendOption}
            handleWeekendOptionChange={handleWeekendOptionChange}
          />
        )}
        {currentView === 'share' && (
          <ShareView
            themes={themes}
            selectedTheme={selectedTheme}
            scheduledActivities={scheduledActivities}
            generateSummary={generateSummary}
          />
        )}
      </main>

      <FloatingActionButton
        currentView={currentView}
        onClick={() => setCurrentView(currentView === 'browse' ? 'plan' : 'browse')}
      />
    </div>
  );
};

export default App;
