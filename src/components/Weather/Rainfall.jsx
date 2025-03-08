import React, { useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Rainfall.css";
import 'leaflet/dist/leaflet.css';
import WeatherMap from "../Map/WeatherMap";
import { useNavigate } from "react-router-dom";
import axiosInstance from '../../utils/axios-config';

const Rainfall = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState("day");
  const [rainfallData, setRainfallData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [locationParams, setLocationParams] = useState(null);
  const chartRef = useRef(null);
  const [chartType, setChartType] = useState("line");
  const [selectedView, setSelectedView] = useState("rainfall");
  const [dateRange, setDateRange] = useState({
    start: new Date('2020-01-01'),
    end: new Date()
  });
  const [dateError, setDateError] = useState('');
  const navigate = useNavigate();

  const chartTypes = [
    { key: "line", label: "Line Chart" },
    { key: "bar", label: "Bar Chart" },
    { key: "area", label: "Area Chart" },
  ];

  const views = [
    {
      key: "rainfall",
      label: "Rainfall",
      metrics: [
        { key: "rain", label: "Rainfall", color: 'rgba(24, 144, 255, 0.8)' },
        { key: "rain_rate", label: "Rain Rate", color: 'rgba(82, 196, 26, 0.8)' },
      ],
    },
    {
      key: "et",
      label: "Evapotranspiration",
      metrics: [{ key: "et", label: "ET", color: 'rgba(250, 173, 20, 0.8)' }],
    }
  ];

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // Listen for location changes from Dashboard
    const handleLocationChange = (event) => {
      const newLocation = event.detail;
      // Store only city_name OR lat/lon, not both
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

    // Initial location check
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

  const fetchRainfallData = async () => {
    if (!locationParams) return;

    try {
      setLoading(true);
      setError(null);

      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      
      const queryParams = new URLSearchParams(locationParams).toString();

      let url;
      switch (viewType) {
        case "month":
          url = `${BASE_URL}/weather-data/${year}-${month}/?${queryParams}`;
          break;
        case "year":
          url = `${BASE_URL}/weather-data/${year}/?${queryParams}`;
          break;
        default:
          url = `${BASE_URL}/weather-data/${year}-${month}-${day}/?${queryParams}`;
      }

      const response = await axios.get(url);
      
      if (!response.data || (Array.isArray(response.data) && response.data.length === 0)) {
        setError("No data available for the selected period");
        setRainfallData({ rain_data: [] });
        return;
      }

      let formattedData;
      if (viewType === "day") {
        formattedData = Array.isArray(response.data) ? response.data : [response.data];
        formattedData = formattedData.map(item => ({
          time: item.TIME,
          rain: Number(item.RAIN || 0),
          rain_rate: Number(item.RAIN_RATE || 0)
        }));
      } else if (viewType === "month") {
        formattedData = response.data.map(item => ({
          date: new Date(item.DATE).getDate(),
          rain: Number(item.AVG_RAIN || 0),
          rain_rate: Number(item.AVG_RAIN_RATE || 0)
        }));
      } else {
        formattedData = response.data.map(item => ({
          month: item.MONTH,
          rain: Number(item.AVG_RAIN || 0),
          rain_rate: Number(item.AVG_RAIN_RATE || 0)
        }));
      }

      setRainfallData({ rain_data: formattedData });
    } catch (err) {
      console.error("Error fetching rainfall data:", err);
      setError("No data available for the selected period");
      setRainfallData({ rain_data: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (locationParams) {
      fetchRainfallData();
    }
  }, [selectedDate, viewType, locationParams]);

  const handleLocationSelect = (location) => {
    if (location.lat && location.lon) {
      setLocationParams({
        lat: location.lat,
        lon: location.lon
      });
    } else if (location.city_name) {
      setLocationParams({
        city_name: location.city_name
      });
    }
  };

  const getChartOption = () => {
    if (!rainfallData || !rainfallData.rain_data) return {};

    const getTitle = () => {
      const dateOptions = {
        day: { year: "numeric", month: "long", day: "numeric" },
        month: { year: "numeric", month: "long" },
        year: { year: "numeric" }
      };
      const formattedDate = selectedDate.toLocaleDateString(
        "en-US",
        dateOptions[viewType]
      );
      return `Rainfall Data - ${formattedDate}`;
    };

    const xAxisData = rainfallData.rain_data.map(item => {
      if (viewType === "year") {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthNames[item.month - 1];
      } else if (viewType === "month") {
        return item.date.toString();
      } else {
        return item.time.slice(0, 5); // HH:MM format
      }
    });

    const rainData = rainfallData.rain_data.map(item => item.rain);
    const rainRateData = rainfallData.rain_data.map(item => item.rain_rate);

    return {
      title: {
        text: getTitle(),
        left: 'center',
        top: 20,
        textStyle: {
          fontSize: window.innerWidth <= 768 ? 14 : 16
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        formatter: function(params) {
          return `${params[0].axisValue}<br/>
                  Rainfall: ${params[0].value.toFixed(2)} mm<br/>
                  Rain Rate: ${params[1].value.toFixed(2)} mm/hr`;
        }
      },
      legend: {
        data: ['Rainfall', 'Rain Rate'],
        top: 50
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '15%',
        top: '25%',
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: { title: 'Save' },
          restore: { title: 'Reset' }
        },
        right: 20
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100
        },
        {
          type: 'slider',
          start: 0,
          end: 100,
          bottom: 10
        }
      ],
      xAxis: {
        type: 'category',
        boundaryGap: chartType === "bar",
        data: xAxisData,
        axisLabel: {
          rotate: window.innerWidth <= 768 ? 0 : 45,
          interval: function(index, value) {
            if (viewType === "day") {
              if (window.innerWidth <= 768) {
                // Get the hour from the time value
                const hour = parseInt(value);
                // Show only one label per hour (0-23)
                return !isNaN(hour) && index === xAxisData.findIndex(time => parseInt(time) === hour);
              }
              return index % 2 === 0;
            }
            return 0;
          },
          formatter: function(value) {
            if (window.innerWidth <= 768 && viewType === "day") {
              // Show only hour with 'hr' suffix
              const hour = parseInt(value);
              return !isNaN(hour) ? `${hour}` : value;
            }
            return value;
          },
          textStyle: {
            fontSize: window.innerWidth <= 768 ? 10 : 12,
            padding: window.innerWidth <= 768 ? [5, 0, 0, 0] : [8, 0, 0, 0],
          },
          margin: window.innerWidth <= 768 ? 8 : 14
        },
        axisTick: {
          show: false
        }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Rainfall (mm)',
          position: 'left',
          axisLine: { show: true },
          axisLabel: { 
            formatter: '{value} mm',
            fontSize: window.innerWidth <= 768 ? 10 : 12
          }
        },
        {
          type: 'value',
          name: 'Rain Rate (mm/hr)',
          position: 'right',
          axisLine: { show: true },
          axisLabel: { 
            formatter: '{value} mm/hr',
            fontSize: window.innerWidth <= 768 ? 10 : 12
          }
        }
      ],
      series: [
        {
          name: 'Rainfall',
          type: chartType === "area" ? "line" : chartType,
          data: rainData,
          itemStyle: {
            color: '#1890ff'
          },
          areaStyle: chartType === "area" ? {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0,
                color: '#1890ffA0'
              }, {
                offset: 1,
                color: '#1890ff10'
              }]
            }
          } : undefined,
          smooth: chartType !== "bar"
        },
        {
          name: 'Rain Rate',
          type: chartType === "bar" ? "bar" : "line",
          yAxisIndex: 1,
          data: rainRateData,
          itemStyle: {
            color: '#FF7F50'
          },
          areaStyle: chartType === "area" ? {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0,
                color: '#FF7F50A0'
              }, {
                offset: 1,
                color: '#FF7F5010'
              }]
            }
          } : undefined,
          smooth: true
        }
      ]
    };
  };

  const handleViewLocation = () => {
      setShowMap(true);
  };

  const fetchData = async () => {
    if (!locationParams) return;
    
    setLoading(true);
    setError(null);
    try {
      const requestBody = {};

      // Add only one type of location parameter to request body
      if (locationParams.city_name) {
        requestBody.city_name = locationParams.city_name;
      } else if (locationParams.lat && locationParams.lon) {
        requestBody.lat = locationParams.lat;
        requestBody.lon = locationParams.lon;
      } else {
        setError("Invalid location parameters");
        return;
      }

      let url;
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");

      if (viewType === "range") {
        url = 'weather-range/';
        requestBody.start_date = dateRange.start.toISOString().split('T')[0];
        requestBody.end_date = dateRange.end.toISOString().split('T')[0];
      } else {
        // Format date string based on view type
        let dateStr;
        switch (viewType) {
          case "month":
            dateStr = `${year}-${month}`;
            break;
          case "year":
            dateStr = `${year}`;
            break;
          default:
            dateStr = `${year}-${month}-${day}`;
        }
        url = `weather-data/${dateStr}/`;
      }

      console.log('Request URL:', url);
      console.log('Request Body:', requestBody);

      const response = await axiosInstance.post(url, requestBody);
      
      if (response.data) {
        const formattedData = formatChartData(response.data);
        setRainfallData({ rain_data: formattedData });
      } else {
        setError("No data available");
        setRainfallData({ rain_data: [] });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || `Error fetching data: ${err.message}`);
      setRainfallData({ rain_data: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewType === 'range' && locationParams) {
      if (dateRange.start > dateRange.end) {
        setDateError('Start date cannot be after end date');
        return;
      }
      setDateError('');
      fetchData();
    }
  }, [dateRange.start, dateRange.end, viewType]);

  useEffect(() => {
    if (locationParams) {
      fetchData();
    }
  }, [selectedDate, viewType, locationParams]);

  const formatChartData = (data) => {
    if (!data) return [];

    if (Array.isArray(data)) {
      return data.map(item => {
        const baseData = {
          date: viewType === 'year' ? `Month ${item.MONTH}` : item.DATE,
          time: item.TIME
        };

        if (item.RAIN !== undefined) {
          return {
            ...baseData,
            rain: item.RAIN,
            rain_rate: item.RAIN_RATE,
            et: item.ET
          };
        }
        return {
          ...baseData,
          rain: item.AVG_RAIN,
          rain_rate: item.AVG_RAIN_RATE,
          et: item.AVG_ET
        };
      });
    }

    return Object.entries(data).map(([time, values]) => ({
      time: `${values.DATE} ${values.TIME}`,
      rain: values.RAIN,
      rain_rate: values.RAIN_RATE,
      et: values.ET
    }));
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

  const formatXAxisLabel = (value, viewType) => {
    if (viewType === 'day') {
      if (!value) return '';
      const time = value.split(' ')[1];
      if (!time) return value;
      return time.split(':').slice(0, 2).join(':');
    } else if (viewType === 'month') {
      const date = new Date(value);
      return date.getDate();
    } else if (viewType === 'year') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthNum = parseInt(value.split(' ')[1]) - 1;
      return monthNames[monthNum];
    }
    return value;
  };

  const getChartOptions = () => {
    const currentView = views.find((v) => v.key === selectedView);
    if (!currentView || !rainfallData?.rain_data?.length) return {};

    // Add date formatting for title
    const getTitle = () => {
      if (viewType === 'range') {
        return `${currentView.label} - From ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}`;
      } else {
        const dateOptions = {
          day: { year: 'numeric', month: 'long', day: 'numeric' },
          month: { year: 'numeric', month: 'long' },
          year: { year: 'numeric' }
        };
        const formattedDate = selectedDate.toLocaleDateString('en-US', dateOptions[viewType]);
        return `${currentView.label} - ${formattedDate}`;
      }
    };

    const xAxisData = viewType === 'day' 
      ? rainfallData.rain_data.map(item => item.time)
      : rainfallData.rain_data.map(item => item.date);

    const series = currentView.metrics.map(metric => ({
      name: metric.label,
      type: chartType === 'area' ? 'line' : chartType,
      areaStyle: chartType === 'area' ? {
        opacity: 0.3,
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{
            offset: 0,
            color: metric.color
          }, {
            offset: 1,
            color: 'rgba(255,255,255,0.2)'
          }]
        }
      } : null,
      data: rainfallData.rain_data.map(item => item[metric.key] || 0),
      lineStyle: {
        width: 2,
        type: 'solid',
        color: metric.color
      },
      itemStyle: {
        color: metric.color,
        borderWidth: 2
      },
      smooth: true,
      symbol: 'circle',
      symbolSize: 6
    }));

    return {
      title: {
        text: getTitle(),
        left: 'center',
        textStyle: {
          color: '#666'
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          let result = `${params[0].axisValue}<br/>`;
          params.forEach(param => {
            const value = typeof param.value === 'number' ? param.value.toFixed(2) : 'N/A';
            result += `${param.marker} ${param.seriesName}: ${value}<br/>`;
          });
          return result;
        }
      },
      legend: {
        data: currentView.metrics.map(m => m.label),
        bottom: 0,
        textStyle: {
          color: '#666'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
          saveAsImage: { name: 'rainfall_data' },
          restore: {}
        }
      },
      dataZoom: [{
        type: 'inside',
        start: 0,
        end: 100
      }, {
        start: 0,
        end: 100
      }],
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          formatter: (value) => formatXAxisLabel(value, viewType),
          rotate: 45,
          color: '#666'
        },
        axisLine: {
          lineStyle: {
            color: '#ddd'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: currentView.label,
        nameTextStyle: {
          color: '#666'
        },
        axisLabel: {
          formatter: '{value}',
          color: '#666'
        },
        axisLine: {
          lineStyle: {
            color: '#ddd'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#eee'
          }
        }
      },
      series
    };
  };

  return (
    <div className="weather-container">
      <div className="row">
        <div className="col-12">
          <div className="controls-container">
            <div className="d-flex flex-wrap gap-3 align-items-end">
              <div className="control-group">
                <label className="form-label">View Type:</label>
                <select
                  value={viewType}
                  onChange={(e) => setViewType(e.target.value)}
                  className="form-select view-type-select"
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
                >
                  {chartTypes.map((type) => (
                    <option key={type.key} value={type.key}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
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
      </div>

      <div className="row flex-grow-1">
        <div className="col-12">
          <div className="chart-container">
            {loading && (
              <div className="loading">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
            {!locationParams && (
              <div className="error alert alert-warning text-center">
                <h4 className="alert-heading">Location Required</h4>
                <p>Please enable location services or search for a city using the search bar above</p>
              </div>
            )}
            {error && locationParams && (
              <div className="error alert alert-info text-center">
                <h4 className="alert-heading">Coming Soon!</h4>
                <p>{error}</p>
              </div>
            )}
            {!loading && !error && rainfallData?.rain_data?.length > 0 && (
              <ReactECharts
                option={getChartOptions()}
                style={{ height: "100%", width: "100%" }}
                notMerge={true}
                opts={{ renderer: "canvas" }}
              />
            )}
          </div>
        </div>
      </div>

      {showMap && <WeatherMap onClose={() => setShowMap(false)} />}
    </div>
  );
};

export default Rainfall;
