import React, { useEffect, useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import './Landing.css';
import axiosInstance from '../utils/axios-config';
import { useNavigate } from 'react-router-dom';

const InfoIcon = ({ text }) => (
  <div className="info-icon">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
    <span className="tooltip">{text}</span>
  </div>
);


const WindArrow = ({ direction }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    style={{ 
      transform: `rotate(${direction}deg)`,
      transition: 'transform 0.3s ease'
    }}
  >
    <path 
      d="M12 2L8 11H11V22H13V11H16L12 2Z" 
      fill="currentColor"
    />
  </svg>
);

const DashboardButton = () => (
  <div className="landing-dashboard-button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
    <span>Dashboard</span>
    <svg 
      className="landing-arrow" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  </div>
);

// Add useInterval custom hook at the top of the file
const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => {
        savedCallback.current();
      }, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

const Landing = () => {
  const navigate = useNavigate();
  // State variables for weather data
  const [weatherData, setWeatherData] = useState(null);
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [currentTemp, setCurrentTemp] = useState(0);
  const [uvIndex, setUvIndex] = useState(6); // UV index not available in basic API
  const [windSpeed, setWindSpeed] = useState(0);
  const [windDirection, setWindDirection] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [visibility, setVisibility] = useState(0);
  const [sunrise, setSunrise] = useState("");
  const [sunset, setSunset] = useState("");
  const [weatherIcon, setWeatherIcon] = useState("");
  const [weatherDesc, setWeatherDesc] = useState("");
  const [tempMin, setTempMin] = useState(0);
  const [tempMax, setTempMax] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add state for hourly data
  const [hourlyData, setHourlyData] = useState([]);

  // Add state for needle animation
  const [needleAngle, setNeedleAngle] = useState(90); // Start at 90 degrees (pointing down)

  // Add new state for forecast data
  const [forecastData, setForecastData] = useState([]);

  // Add API polling with useInterval
  useInterval(() => {
    if (location.lat && location.lon) {
      fetchWeatherData();
    }
  }, 10000); // 10000 ms = 10 seconds

  // Updated geolocation code
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          });
          setLoading(false);
        },
        (err) => {
          console.error("Error getting location:", err);
          setError("Unable to get your location. Please enable location services and try again.");
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }

    // Cleanup function to clear any pending intervals
    return () => {
      // Any cleanup needed
    };
  }, []);


  // Function to format time
  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true
    });
  };

  // Function to animate needle
  const animateNeedle = (targetTemp) => {
    const startAngle = needleAngle;
    const targetAngle = 90 + (targetTemp / 50) * 180;
    const duration = 1000; // 1 second
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentAngle = startAngle + (targetAngle - startAngle) * easeProgress;
      setNeedleAngle(currentAngle);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  // Function to check if we should store new temperature for current hour
  const shouldStoreNewTemp = (currentHour, storedData) => {
    const lastEntry = storedData[storedData.length - 1];
    if (!lastEntry) return true;
    
    const lastEntryHour = new Date(lastEntry.timestamp * 1000).getHours();
    return lastEntryHour !== currentHour;
  };

  // Modified function to store hourly data
  const storeHourlyData = (temp, timestamp) => {
    const storedData = JSON.parse(localStorage.getItem('hourlyWeather') || '[]');
    const currentHour = new Date(timestamp * 1000).getHours();
    
    // Check if we should store new temperature for this hour
    if (!shouldStoreNewTemp(currentHour, storedData)) {
      return; // Skip if we already have data for this hour
    }

    const tempCelsius = Math.round(temp - 273.15);
    const newData = {
      time: formatTime(timestamp),
      temp: tempCelsius,
      timestamp,
      hour: currentHour
    };

    // Keep only data from today
    const today = new Date().setHours(0, 0, 0, 0);
    const filteredData = storedData.filter(item => {
      const itemDate = new Date(item.timestamp * 1000);
      return itemDate.setHours(0, 0, 0, 0) === today;
    });

    const updatedData = [...filteredData, newData]
      .sort((a, b) => a.timestamp - b.timestamp);

    localStorage.setItem('hourlyWeather', JSON.stringify(updatedData));
    setHourlyData(updatedData);
  };

  // Function to fetch fresh weather data
  const fetchWeatherData = async () => {
    if (location.lat && location.lon) {
      try {
        // Fetch current weather
        const currentResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=c9fff9db3ed46c3c6b5d69bbfe023b86`
        );
        const currentData = await currentResponse.json();
        
        // Fetch forecast data
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=c9fff9db3ed46c3c6b5d69bbfe023b86`
        );
        const forecastData = await forecastResponse.json();
        
        // Process forecast data for next 5 time slots
        const processedForecast = forecastData.list.slice(0, 5).map(item => ({
          time: new Date(item.dt * 1000).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          temp: Math.round(item.main.temp - 273.15),
          icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
          windSpeed: Math.round(item.wind.speed * 3.6),
          windDeg: item.wind.deg
        }));
        
        setForecastData(processedForecast);
        
        // Update all states with new data
        setWeatherData(currentData);
        const tempCelsius = Math.round(currentData.main.temp - 273.15);
        setCurrentTemp(tempCelsius);
        animateNeedle(tempCelsius);
        storeHourlyData(currentData.main.temp, currentData.dt);
        
        setWindSpeed(currentData.wind.speed * 3.6);
        setWindDirection(currentData.wind.deg);
        setHumidity(currentData.main.humidity);
        setVisibility(currentData.visibility / 1000);
        
        // Update sunrise/sunset times
        const sunriseTime = new Date(currentData.sys.sunrise * 1000);
        const sunsetTime = new Date(currentData.sys.sunset * 1000);
        setSunrise(sunriseTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }));
        setSunset(sunsetTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }));

        setWeatherIcon(`https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`);
        setWeatherDesc(currentData.weather[0].description);
        setTempMin(Math.round(currentData.main.temp_min - 273.15));
        setTempMax(Math.round(currentData.main.temp_max - 273.15));
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setError("Failed to fetch weather data. Please try again later.");
      }
    }
  };

  // Effect for initial load and automatic refresh
  useEffect(() => {
    if (location.lat && location.lon) {
      // Load stored data on mount
      const storedData = JSON.parse(localStorage.getItem('hourlyWeather') || '[]');
      if (storedData.length > 0) {
        setHourlyData(storedData);
      }

      // Initial fetch
      fetchWeatherData();

      // Set up intervals for data refresh and hourly storage
      const refreshInterval = setInterval(fetchWeatherData, 300000); // Refresh every 5 minutes
      
      // Check every minute if we need to store hourly data
      const hourlyCheckInterval = setInterval(() => {
        const now = new Date();
        if (now.getMinutes() === 0) { // If it's the start of a new hour
          fetchWeatherData(); // Fetch and store new data
        }
      }, 60000); // Check every minute

      return () => {
        clearInterval(refreshInterval);
        clearInterval(hourlyCheckInterval);
      };
    }
  }, [location]);

  useEffect(() => {
    const updateWindDirection = () => {
      const arrow = document.querySelector('.compass-arrow');
      if (arrow) {
        arrow.style.transform = 'rotate(0deg)';
      }
    };

    updateWindDirection();
  }, []);

  // Helper functions for status texts and colors
  const getHumidityStatus = (value) => {
    if (value <= 30) return "Low";
    if (value <= 60) return "Normal";
    return "High";
  };

  const getVisibilityStatus = (value) => {
    if (value <= 3) return "Poor";
    if (value <= 6) return "Average";
    return "Good";
  };

  // Update the getWindDirection helper function
  const getWindDirection = (degrees) => {
    // Ensure degrees is between 0 and 360
    const normalizedDegrees = ((degrees % 360) + 360) % 360;
    const directions = ['NORTH', 'NORTH-EAST', 'EAST', 'SOUTH-EAST', 'SOUTH', 'SOUTH-WEST', 'WEST', 'NORTH-WEST'];
    const index = Math.round(normalizedDegrees / 45) % 8;
    return directions[index];
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  // Add loading and error handling in the return
  if (loading) {
    return (
      <div className="landing-weather-dashboard">
        <div className="landing-loading">Loading weather data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="landing-weather-dashboard">
        <div className="landing-error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className='landing-container'>
      <div className="landing-weather-dashboardd">
        {/* Left Section */}
        <div className="landing-left-section">
          <div className="landing-location-info">
            <div className="landing-location-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div className="landing-location-text">
              <h3>{weatherData?.name || "Loading..."}</h3>
            </div>
          </div>

          <div className="landing-temperature-display">
            <div className="landing-temp-gauge">
              <div className="landing-temp-indicator">
                <svg viewBox="0 0 200 100">
                  {/* Background arc */}
                  <defs>
                    <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%">
                      <stop offset="0%" stopColor="#4B92FF" />
                      <stop offset="50%" stopColor="#FFB800" />
                      <stop offset="100%" stopColor="#FF4D4D" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M20,80 A60,60 0 0,1 180,80"
                    fill="none"
                    stroke="#E8EDF1"
                    strokeWidth="12"
                    strokeLinecap="round"
                    opacity="0.2"
                  />
                  {/* Temperature arc */}
                  <path
                    d="M20,80 A60,60 0 0,1 180,80"
                    fill="none"
                    stroke="url(#tempGradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    style={{
                      strokeDasharray: '251.2',
                      strokeDashoffset: `${251.2 - (currentTemp / 50) * 251.2}`,
                      transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                
                  {/* Temperature needle */}
                  <g 
                    transform={`rotate(${needleAngle}, 100, 80)`}
                    style={{
                      transition: 'none' // Remove transition to use custom animation
                    }}
                  >
                    <line
                      x1="100"
                      y1="80"
                      x2="100"
                      y2="100"
                      stroke="#ffffff"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <circle cx="100" cy="80" r="5" fill="#ffffff" />
                  </g>

                  {/* Tick marks */}
                  {[0, 10, 20, 30, 40, 50].map((temp, index) => {
                    const angle = -180 + (180 * index) / 5;
                    const x1 = 100 + 70 * Math.cos((angle * Math.PI) / 180);
                    const y1 = 80 + 70 * Math.sin((angle * Math.PI) / 180);
                    const x2 = 100 + 60 * Math.cos((angle * Math.PI) / 180);
                    const y2 = 80 + 60 * Math.sin((angle * Math.PI) / 180);
                    const labelX = 100 + 50 * Math.cos((angle * Math.PI) / 180);
                    const labelY = 80 + 50 * Math.sin((angle * Math.PI) / 180);

                    return (
                      <g key={temp}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#E8EDF1"
                          strokeWidth="2"
                          opacity="0.3"
                        />
                        <text
                          x={labelX}
                          y={labelY}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#E8EDF1"
                          fontSize="10"
                          opacity="0.7"
                        >
                          {temp}°
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="landing-temp-value">{Math.min(50, Math.max(0, currentTemp))}°C</div>
            </div>
            <div className="landing-weather-info">
              {weatherIcon && (
                <img 
                  src={weatherIcon} 
                  alt="Weather icon" 
                  className="landing-weather-icon"
                  style={{ width: '100px', height: '100px' }}
                />
              )}
              <p>{new Date().toLocaleDateString('en-US', { weekday: 'long' })}, {
                new Date().toLocaleTimeString('en-US', { 
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true 
                })
              }</p>
              <p style={{ textTransform: 'capitalize' }}>{weatherDesc}</p>
            </div>
          </div>

          <div className="landing-temp-minmax">
            <div className="landing-high-low landing-high">
              <span>HIGH</span>
              <span className="landing-temp">{tempMax}°C</span>
            </div>
            <div className="landing-high-low landing-low">
              <span>LOW</span>
              <span className="landing-temp">{tempMin}°C</span>
            </div>
          </div>

          <div className="landing-mountain-bg"></div>
          <a 
            href="https://openweathermap.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-attribution"
          >
            Source: OpenWeatherMapApi
          </a>
        </div>

        {/* Right Section */}
        <div className="landing-right-section">
          <div className="landing-today-info">
            <h2 className="landing-today-heading">Today</h2>
            <span className="landing-today-date">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          
          <div className="landing-forecast-container">
            <div className="landing-forecast-header">
          
              <h3 className="landing-forecast-title">Hourly Forecast:</h3>
              
            </div>
            <div className="landing-forecast-cards">
              {forecastData.map((forecast, index) => (
                <div key={index} className="landing-forecast-card">
                  <div className="landing-forecast-time">{forecast.time}</div>
                  <img 
                    src={forecast.icon} 
                    alt="Weather icon" 
                    className="landing-forecast-icon"
                  />
                  <div className="landing-forecast-temp">{forecast.temp}°C</div>
                  <div className="landing-forecast-wind">
                    <div 
                      className="landing-wind-arrow" 
                      style={{ transform: `rotate(${forecast.windDeg}deg)` }}
                    >↑</div>
                    <span>{forecast.windSpeed}km/h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <h2 className="landing-highlights-heading">Highlights</h2>
          <div className="landing-highlights-grid">
            {/* UV Index Card */}
            <div className="landing-highlight-card">
              <h3>UV INDEX</h3>
              <InfoIcon text="UV Index measures the intensity of the sun's ultraviolet radiation. Higher values indicate greater risk of sun damage to skin." />
              <div className="landing-uv-gauge">
                <svg viewBox="0 0 200 120" className="landing-uv-meter">
                  <path
                    d="M 40 100 A 60 60 0 0 1 160 100"
                    className="landing-uv-background"
                  />
                  <path
                    d="M 40 100 A 60 60 0 0 1 160 100"
                    className="landing-uv-progress"
                    style={{
                      strokeDasharray: '188.5',
                      strokeDashoffset: `${188.5 - (uvIndex / 11) * 188.5}`
                    }}
                  />
                </svg>
                <div className="landing-uv-value">{uvIndex}</div>
              </div>
            </div>

            {/* Wind Direction Card */}
            <div className="landing-highlight-card">
              <h3>WIND DIRECTION</h3>
              <InfoIcon text="Shows the direction from which the wind is blowing, measured in degrees clockwise from true north." />
              <div className="landing-wind-info">
                <div className="landing-wind-direction">
                  <div className="landing-compass">
                    <div className="landing-compass-ring">
                      <span className="landing-compass-mark landing-n">N</span>
                      <span className="landing-compass-mark landing-e">E</span>
                      <span className="landing-compass-mark landing-s">S</span>
                      <span className="landing-compass-mark landing-w">W</span>
                      <div 
                        className="landing-compass-arrow"
                        style={{ transform: `rotate(${windDirection}deg)` }}
                      >
                        <div className="landing-arrow-head"></div>
                      </div>
                    </div>
                  </div>
                  <div className="landing-wind-direction-info">
                    <WindArrow direction={windDirection} />
                    <span className="landing-wind-direction-text">
                      {getWindDirection(windDirection)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sunrise & Sunset Card */}
            <div className="landing-highlight-card landing-sunrise-sunset-card">
              <h3>Sunrise/Sunset</h3>
              <InfoIcon text="Daily times for sunrise and sunset at your current location." />
              <div className="landing-sun-times">
                <div className="landing-time-display">{sunrise}</div>
                <div className="landing-sun-icon">
                  <div className="landing-sun-half landing-light"></div>
                  <div className="landing-sun-half landing-dark"></div>
                  <div className="landing-sun-rays"></div>
                </div>
                <div className="landing-time-display">{sunset}</div>
              </div>
            </div>

            {/* Humidity Card */}
            <div className="landing-highlight-card1">
              <h3>HUMIDITY</h3>
              <InfoIcon text="Relative humidity shows the amount of water vapor in the air as a percentage of the maximum possible." />
              <div className="landing-metric-container">
                <div className="landing-metric-value">
                  <span className="landing-value">{humidity}</span>
                  <span className="landing-unit">%</span>
                </div>
                <div className="landing-vertical-slider">
                  <div className="landing-slider-track"></div>
                  <div 
                    className="landing-slider-thumb"
                    style={{ bottom: `${humidity}%` }}
                  ></div>
                </div>
              </div>
              <div className="landing-metric-status">{getHumidityStatus(humidity)}</div>
            </div>

            {/* Visibility Card */}
            <div className="landing-highlight-card1">
              <h3>VISIBILITY</h3>
              <InfoIcon text="Maximum distance at which objects can be clearly seen. Values above 10km indicate excellent visibility." />
              <div className="landing-metric-container">
                <div className="landing-metric-value">
                  <span className="landing-visibility-value">{visibility.toFixed(1)}</span>
                  <span className="landing-unit">km</span>
                </div>
              </div>
              <div className="landing-metric-status">{getVisibilityStatus(visibility)}</div>
            </div>

            {/* Wind Speed Card */}
            <div className="landing-highlight-card1">
              <h3>WIND SPEED</h3>
              <InfoIcon text="Current wind speed measured in kilometers per hour (km/h). Higher values indicate stronger winds." />
              <div className="landing-metric-container">
                <div className="landing-metric-value">
                  <span className="landing-value">{windSpeed.toFixed(2)}</span>
                  <span className="landing-unit">km/h</span>
                </div>
                <div className="landing-vertical-slider">
                  <div className="landing-slider-track"></div>
                  <div 
                    className="landing-slider-thumb"
                    style={{ bottom: `${(windSpeed / 100) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div 
        className="landing-dashboard-button" 
        onClick={handleDashboardClick}
      >
        <span>Dashboard</span>
        <svg 
          className="landing-arrow" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>
    </div>
  );
};

export default Landing;