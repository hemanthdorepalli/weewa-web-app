import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import './Dashboard.css';
import dp from '../assets/no-user-image.gif';
import WeatherMap from './Map/WeatherMap';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import axiosInstance from '../utils/axios-config';

const DashboardContent = () => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [openCategory, setOpenCategory] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [locationParams, setLocationParams] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentCity, setCurrentCity] = useState('');
  const [searchError, setSearchError] = useState('');
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [showFullImage, setShowFullImage] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [weatherData, setWeatherData] = useState(null); // To store fetched weather data
    
  // Add useRef for the user profile dropdown
  const userMenuRef = useRef(null);

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem('user')) || {
    name: "John Doe",
    email: "john@example.com",
    avatar: null
  };

  const handleLogout = () => {
    try {
      // Call logout endpoint if needed
      axiosInstance.post('/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      // Redirect to login
      navigate('/login', { replace: true });
    }
  };

  const handleMenuItemClick = async (category, item) => {
    setIsLoading(true); // Start loading
    const routePath = item.toLowerCase().replace(/\s+/g, '-');
    navigate(`/dashboard/${routePath}`);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false); // Stop loading

    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  const toggleCategory = (category) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Show immediate preview using FileReader
        const reader = new FileReader();
        reader.onload = (e) => {
          const previewUrl = e.target.result;
          // Update all image instances immediately with preview
          setProfileImage(previewUrl);
          updateAllImageInstances(previewUrl);
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('profile_image', file);

        const response = await axiosInstance.post('/user/profile/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.status === 'success') {
          const imageUrl = response.data.profile || response.data.image_url;
          
          // Update state and localStorage
          setProfileImage(imageUrl);
          const user = JSON.parse(localStorage.getItem('user')) || {};
          user.avatar = imageUrl;
          localStorage.setItem('user', JSON.stringify(user));
          
          // Update all image instances with the server response URL
          updateAllImageInstances(imageUrl);
          
          // Close modal
          setIsModalOpen(false);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
      }
    }
  };

  // Helper function to update all image instances
  const updateAllImageInstances = (imageUrl) => {
    // Update React state
    setProfileImage(imageUrl);
    
    // Update all image elements
    const allImages = document.querySelectorAll('.user-avatar, .menu-profile-image, .modal-profile-image');
    allImages.forEach(img => {
      img.src = imageUrl;
    });
    
    // Update localStorage
    const user = JSON.parse(localStorage.getItem('user')) || {};
    user.avatar = imageUrl;
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleDeleteImage = async () => {
    try {
      await axiosInstance.delete('/user/profile/image');
      setProfileImage(null);
      const user = JSON.parse(localStorage.getItem('user')) || {};
      user.avatar = null;
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchWeatherData = async (lat, lon, date, cityName = null) => {
    try {
        const response = await axiosInstance.post('/day-data/', {
            lat: lat || null,
            lon: lon || null,
            city_name: cityName || null,
            date
        });
        if (response.data) {
            setWeatherData(response.data); // Store the fetched data
        }
    } catch (error) {
        console.error("Error fetching weather data:", error);
        setError("Error fetching weather data");
    }
  };

  const handleLocationSelect = async (location) => {
    try {
        const response = await axiosInstance.post('/cities/', {
            lat: location.lat,
            lon: location.lon
        });

        if (response.data && response.data.length > 0) {
            const cityData = response.data[0];
            setLocationParams({
                lat: location.lat,
                lon: location.lon
            });
            setCurrentCity(cityData.CITY_NAME);
            setShowMap(false);

            // Fetch weather data for the selected date using city name
            fetchWeatherData(null, null, selectedDate, cityData.CITY_NAME);

            // Broadcast location change
            window.dispatchEvent(new CustomEvent('locationChange', { 
                detail: { lat: location.lat, lon: location.lon }
            }));
        }
    } catch (error) {
        console.error("Error getting city data:", error);
        setError("Error getting location data");
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (locationParams) {
        // Fetch data when date changes using the current city name
        fetchWeatherData(null, null, date, currentCity);
    }
  };

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchLocation.trim()) {
        setSearchError('');
        try {
            const response = await axiosInstance.post('/cities/', {
                city_name: searchLocation.toLowerCase()
            });
            
            if (response.data && response.data.length > 0) {
                const cityData = response.data[0];
                setLocationParams({
                    city_name: cityData.CITY_NAME
                });
                setCurrentCity(cityData.CITY_NAME);
                setSearchLocation('');
                
                // Fetch weather data using city name
                fetchWeatherData(null, null, selectedDate, cityData.CITY_NAME);
                
                // Broadcast location change to child components
                window.dispatchEvent(new CustomEvent('locationChange', { 
                    detail: { city_name: cityData.CITY_NAME }
                }));
            } else {
                setSearchError('City not found');
            }
        } catch (error) {
            console.error("Error searching city:", error);
            setSearchError('Error searching city');
        }
    }
  };

  const userMenuItems = [
    {
      icon: '🏠',
      label: 'Home',
      action: () => {
        navigate('/dashboard')
      }
    },
    {
      icon: '🟢',
      label: 'Live Data',
      action: () => {
        navigate('/weather')
      }
    },
    {
      icon: '🖼️',
      label: 'Change Profile Picture',
      action: () => {
        const fileInput = document.getElementById('profile-picture-input');
        if (fileInput) fileInput.click();
      }
    },
    {
      icon: '⚙️',
      label: 'Settings',
      action: () => console.log('Settings clicked')
    },
    {
      icon: '🚪',
      label: 'Logout',
      action: handleLogout
    }
  ];

  const menuItems = {
    Weather: [
      'Temperature',
      'Rainfall',
    ],
    Energy: [
      'Power Consumption',
      'Energy Efficiency',
    ],
    Environment: [
      'Air Quality',
    ],
    Water: [
      'Water Quality',
      'Water Usage',
    ],
    Atmosphere: [
      'Wind',
      'Solar-UV',
    ]
  };

  // Update renderMenuItems function
  const renderMenuItems = () => {
    // Get user from localStorage to check admin status
    const user = JSON.parse(localStorage.getItem('user')) || {};
    
    return (
      <nav className="menu">
        {Object.entries(menuItems).map(([category, items]) => (
          <div key={category} className="menu-category">
            <div
              className={`category-header ${openCategory === category ? 'open' : ''}`}
              onClick={() => toggleCategory(category)}
            >
              <span>{category}</span>
              <span className="arrow">▼</span>
            </div>
            {openCategory === category && (
              <div className="category-items">
                {items.map((item) => (
                  <div
                    key={item}
                    className="menu-item"
                    style={{color: "white"}}
                    onClick={() => handleMenuItemClick(category, item)}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Show Device Locations only if user is admin */}
        {user.isAdmin && (
          <div 
            className="menu-item device-locations" 
            style={{
              background: "white",
              margin: "10px 0",
              padding: "10px 15px",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
            onClick={() => handleMenuItemClick('', 'device-locations')}
          >
            <span className="menu-item-icon">📍</span>
            Device Locations
          </div>
        )}
      </nav>
    );
  };

  // Update initial sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };

    // Set initial state
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add animation effect for logo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogoIndex((prev) => (prev + 1) % 5);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Add effect for updating time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Add effect for getting initial location and city
  useEffect(() => {
    // Check for auth token and user data when component mounts
    const token = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
      navigate('/login');
      return;
    }

    // Set authorization header for all subsequent requests
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Set initial city if available from user data
    if (user.city) {
      setCurrentCity(user.city);
    }

    // Get user's location if available
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await axiosInstance.post('cities/', {
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });

            if (response.data && response.data.length > 0) {
              setCurrentCity(response.data[0].CITY_NAME);
              setLocationParams({
                lat: position.coords.latitude,
                lon: position.coords.longitude
              });
            }
          } catch (error) {
            console.error("Error fetching city:", error);
            setError("Error getting location data");
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Please enable location services or search for a city");
        }
      );
    }
  }, [navigate]);

  // Add useEffect to initialize profile image from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.avatar) {
      setProfileImage(user.avatar);
      updateAllImageInstances(user.avatar);
    }
  }, []);

  // Update the image click handler to use current image
  const handleImageClick = (e) => {
    e.stopPropagation();
    setShowFullImage(true);
  };

  return (
    <div className="dashboard">
      {/* Mobile Toggle Button - Update position */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isSidebarOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar with overlay for mobile */}
      {(isSidebarOpen || window.innerWidth > 768) && (
        <>
          {/* {window.innerWidth <= 768 && (
            <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
          )} */}
          <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
            <div className="logo">
              <h1 className="weewa-logo">
                <span className={`letter letter-1 ${currentLogoIndex === 0 ? 'active' : ''}`}>W</span>
                <span className={`letter letter-2 ${currentLogoIndex === 1 ? 'active' : ''}`}>E</span>
                <span className={`letter letter-3 ${currentLogoIndex === 2 ? 'active' : ''}`}>E</span>
                <span className={`letter letter-4 ${currentLogoIndex === 3 ? 'active' : ''}`}>W</span>
                <span className={`letter letter-5 ${currentLogoIndex === 4 ? 'active' : ''}`}>A</span>
              </h1>
            </div>

            {renderMenuItems()}

          </div>

        </>
      )}

      {/* Main Content */}
      <div className="main-content">
        <div className="top-bar">
          <div className="top-bar-left">
            <div className="location-controls">
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search for a city..."
                  value={searchLocation}
                  onChange={(e) => {
                    setSearchLocation(e.target.value);
                    setSearchError('');
                  }}
                  onKeyPress={handleSearch}
                  className="search-input"
                />
                {searchError && (
                  <div className="search-error">
                    {searchError}
                  </div>
                )}
              </div>
              <button 
                className="location-button"
                onClick={() => setShowMap(true)}
                title="Select Location"
              >
                <FaMapMarkerAlt />
                {currentCity && (
                  <div className="current-city">
                    {currentCity}
                  </div>
                )}
              </button>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={handleDateChange} 
                className="date-input"
              />
            </div>
          </div>
          <div className="top-bar-right">
            <div className="user-profile" ref={userMenuRef}>
              <img
                src={profileImage || user.avatar || dp}
                alt="User"
                className="user-avatar"
                onClick={handleImageClick}
              />
              <div 
                className="user-info-brief"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
              >
                <span className="user-name">{user.name}</span>
                
              </div>
              <span 
                className={`profile-arrow ${showUserMenu ? 'open' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
              >
                ▼
              </span>

              {showUserMenu && (
                <div className="user-menu">
                  <div className="user-menu-header">
                    <img 
                      src={profileImage || user.avatar || dp} 
                      alt="User" 
                      className="menu-profile-image"
                    />
                    <div className="user-details">
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                  <div className="menu-divider"></div>
                  {userMenuItems.map((item, index) => (
                    <button
                      key={index}
                      className={`menu-item ${item.label.toLowerCase()}`}
                      onClick={item.action}
                    >
                      <span className="menu-item-icon">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="content-area">
          <input
            type="file"
            id="profile-picture-input"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
            accept="image/*"
          />

          {isLoading ? (
            <div className="loading-spinner-container">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <Outlet context={{ weatherData }} />
          )}

          {isModalOpen && (
            <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <span className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</span>
                <div className="modal-image-container">
                  <img
                    src={profileImage || user.avatar || dp}
                    alt="Profile"
                    className="modal-profile-image"
                    onClick={() => setShowFullImage(true)}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                <div className="modal-actions">
                  <input
                    type="file"
                    id="profile-picture-input"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    className="modal-button edit"
                    onClick={() => document.getElementById('profile-picture-input').click()}
                  >
                    Change Image
                  </button>
                </div>
              </div>
            </div>
          )}

          {showMap && (
            <WeatherMap 
              onClose={() => setShowMap(false)}
              onLocationSelect={handleLocationSelect}
              currentLocation={locationParams}
            />
          )}

          {/* Full-size image view */}
          {showFullImage && (
            <div 
              className="full-image-overlay"
              onClick={() => setShowFullImage(false)}
            >
              <div className="full-image-container">
                <img
                  src={profileImage || user.avatar || dp}
                  alt="Profile"
                  className="full-size-image"
                />
                <button 
                  className="close-full-image"
                  onClick={() => setShowFullImage(false)}
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    
      <DashboardContent />
   
  );
};

export default Dashboard;