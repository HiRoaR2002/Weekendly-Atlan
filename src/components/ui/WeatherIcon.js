import React from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';

const WeatherIcon = ({ day, weather }) => {

  const getWeatherIcon = (code) => {
    if (code >= 0 && code <= 1) return <Sun className="w-6 h-6 text-yellow-500" />;
    if (code >= 2 && code <= 3) return <Cloud className="w-6 h-6 text-gray-500" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-6 h-6 text-blue-500" />;
    if (code >= 71 && code <= 77) return <CloudSnow className="w-6 h-6 text-blue-200" />;
    if (code >= 95 && code <= 99) return <CloudLightning className="w-6 h-6 text-yellow-400" />;
    return <Sun className="w-6 h-6 text-yellow-500" />; // Default icon
  };

  if (!weather || !weather[day]) {
    return <Sun className="w-6 h-6 text-yellow-500" />;
  }

  return getWeatherIcon(weather[day]);
};

export default WeatherIcon;
