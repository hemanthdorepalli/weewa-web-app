import React from 'react';
import { Moon, Cloud, Sun } from 'lucide-react';
import './LocalForecast.css';

const LocalForecast = () => {
  const forecasts = [
    { time: 'Night', icon: <Moon size={window.innerWidth <= 768 ? 24 : 40} />, temp: '46', precip: '5', condition: 'Mostly Clear' },
    { time: 'Morning', icon: <Cloud size={window.innerWidth <= 768 ? 24 : 40} />, temp: '53', precip: '2', condition: 'Scattered Clouds' },
    { time: 'Afternoon', icon: <Sun size={window.innerWidth <= 768 ? 24 : 40} />, temp: '53', precip: '0', condition: 'Sunny' },
    { time: 'Evening', icon: <Cloud size={window.innerWidth <= 768 ? 24 : 40} />, temp: '42', precip: '0', condition: 'Cloudy' }
  ];

  return (
    <div className="extra-card-remain">
      <div className="forecast-container">
        <div className="forecast-header">
          <h2 className="forecast-title">Local Forecast</h2>
          <div className="forecast-subtitle">Gateway</div>
        </div>

        <div className="forecast-content">
          {forecasts.map((forecast, index) => (
            <div key={index} className="forecast-item">
              <div className="forecast-time" style={{ color: '#666' }}>
                {forecast.time}
              </div>
              <div className="forecast-icon">
                {forecast.icon}
              </div>
              <div className="forecast-data">
                <span className="forecast-temp">{forecast.temp}°C</span>
                <span className="forecast-separator">|</span>
                <span className="forecast-precip">{forecast.precip}%</span>
              </div>
              <div className="forecast-condition">
                {forecast.condition}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocalForecast;
