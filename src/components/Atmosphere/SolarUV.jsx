import React, { useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./solarUV.css"; // Reuse the same styles
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import axiosInstance from '../../utils/axios-config';

const SolarUV = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState("day");
  const [chartData, setChartData] = useState([]);
  const [selectedView, setSelectedView] = useState("solar");
  const [chartType, setChartType] = useState("line");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationParams, setLocationParams] = useState(null);
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
      key: "solar",
      label: "Solar Radiation",
      metrics: [
        { key: "solar_rad", label: "Solar Radiation", color: 'rgba(250, 173, 20, 0.8)' },
        { key: "high_solar_rad", label: "High Solar Rad", color: 'rgba(255, 77, 79, 0.8)' },
        { key: "solar_energy", label: "Solar Energy", color: 'rgba(82, 196, 26, 0.8)' },
      ],
    },
    {
      key: "uv",
      label: "UV Index",
      metrics: [
        { key: "uv_index", label: "UV Index", color: 'rgba(24, 144, 255, 0.8)' },
        { key: "high_uv", label: "High UV", color: 'rgba(114, 46, 209, 0.8)' },
        { key: "uv_dose", label: "UV Dose", color: 'rgba(245, 34, 45, 0.8)' },
      ],
    }
  ];

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Listen for location changes from Dashboard
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

  const fetchData = async () => {
    if (!locationParams) return;
    
    setLoading(true);
    setError(null);
    try {
      const requestBody = {};

      // Add location parameters to request body
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
        setChartData(formattedData);
      } else {
        setError("No data available");
        setChartData([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || `Error fetching data: ${err.message}`);
      setChartData([]);
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
    if (!data || !Array.isArray(data)) return [];

    return data.map(item => {
      const baseData = {
        date: item.DATE,
        time: item.TIME || ''
      };

      if (viewType === 'day') {
        // Daily data format
        return {
          ...baseData,
          solar_rad: Number(item.SOLAR_RAD || 0),
          solar_energy: Number(item.SOLAR_ENERGY || 0),
          high_solar_rad: Number(item.HIGH_SOLAR_RAD || 0),
          uv_index: Number(item.UV_INDEX || 0),
          uv_dose: Number(item.UV_DOSE || 0),
          high_uv: Number(item.HIGH_UV || 0)
        };
      } else {
        // Monthly, Yearly, and Range data format
        return {
          ...baseData,
          solar_rad: Number(item.AVG_SOLAR_RAD || 0),
          solar_energy: Number(item.AVG_SOLAR_ENERGY || 0),
          high_solar_rad: Number(item.AVG_HIGH_SOLAR_RAD || 0),
          uv_index: Number(item.AVG_UV_INDEX || 0),
          uv_dose: Number(item.AVG_UV_DOSE || 0),
          high_uv: Number(item.AVG_HIGH_UV || 0)
        };
      }
    });
  };

  const formatXAxisLabel = (value, viewType) => {
    if (!value) return '';

    if (viewType === 'day') {
      // For daily view, show time
      const time = value.split(' ')[1];
      if (!time) return value;
      return time.split(':').slice(0, 2).join(':');
    } else if (viewType === 'month') {
      // For monthly view, show day of month
      return value.split('-')[2] || value;
    } else if (viewType === 'year') {
      // For yearly view, show month
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = parseInt(value.split('-')[1]) - 1;
      return monthNames[month] || value;
    }
    return value;
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

  const getChartOptions = () => {
    const currentView = views.find((v) => v.key === selectedView);
    if (!currentView || !chartData.length) return {};

    // Format date for title
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
      ? chartData.map(item => `${item.date} ${item.time}`)
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
          const date = xAxisData[params[0].dataIndex];
          let result = `${date}<br/>`;
          params.forEach(param => {
            result += `${param.marker} ${param.seriesName}: ${param.value.toFixed(2)}<br/>`;
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
          saveAsImage: { name: 'solar_uv_data' },
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
            {!loading && !error && chartData.length > 0 && (
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
    </div>
  );
};

export default SolarUV; 