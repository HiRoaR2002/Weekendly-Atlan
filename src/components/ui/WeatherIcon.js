import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';

const WeatherIcon = ({ day }) => {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async (latitude, longitude) => {
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode&timezone=auto`);
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        const dayIndex = day === 'saturday' ? 0 : 1;
        const weatherCode = data.daily.weathercode[dayIndex];
        setWeather(getWeatherIcon(weatherCode));
      } catch (error) {
        console.error("Error fetching weather:", error);
        setError('Could not fetch weather');
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
            setError('Location access denied');
            // Fallback to a default location if user denies access
            fetchWeather(51.5074, -0.1278); // London
          }
        );
      } else {
        setError("Geolocation is not supported by this browser.");
        // Fallback to a default location if geolocation is not supported
        fetchWeather(51.5074, -0.1278); // London
      }
    };

    getLocation();
  }, [day]);

  const getWeatherIcon = (code) => {
    if (code >= 0 && code <= 1) return <Sun className="w-6 h-6 text-yellow-500" />;
    if (code >= 2 && code <= 3) return <Cloud className="w-6 h-6 text-gray-500" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-6 h-6 text-blue-500" />;
    if (code >= 71 && code <= 77) return <CloudSnow className="w-6 h-6 text-blue-200" />;
    if (code >= 95 && code <= 99) return <CloudLightning className="w-6 h-6 text-yellow-400" />;
    return <Sun className="w-6 h-6 text-yellow-500" />; // Default icon
  };

  if (error) {
    return <span title={error}>☀️</span>;
  }

  return weather;
};

export default WeatherIcon;
