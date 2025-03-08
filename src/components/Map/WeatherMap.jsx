import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './WeatherMap.css';

const locationIcon = L.divIcon({
  className: 'custom-location-marker',
  html: `
    <div class="marker-pin">
      <div class="marker-pin-inner"></div>
      <div class="marker-pin-pulse"></div>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

// Component to update map view when position changes
function ChangeView({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  
  return null;
}

const WeatherMap = ({ onClose }) => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPosition = [pos.coords.latitude, pos.coords.longitude];
          setCurrentPosition(newPosition);
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
  }, []);

  if (loading) {
    return (
      <div className="map-overlay">
        <div className="map-modal">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Getting your location...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentPosition) {
    return (
      <div className="map-overlay">
        <div className="map-modal">
          <button className="close-map-btn" onClick={onClose}>×</button>
          <div className="error-container">
            <p>{error || "Unable to determine your location."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-overlay">
      <div className="map-modal">
        <button className="close-map-btn" onClick={onClose}>×</button>
        <MapContainer
          center={currentPosition}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <ChangeView center={currentPosition} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker 
            position={currentPosition}
            icon={locationIcon}
          >
            <Popup>
              <div className="location-popup">
                <h6>Your Current Location</h6>
                <p>Latitude: {currentPosition[0].toFixed(4)}</p>
                <p>Longitude: {currentPosition[1].toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default WeatherMap;