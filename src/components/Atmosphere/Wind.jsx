import React, { useState, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './Wind.css';
import 'leaflet/dist/leaflet.css';
import { Outlet } from 'react-router-dom';
import WeatherMap from '../Map/WeatherMap';
import axiosInstance from '../../utils/axios-config';
import { useNavigate } from 'react-router-dom';

const Wind = () => {
  const [windData, setWindData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState("day");
  const [chartType, setChartType] = useState("windrose");
  const [showMap, setShowMap] = useState(false);
  const [selectedView, setSelectedView] = useState("occurrence");
  const chartRef = useRef(null);
  const [dateRange, setDateRange] = useState({
    start: new Date('2020-01-01'),
    end: new Date()
  });
  const [dateError, setDateError] = useState('');
  const [locationParams, setLocationParams] = useState(null);
  const navigate = useNavigate();

  const ALL_DIRECTIONS = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
  ];

  const views = [
    {
      key: "occurrence",
      label: "Wind Occurrence",
      metrics: [
        { key: "windrose", label: "Wind Rose", color: "#1890ff" }
      ],
    },
    {
      key: "frequency",
      label: "Wind Frequency",
      metrics: [
        { key: "frequency", label: "Frequency", color: "#faad14" }
      ],
    },
    {
      key: "wind speed",
      label: "Wind Speed",
      metrics: [
        { key: "speed", label: "Speed", color: "#faad14" }
      ],
    },

  ];

  useEffect(() => {
    fetchWindData();
  }, [selectedDate, viewType]);

  useEffect(() => {
    const handleLocationChange = (event) => {
      const newLocation = event.detail;
      if (newLocation.city_name) {
        setLocationParams({
          city_name: newLocation.city_name
        });
      } else if (newLocation.lat && newLocation.lon) {
        setLocationParams({
          lat: newLocation.lat,
          lon: newLocation.lon
        });
      }
    };

    window.addEventListener('locationChange', handleLocationChange);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationParams({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Please search for a city in the top bar");
          setLocationParams(null);
        }
      );
    }

    return () => {
      window.removeEventListener('locationChange', handleLocationChange);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (viewType === 'range' && locationParams) {
      if (dateRange.start > dateRange.end) {
        setDateError('Start date cannot be after end date');
        return;
      }
      setDateError('');
      fetchWindData();
    }
  }, [dateRange.start, dateRange.end, viewType]);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  const fetchWindData = async () => {
    if (!locationParams) return;

    try {
      setLoading(true);
      setError(null);

      const requestBody = {};

      if (locationParams.city_name) {
        requestBody.city_name = locationParams.city_name;
      } else if (locationParams.lat && locationParams.lon) {
        requestBody.lat = locationParams.lat;
        requestBody.lon = locationParams.lon;
      }

      if (viewType === "range") {
        if (dateRange.start > dateRange.end) {
          setError('Start date cannot be after end date');
          return;
        }
        requestBody.from_date = dateRange.start.toISOString().split('T')[0];
        requestBody.to_date = dateRange.end.toISOString().split('T')[0];
      } else {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const day = String(selectedDate.getDate()).padStart(2, "0");

        requestBody.year = year.toString();
        
        if (viewType === "month" || viewType === "day") {
          requestBody.month = month;
        }
        
        if (viewType === "day") {
          requestBody.day = day;
        }
      }

      const response = await axiosInstance.post('/wind/', requestBody);
      console.log("API Response:", response.data);

      let transformedData = {
        period: response.data.period || response.data.date,
        directions: {}
      };

      if (viewType === "day") {
        transformedData.directions = response.data.summary_by_direction;
        transformedData.wind_data = response.data.wind_data;
      } else {
        transformedData.directions = response.data.directions;
      }

      setWindData(transformedData);
      console.log("Final Wind Data:", transformedData);
    } catch (err) {
      console.error("Error fetching wind data:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const getWindRoseOption = () => {
    const speedRanges = [
      { min: 0, max: 4.9, color: '#0777FF', label: '0 - 4.9 km/h', key: '0-4.9kmph' },
      { min: 5, max: 6.9, color: '#00FFFF', label: '5 - 6.9 km/h', key: '5-6.9kmph' },
      { min: 7, max: 9.9, color: '#00FF90', label: '7 - 9.9 km/h', key: '7-9.9kmph' },
      { min: 10, max: 14.99, color: '#FFFF99', label: '10 - 14.99 km/h', key: '10-14.99kmph' },
      { min: 15, max: 19.99, color: '#FF7F00', label: '15 - 19.99 km/h', key: '15-19.99kmph' },
      { min: 20, max: Infinity, color: '#FF0000', label: '20+ km/h', key: '20+kmph' }
    ];

    const totalOccurrences = Object.values(windData.directions).reduce((sum, dir) => {
      return sum + Object.values(dir.wind_speed_ranges || {}).reduce((s, v) => s + Number(v || 0), 0);
    }, 0);

    const series = speedRanges.map(range => ({
      name: range.label,
      type: 'bar',
      coordinateSystem: 'polar',
      stack: 'total',
      barWidth: 22.5,
      barGap: '-100%',
      data: ALL_DIRECTIONS.map(direction => {
        const dirData = windData.directions[direction] || {};
        
        if (selectedView === 'occurrence') {
          const occurrences = Number(dirData.wind_speed_ranges?.[range.key] || 0);
          return occurrences;
        } else {
          const rangeOccurrences = Number(dirData.wind_speed_ranges?.[range.key] || 0);
          return totalOccurrences > 0 ? (rangeOccurrences / totalOccurrences) * 100 : 0;
        }
      }),
      itemStyle: {
        color: range.color
      }
    }));

    return {
      title: {
        text: selectedView === 'occurrence' ? 'Wind Occurrence' : 'Wind Frequency Distribution (%)',
        subtext: `Period: ${windData.period}`,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
          let result = `Direction: ${params[0].axisValue}<br/>`;
          let total = 0;
          params.forEach(param => {
            if (param.value > 0) {
              if (selectedView === 'occurrence') {
                result += `${param.seriesName}: ${Math.round(param.value)}<br/>`;
              } else {
                result += `${param.seriesName}: ${param.value.toFixed(1)}%<br/>`;
              }
              total += param.value;
            }
          });
          if (selectedView === 'occurrence') {
            result += `Total: ${Math.round(total)}`;
          } else {
            result += `Total: ${total.toFixed(1)}%`;
          }
          return result;
        }
      },
      toolbox: {
        feature: {
          saveAsImage: { title: 'Save' },
          dataZoom: {
            yAxisIndex: 'none',
            title: {
              zoom: 'Zoom',
              back: 'Reset Zoom'
            }
          },
          restore: { title: 'Reset' }
        },
        right: 20,
        top:20
      },
      dataZoom: [
        {
          type: 'inside',
          radiusAxisIndex: 0,
          startValue: 0,
          endValue: selectedView === 'frequency' ? 100 : undefined,
          minValueSpan: 1,
          maxValueSpan: selectedView === 'frequency' ? 100 : undefined,
          zoomLock: false,
          throttle: 100
        },
        {
          type: 'slider',
          radiusAxisIndex: 0,
          startValue: 0,
          endValue: selectedView === 'frequency' ? 100 : undefined,
          minValueSpan: 1,
          maxValueSpan: selectedView === 'frequency' ? 100 : undefined,
          left: '10%',
          right: '10%',
          bottom: 50,
          height: 20,
          handleSize: '100%',
          showDetail: true,
          fillerColor: 'rgba(24, 144, 255, 0.2)',
          borderColor: '#1890ff',
          handleStyle: {
            color: '#1890ff'
          }
        }
      ],
      legend: {
        data: speedRanges.map(range => range.label),
        bottom: 80,
        itemWidth: 25,
        itemHeight: 10,
        textStyle: { fontSize: 12 }
      },
      polar: {
        radius: '65%'
      },
      angleAxis: {
        type: 'category',
        data: ALL_DIRECTIONS,
        clockwise: true,
        startAngle: 90,
        boundaryGap: false,
        axisLine: {
          show: true,
          lineStyle: { color: '#999' }
        },
        splitLine: {
          show: true,
          lineStyle: { color: '#ddd' }
        },
        axisLabel: {
          fontSize: 12
        }
      },
      radiusAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: { color: '#ddd' }
        },
        axisLabel: {
          formatter: selectedView === 'occurrence' ? 
            '{value}' : 
            '{value}%'
        },
        max: selectedView === 'frequency' ? 100 : undefined
      },
      series: series,
    };
  };

  const getBarChartOption = () => {
    const directions = ALL_DIRECTIONS;
    
    const totalOccurrences = Object.values(windData.directions).reduce((sum, dir) => {
      return sum + Object.values(dir.wind_speed_ranges || {}).reduce((s, v) => s + Number(v || 0), 0);
    }, 0);

    const data = directions.map(dir => {
      const dirData = windData.directions[dir] || {};
      const occurrences = Object.values(dirData.wind_speed_ranges || {})
        .reduce((sum, val) => sum + Number(val || 0), 0);
      return {
        direction: dir,
        occurrences: occurrences,
        percentage: totalOccurrences > 0 ? (occurrences / totalOccurrences) * 100 : 0
      };
    });

    return {
      title: {
        text: selectedView === 'occurrence' ? 'Wind Occurrences by Direction' : 'Wind Frequency by Direction (%)',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          const direction = params[0].name;
          const item = data.find(d => d.direction === direction);
          if (selectedView === 'occurrence') {
            return `Direction: ${direction}<br/>
                    Occurrences: ${item.occurrences}<br/>
                    Avg Speed: ${(windData.directions[direction]?.avg_wind_speed || 0).toFixed(1)} km/h<br/>
                    High speed: ${(windData.directions[direction]?.highest_wind_speed || 0).toFixed(1)} km/h)}`;
          } else {
            return `Direction: ${direction}<br/>
                    Frequency: ${item.percentage.toFixed(1)}%<br/>
                    Avg Speed: ${(windData.directions[direction]?.avg_wind_speed || 0).toFixed(1)} km/h<br/>
                    High speed: ${(windData.directions[direction]?.highest_wind_speed || 0).toFixed(1)} km/h)}`;
          }
        }
      },
      toolbox: {
        feature: {
          saveAsImage: { title: 'Save' },
          restore: { title: 'Reset' }
        },
        right: 20
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: directions,
        axisLabel: {
          interval: 0,
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: selectedView === 'occurrence' ? 'Occurrences' : 'Frequency (%)',
        nameLocation: 'middle',
        nameGap: 50,
        max: selectedView === 'frequency' ? 100 : undefined,
        axisLabel: {
          formatter: selectedView === 'frequency' ? '{value}%' : '{value}'
        }
      },
      series: [{
        name: selectedView === 'occurrence' ? 'Occurrences' : 'Frequency',
        type: 'bar',
        data: selectedView === 'occurrence' ? 
          data.map(d => d.occurrences) : 
          data.map(d => d.percentage),
        itemStyle: { color: '#1890ff' },
        label: {
          show: true,
          position: 'top',
          formatter: function(params) {
            const direction = params.name;
            const avgSpeed = windData.directions[direction]?.avg_wind_speed || 0;
            
            return avgSpeed > 0 ? `${avgSpeed.toFixed(1)} km/h` : '';
          },
          color: '#333',
          fontSize: 12,
          fontWeight: 'bold'
        }
    }]
    
    };
  };

  const getWindSpeedLineChartOption = () => {
    if (!windData) return {};

    if (viewType === "day" && windData.wind_data) {
      const timeData = windData.wind_data.map(item => ({
        time: item.time.slice(0, 5),
        direction: item.wind_dir,
        avgSpeed: item.wind_speed,
        highSpeed: item.high_speed
      }));

      timeData.sort((a, b) => a.time.localeCompare(b.time));

      return {
        title: {
          text: `Wind Speed - ${windData.date}`,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            const index = params[0].dataIndex;
            const data = timeData[index];
            return `Time: ${data.time}<br/>
                    Direction: ${data.direction}<br/>
                    Wind Speed: ${data.avgSpeed.toFixed(1)} km/h<br/>
                    High Speed: ${data.highSpeed.toFixed(1)} km/h`;
          }
        },
        legend: {
          data: ['Wind Speed', 'High Speed'],
          top: '5%'
        },
        toolbox: {
          feature: {
            saveAsImage: { title: 'Save' },
            restore: { title: 'Reset' }
          },
          right: 20
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          name: 'Time',
          data: timeData.map(d => d.time),
        axisLabel: { rotate: 45, interval: 'auto' }
        },
        yAxis: {
          type: 'value',
          name: 'Speed (km/h)',
          axisLabel: {
            formatter: '{value} km/h'
          }
        },
        series: [
          {
            name: 'Wind Speed',
            type: 'line',
            data: timeData.map(d => d.avgSpeed),
            itemStyle: { color: '#1890ff' },
            smooth: true,
            
          },
          {
            name: 'High Speed',
            type: 'line',
            data: timeData.map(d => d.highSpeed),
            itemStyle: { color: '#ff4d4f' },
            smooth: true,
           
          }
        ]
      };
    } else {
      const timeData = Object.entries(windData.directions).map(([direction, data]) => ({
        direction: direction,
        avgSpeed: data.avg_wind_speed || 0,
        highSpeed: data.highest_wind_speed || 0,
        time: data.highest_wind_speed_time?.slice(0, 5) || '',
        date: data.highest_wind_speed_date || ''
      }));

      timeData.sort((a, b) => new Date(a.date) - new Date(b.date));

      return {
        title: {
          text: `Wind Speed - ${windData.period}`,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            const index = params[0].dataIndex;
            const data = timeData[index];
            return `Direction: ${data.direction}<br/>
                    Avg Speed: ${data.avgSpeed.toFixed(1)} km/h<br/>
                    Highest Speed: ${data.highSpeed.toFixed(1)} km/h<br/>
                    Date: ${data.date}<br/>
                    Time: ${data.time}`;
          }
        },
        legend: {
          data: ['Average Speed', 'Highest Speed'],
          top: '5%'
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          name: 'Direction',
          data: timeData.map(d => d.direction),
          axisLabel: {
            rotate: 45,
            interval: 0
          }
        },
        yAxis: {
          type: 'value',
          name: 'Speed (km/h)',
          axisLabel: {
            formatter: '{value} km/h'
          }
        },
        series: [
          {
            name: 'Average Speed',
            type: 'line',
            data: timeData.map(d => d.avgSpeed),
            itemStyle: { color: '#1890ff' },
            smooth: true,
            label: {
              show: true,
              position: 'top',
              formatter: (params) => (params.value > 0 ? `${params.value.toFixed(1)}` : '')
            }
          },
          {
            name: 'Highest Speed',
            type: 'line',
            data: timeData.map(d => d.highSpeed),
            itemStyle: { color: '#ff4d4f' },
            smooth: true,
            label: {
              show: true,
              position: 'top',
              formatter: (params) => (params.value > 0 ? `${params.value.toFixed(1)}` : '')
            }
          }
        ]
      };
    }
  };

  const handleViewLocation = () => {
      setShowMap(true);
  };

  const handleDateRangeChange = (date, type) => {
    setDateRange(prev => {
      const newRange = { ...prev, [type]: date };
      
      if (type === 'start' && date > prev.end) {
        setDateError('Start date cannot be after end date');
      } else if (type === 'end' && date < prev.start) {
        setDateError('End date cannot be before start date');
      } else {
        setDateError('');
      }
      
      return newRange;
    });
  };

  return (
    <div className="weather-container">
      <div className="controls-section">
        <div className="controls-container">
          <div className="d-flex flex-wrap gap-3 align-items-end">
            <div className="control-group">
              <label className="form-label">View Type:</label>
              <select
                value={viewType}
                onChange={(e) => setViewType(e.target.value)}
                className="form-select chart-type-select"
              >
                <option value="day">Daily View</option>
                <option value="month">Monthly View</option>
                <option value="year">Yearly View</option>
                <option value="range">Date Range</option>
              </select>
            </div>
            
            {viewType === 'range' ? (
              <div className="control-group">
                <label className="form-label">Select Date Range:</label>
                <div className="date-range-picker">
                  <div className="date-input-wrapper">
                    <DatePicker
                      selected={dateRange.start}
                      onChange={date => handleDateRangeChange(date, 'start')}
                      maxDate={dateRange.end}
                      minDate={new Date('2020-01-01')}
                      placeholderText="Start Date"
                      className={`form-control ${dateError ? 'is-invalid' : ''}`}
                      dateFormat="yyyy-MM-dd"
                    />
                
                  </div>
                  
                  <span className="date-separator">to</span>
                  
                  <div className="date-input-wrapper">
                    <DatePicker
                      selected={dateRange.end}
                      onChange={date => handleDateRangeChange(date, 'end')}
                      minDate={dateRange.start}
                      maxDate={new Date()}
                      placeholderText="End Date"
                      className={`form-control ${dateError ? 'is-invalid' : ''}`}
                      dateFormat="yyyy-MM-dd"
                    />
                   
                  </div>
                </div>
                {dateError && (
                  <div className="date-error">
                    {dateError}
                  </div>
                )}
              </div>
            ) : (
              <div className="control-group">
                <label className="form-label">Date:</label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat={
                    viewType === "year" ? "yyyy" :
                    viewType === "month" ? "MM/yyyy" : 
                    "yyyy-MM-dd"
                  }
                  showMonthYearPicker={viewType === "month"}
                  showYearPicker={viewType === "year"}
                  maxDate={new Date()}
                  className="form-control date-input"
                />
              </div>
            )}

            <div className="control-group">
              <label className="form-label">Chart Type:</label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="form-select chart-type-select"
                disabled={selectedView === 'wind speed'}
              >
                <option value="windrose">Wind Rose</option>
                <option value="bar">Bar Chart</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="view-section">
        <div className="view-buttons">
          {views.map((view) => (
            <button
              key={view.key}
              onClick={() => setSelectedView(view.key)}
              className={`btn view-button ${selectedView === view.key ? "active" : ""}`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-container">
          {loading && (
            <div className="loading">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          {error && (
            <div className="error alert alert-danger text-center">
              <h4 className="alert-heading">Coming Soon!</h4>
              <p>{error}</p>
            </div>
          )}
          {!loading && !error && windData && (
            <ReactECharts
              ref={chartRef}
              option={
                selectedView === 'wind speed' ? getWindSpeedLineChartOption() :
                chartType === "windrose" ? getWindRoseOption() :
                getBarChartOption()
              }
              style={{ height: "100%", width: "100%" }}
              notMerge={true}
              opts={{ renderer: "canvas" }}
            />
          )}
        </div>
      </div>

      {windData && (
       <Outlet/>
      )}

      {showMap && <WeatherMap onClose={() => setShowMap(false)} />}
    </div>
  );
};

export default Wind;