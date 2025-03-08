import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import Landing from '../components/Landing';
import Login from '../components/Login';

import withAuth from '../components/hoc/withAuth';

// Weather Components
import Temperature from '../components/Weather/Temperature';
import Rainfall from '../components/Weather/Rainfall';

// Energy Components
import PowerConsumption from '../components/Energy/PowerConsumption';
import EnergyEfficiency from '../components/Energy/EnergyEfficiency';

// Environment Components
import AirQuality from '../components/Environment/AirQuality';

// Water Components
import WaterQuality from '../components/Water/WaterQuality';
import WaterUsage from '../components/Water/WaterUsage';

// Atmosphere Components
import Wind from '../components/Atmosphere/Wind';
import SolarUV from '../components/Atmosphere/SolarUV';


import LiveData from '../components/LiveData';
import DeviceLocations from '../components/Map/DeviceLocations';

// Wrap components that need authentication
const ProtectedTemperature = withAuth(Temperature);
const ProtectedRainfall = withAuth(Rainfall);
const ProtectedSolarUV = withAuth(SolarUV);
const ProtectedWind = withAuth(Wind);

// Protect Landing component
const ProtectedLanding = withAuth(Landing);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Landing page route */}
      <Route path="/weather" element={<ProtectedLanding />} />
      
      {/* Dashboard routes */}
      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<LiveData />} />
        {/* Weather Routes */}
        <Route path="temperature" element={<ProtectedTemperature />} />
        <Route path="rainfall" element={<ProtectedRainfall />} />
        
        {/* Energy Routes */}
        <Route path="power-consumption" element={<PowerConsumption />} />
        <Route path="energy-efficiency" element={<EnergyEfficiency />} />
        
        {/* Environment Routes */}
        <Route path="air-quality" element={<AirQuality />} />
        
        {/* Water Routes */}
        <Route path="water-quality" element={<WaterQuality />} />
        <Route path="water-usage" element={<WaterUsage />} />
        
        {/* Atmosphere Routes */}
        <Route path="wind" element={<ProtectedWind />} />
        <Route path="solar-uv" element={<ProtectedSolarUV />} />

        {/* Add Device Locations route */}
        <Route path="device-locations" element={<DeviceLocations />} />
      </Route>

      {/* Update default redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes; 