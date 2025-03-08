import React, { useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-resizable/css/styles.css";
import "./Temperature.css";
import "bootstrap/dist/css/bootstrap.min.css";
import 'leaflet/dist/leaflet.css';
import WeatherMap from '../Map/WeatherMap';
import { useNavigate } from "react-router-dom";
import axiosInstance from '../../utils/axios-config';

const Temperature = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState("day");
  const [chartData, setChartData] = useState([]);
  const [selectedView, setSelectedView] = useState("temperature");
  const [chartType, setChartType] = useState("line");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const echartsRef = useRef(null);
  const [showMap, setShowMap] = useState(false);
  const [locationParams, setLocationParams] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date('2020-01-01'),
    end: new Date()
  });
  const [showDateRange, setShowDateRange] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("24h");
  const [dateError, setDateError] = useState('');
  const navigate = useNavigate();

  const chartTypes = [
    { key: "line", label: "Line Chart" },
    { key: "bar", label: "Bar Chart" },
    { key: "area", label: "Area Chart" },
  ];

  const views = [
    {
      key: "temperature",
      label: "Temperature",
      metrics: [
        { key: "temp_out", label: "Outside Temp", color: 'rgba(24, 144, 255, 0.8)' },
        { key: "high_temp", label: "High Temp", color: 'rgba(255, 77, 79, 0.8)' },
        { key: "low_temp", label: "Low Temp", color: 'rgba(82, 196, 26, 0.8)' },
        { key: "in_temp", label: "Inside Temp", color: 'rgba(114, 46, 209, 0.8)' },
      ],
    },
    {
      key: "thws",
      label: "THWS Index",
      metrics: [{ key: "thsw_index", label: "THSW Index", color: 'rgba(250, 173, 20, 0.8)' }],
    },
    {
      key: "bar",
      label: "Barometric Pressure",
      metrics: [{ key: "bar", label: "Barometric", color: "#13c2c2" }],
    },
    {
      key: "heat",
      label: "Heat Index",
      metrics: [{ key: "heat_index", label: "Heat Index", color: "#eb2f96" }],
    },
    {
      key: "humidity",
      label: "Humidity",
      metrics: [
        { key: "out_hum", label: "Outside Humidity", color: "#36cfc9" },
        { key: "in_hum", label: "Inside Humidity", color: "#9254de" },
      ],
    },
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
      setLocationParams(event.detail);
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
    } else {
      setError("Please search for a city in the top bar");
      setLocationParams(null);
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

    // Set token in axiosInstance headers
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, [navigate]);

  const fetchData = async () => {
    if (!locationParams) return;
    
    setLoading(true);
    setError(null);
    try {
      const requestBody = {};

      // Add location parameters (only one of them)
      if (locationParams.lat && locationParams.lon) {
        requestBody.lat = locationParams.lat;
        requestBody.lon = locationParams.lon;
      } else if (locationParams.city_name) {
        requestBody.city_name = locationParams.city_name;
      }

      let url;
      if (viewType === "range") {
        url = 'weather-range/';
        requestBody.start_date = dateRange.start.toISOString().split('T')[0];
        requestBody.end_date = dateRange.end.toISOString().split('T')[0];
      } else {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const day = String(selectedDate.getDate()).padStart(2, "0");

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
        url = `/weather-data/${dateStr}/`;
      }

      console.log('Request URL:', url);
      console.log('Request Body:', requestBody);

      const response = await axiosInstance.post(url, requestBody);
      
      if (response.data) {
        const formattedData = formatChartData(response.data);
        setChartData(formattedData);
      } else {
        setError("No data available");
        setChartData([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || `Error fetching data: ${err.message}`);
      }
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    if (locationParams) {
      fetchData();
    }
  }, [selectedDate, viewType, locationParams]);

  useEffect(() => {
    if (viewType === 'range' && locationParams) {
      // Validate dates
      if (dateRange.start > dateRange.end) {
        setDateError('Start date cannot be after end date');
        return;
      }
      setDateError('');
      fetchData();
    }
  }, [dateRange.start, dateRange.end, viewType]);

  const formatChartData = (data) => {
    if (!data) return [];

    // Handle array response (for range view or monthly/yearly data)
    if (Array.isArray(data)) {
      return data.map(item => {
        const baseData = {
          date: viewType === 'year' ? `Month ${item.MONTH}` : item.DATE,
          time: item.TIME // Add time field for daily view
        };

        // For daily data
        if (item.TEMP_OUT !== undefined) {
          return {
            ...baseData,
            temp_out: item.TEMP_OUT,
            high_temp: item.HIGH_TEMP,
            low_temp: item.LOW_TEMP,
            in_temp: item.IN_TEMP,
            heat_index: item.HEAT_INDEX,
            thsw_index: item.THSW_INDEX,
            bar: item.BAR,
            out_hum: item.OUT_HUM,
            in_hum: item.IN_HUM
          };
        }
        // For monthly/yearly/range averages
        return {
          ...baseData,
          temp_out: item.AVG_TEMP_OUT,
          high_temp: item.AVG_HIGH_TEMP,
          low_temp: item.AVG_LOW_TEMP,
          in_temp: item.AVG_IN_TEMP,
          heat_index: item.AVG_HEAT_INDEX,
          thsw_index: item.AVG_THSW_INDEX,
          bar: item.AVG_BAR,
          out_hum: item.AVG_OUT_HUM,
          in_hum: item.AVG_IN_HUM
        };
      });
    }

    // Handle daily data (object with time-based entries)
    return Object.entries(data).map(([time, values]) => ({
      time: `${values.DATE} ${values.TIME}`, // Combine DATE and TIME
      temp_out: values.TEMP_OUT,
      high_temp: values.HIGH_TEMP,
      low_temp: values.LOW_TEMP,
      in_temp: values.IN_TEMP,
      heat_index: values.HEAT_INDEX,
      thsw_index: values.THSW_INDEX,
      bar: values.BAR,
      out_hum: values.OUT_HUM,
      in_hum: values.IN_HUM
    }));
  };

  const formatXAxisLabel = (value, viewType) => {
    if (viewType === 'day') {
      // Format time from TIME field
      if (!value) return '';
      const time = value.split(' ')[1]; // Get time part from "DATE TIME" string
      if (!time) return value;
      return time.split(':').slice(0, 2).join(':'); // Show only HH:MM
    } else if (viewType === 'month') {
      // Format as day of month
      const date = new Date(value);
      return date.getDate();
    } else if (viewType === 'year') {
      // Format as month name
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthNum = parseInt(value.split(' ')[1]) - 1;
      return monthNames[monthNum];
    }
    return value;
  };

  const getChartOptions = () => {
    const currentView = views.find((v) => v.key === selectedView);
    if (!currentView || !chartData.length) return {};

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
      ? chartData.map(item => item.time)
      : chartData.map(item => item.date);

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
      data: chartData.map(item => item[metric.key] || 0),
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
          saveAsImage: { name: 'weather_data' },
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

  const handleViewLocation = () => {
    setShowMap(true);
  };

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

  const handleDateRangeChange = (date, type) => {
    setDateRange(prev => {
      const newRange = { ...prev, [type]: date };
      
      // Validate date range
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
            {!loading && !error && chartData.length > 0 && (
              <ReactECharts
                ref={echartsRef}
                option={getChartOptions()}
                style={{ height: "100%", width: "100%" }}
                notMerge={true}
                opts={{ renderer: "canvas" }}
              />
            )}
          </div>
        </div>
      </div>

      {showMap && (
        <WeatherMap 
          onClose={() => setShowMap(false)}
          onLocationSelect={handleLocationSelect}
        />
      )}
    </div>
  );
};

export default Temperature;