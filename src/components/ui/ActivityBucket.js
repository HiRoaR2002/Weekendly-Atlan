import React from 'react';
import ActivityCard from './ActivityCard';
import './ActivityBucket.css';

const ActivityBucket = ({ bucket, onDrop, onDragOver, onRemove, isDragging }) => {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      className={`activity-bucket ${isDragging ? 'dragging' : ''}`}
    >
      <h3 className="bucket-title">Drop here</h3>
      {bucket.length === 0 ? (
        <p className="empty-bucket-message">Drag and drop activities here</p>
      ) : (
        <div className="bucket-grid">
          {bucket.map(activity => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onRemove={onRemove}
              isDraggable={false}
              showTime={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityBucket;
