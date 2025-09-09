import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { Sun, Moon, Clock, Share2, Download } from 'lucide-react';
import * as Icons from 'lucide-react';

const ShareView = ({ themes, selectedTheme, scheduledActivities, generateSummary }) => {
  const ThemeIcon = Icons[themes[selectedTheme].icon];
  const cardRef = useRef();

  const handleDownload = () => {
    if (cardRef.current) {
      toPng(cardRef.current)
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'weekend-plan.png';
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error('oops, something went wrong!', err);
        });
    }
  };

  const handleShare = () => {
    if (cardRef.current) {
      toPng(cardRef.current)
        .then(async (dataUrl) => {
          const blob = await fetch(dataUrl).then(res => res.blob());
          const file = new File([blob], 'weekend-plan.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: 'My Weekend Plan',
                text: generateSummary(),
              });
            } catch (err) {
              console.error('Share failed:', err);
            }
          } else {
            alert('Sharing not supported on this browser.');
          }
        })
        .catch((err) => {
          console.error('oops, something went wrong!', err);
        });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Your Plan</h2>
        <p className="text-gray-600">Show off your amazing weekend to friends</p>
      </div>

      {/* Shareable Card */}
      <div ref={cardRef} className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-8 text-white">
        <div className="text-center mb-6">
          <ThemeIcon className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">My {themes[selectedTheme].name}</h3>
          <p className="opacity-90">{generateSummary()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center space-x-2">
              <Sun className="w-5 h-5" />
              <span>Saturday</span>
            </h4>
            {scheduledActivities.saturday.map(activity => (
              <div key={activity.id} className="flex items-center space-x-2 text-sm opacity-90">
                <Clock className="w-4 h-4" />
                <span>{activity.time}</span>
                <span>{activity.name}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold flex items-center space-x-2">
              <Moon className="w-5 h-5" />
              <span>Sunday</span>
            </h4>
            {scheduledActivities.sunday.map(activity => (
              <div key={activity.id} className="flex items-center space-x-2 text-sm opacity-90">
                <Clock className="w-4 h-4" />
                <span>{activity.time}</span>
                <span>{activity.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex justify-center space-x-4">
        <button onClick={handleShare} className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors">
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </button>
        <button onClick={handleDownload} className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors">
          <Download className="w-5 h-5" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};

export default ShareView;
