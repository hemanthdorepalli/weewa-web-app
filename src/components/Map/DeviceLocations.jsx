import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './DeviceLocations.css';

import pic067 from '../../assets/Devices/pic067.jpg';
import pic163 from '../../assets/Devices/pic163.jpg';
import pic207 from '../../assets/Devices/pic207.jpg';
import pic303 from '../../assets/Devices/pic303.jpg';
import pic323 from '../../assets/Devices/pic323.png';
import pic396 from '../../assets/Devices/pic396.jpg';
import pic439 from '../../assets/Devices/pic439.jpg';
import pic517 from '../../assets/Devices/pic517.jpg';
import pic518 from '../../assets/Devices/pic518.jpg';
import pic529 from '../../assets/Devices/pic529.jpg';
import pic685 from '../../assets/Devices/pic685.jpg';
import pic715 from '../../assets/Devices/pic715.jpg';
import pic936 from '../../assets/Devices/pic936.jpg';
import pic986 from '../../assets/Devices/pic986.jpg';

const DeviceLocations = () => {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  // Device locations with detailed information
  const deviceLocations = [
    {
      id: 1,
      name: "LoRaWAN Power Meter 1",
      coords: [13.559685, 80.023104],
      location: "Station-S Everest Room EB Panel Room",
      description: "NILGRIS STUDIO ROOM POWER",
      type: "power-meter",
      deviceType: "LoRaWAN Three Phase CT Energy Meter Without Relay",
      image: pic685
    },
    {
      id: 2,
      name: "Water Meter 1",
      coords: [13.5555163, 80.02614],
      location: "IIIT Campus Sump Room",
      description: "Water Metering Solution",
      type: "water-meter",
      deviceType: "Water Metering Solution",
      image: pic163
    },
    {
      id: 3,
      name: "LoRaWAN Power Meter 2",
      coords: [13.555518, 80.026986],
      location: "IIIT Ground Floor G08 Classroom",
      description: "RAW POWER",
      type: "power-meter",
      deviceType: "LoRaWAN Three Phase CT Energy Meter Without Relay",
      image: pic518
    },
    {
      id: 4,
      name: "Cellular Power Meter",
      coords: [13.555517, 80.027002],
      location: "IIIT Ground Floor G08 Classroom",
      description: "RAW POWER",
      type: "power-meter",
      deviceType: "Cellular Three Phase CT Energy Meter Without Relay",
      image: pic517
    },
    {
      id: 5,
      name: "LoRaWAN Gateway",
      coords: [13.555303, 80.026502],
      location: "IIIT Campus Main Building Terrace",
      description: "Main Gateway",
      type: "gateway",
      deviceType: "LoRaWAN Gateway",
      image: pic303
    },
    {
      id: 6,
      name: "Hybrid Power Meter",
      coords: [13.555529, 80.027023],
      location: "IIIT Campus Cabin Wing DB Panel Room",
      description: "UPS POWER",
      type: "power-meter",
      deviceType: "LoRaWAN and Cellular Three Phase CT Energy Meter Without Relay",
      image: pic529
    },
    {
      id: 7,
      name: "Cellular UPS Power Meter",
      coords: [13.559715, 80.023118],
      location: "Station-S Everest Room EB Panel Room",
      description: "UPS POWER ROOM",
      type: "power-meter",
      deviceType: "Cellular Three Phase CT Energy Meter Without Relay",
      image: pic715
    },
    {
      id: 8,
      name: "Mango Resort Level Sensor",
      coords: [13.521207, 80.009483],
      location: "Mango Resort Check Dam",
      description: "Water Level Monitoring",
      type: "ultrasonic-sensor",
      deviceType: "Channel Ultrasonic Level Sensor",
      image: pic207
    },
    {
      id: 9,
      name: "Business Centre Level Sensor",
      coords: [13.522936, 79.99203],
      location: "Business Centre Check Dam",
      description: "Water Level Monitoring",
      type: "ultrasonic-sensor",
      deviceType: "Channel Ultrasonic Level Sensor",
      image: pic936
    },
    {
      id: 10,
      name: "Station-S Level Sensor",
      coords: [13.56067, 80.021657],
      location: "Check Dam Opp. to Station-S",
      description: "Water Level Monitoring",
      type: "ultrasonic-sensor",
      deviceType: "Channel Ultrasonic Level Sensor",
      image: pic067
    },
    {
      id: 11,
      name: "Station-S Water Meter",
      coords: [13.560396, 80.023174],
      location: "Station-S Inlet after Sri City Water Meter",
      description: "Water Flow Monitoring",
      type: "water-meter",
      deviceType: "Water Metering Solution",
      image: pic396
    },
    {
      id: 12,
      name: "Station-S Main Power Meter",
      coords: [13.559986, 80.022875],
      location: "Station-S Main EB Room",
      description: "FIRST FLOOR and GROUND FLOOR",
      type: "power-meter",
      deviceType: "LoRaWAN and Cellular Three Phase CT Energy Meter Without Relay",
      image: pic986
    },
    {
      id: 13,
      name: "IIIT Pond Level Sensor",
      coords: [13.555323, 80.026530],
      location: "Pond Setup backside IIIT Building",
      description: "Water Level Monitoring",
      type: "ultrasonic-sensor",
      deviceType: "Channel Ultrasonic Level Sensor",
      image: pic323    
    },
    {
      id: 14,
      name: "Water Quality Sensors",
      coords: [13.555439, 80.026792],
      location: "IIIT Campus terrace Pantry Pipeline",
      description: "Water Quality Monitoring",
      type: "water-sensor",
      deviceType: "Water PH, Dissolved Oxygen, and Turbidity Sensors",
      image: pic439
    }
  ];

  const createDeviceIcon = (type, isSelected) => {
    return L.divIcon({
      className: `custom-location-marker ${type} ${isSelected ? 'pulse' : ''}`,
      html: `
        <div class="marker-pin">
          <div class="marker-pin-inner"></div>
          ${isSelected ? '<div class="marker-pin-pulse"></div>' : ''}
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    });
  };

  const centerCoords = [13.555517, 80.023104];

  const handleDeviceClick = (device) => {
    setSelectedDevice(device);
    setSelectedDeviceId(device.id);
  };
  const closeDetailsPanel = () => {
    setSelectedDevice(null);
  };

  // SVG for empty state
  const mapPinSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#6c757d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  `;

  return (
    <div className="device-locations-container" style={{ height: '100%', width: '100%' }}>
      {/* Main layout wrapper */}
      <div className="map-details-container">
        {/* Map Section (70%) */}
        <div className="map-container">
          <MapContainer center={centerCoords} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {deviceLocations.map((device) => (
              <Marker
                key={device.id}
                position={device.coords}
                icon={createDeviceIcon(device.type, selectedDeviceId === device.id)}
                eventHandlers={{
                  click: () => handleDeviceClick(device)
                }}
              />
            ))}
          </MapContainer>
        </div>

        {/* Details Panel (30%) */}
        <div className="device-details-panel active">
        <button className="close-button" onClick={closeDetailsPanel}>&times;</button>
          {selectedDevice ? (
            <div className="device-details">
              <h3>{selectedDevice.name}</h3>
              <p><strong>Location:</strong> {selectedDevice.location}</p>
              <p><strong>Description:</strong> {selectedDevice.description}</p>
              <p><strong>Device Type:</strong> {selectedDevice.deviceType}</p>
              <img
                src={selectedDevice.image}
                alt={selectedDevice.name}
                className="device-image"
                onError={(e) => e.target.src = '/images/default-device.jpg'}
              />
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon" dangerouslySetInnerHTML={{ __html: mapPinSvg }}></div>
              <p className="empty-state-text">Click on a Point to see Device Details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceLocations;