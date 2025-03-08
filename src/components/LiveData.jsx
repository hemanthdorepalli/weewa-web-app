import React from 'react';
import './LiveData.css';
import Temp from './LiveComponents/Temp';
import CurrentRain from './LiveComponents/CurrentRain';
import AQI from './LiveComponents/AQI';
import Humidity from './LiveComponents/Humidity';
import WindDirection from './LiveComponents/WindDirection';
import Solar from './LiveComponents/Solar';
import THWS from './LiveComponents/THWS';
import Barometer from './LiveComponents/Barometer';
import UV from './LiveComponents/UV';
import ET from './LiveComponents/ET';
import WindRose from './LiveComponents/WindRose';
import LocalForecast from './LiveComponents/LocalForecast';
import PM from './LiveComponents/PM';
import CurrentAQI from './LiveComponents/CurrentAQI';
import AQI_7Days from './LiveComponents/AQI_7Days';
import { useOutletContext } from 'react-router-dom';

const LiveData = () => {
    const { weatherData } = useOutletContext(); // Get weatherData from context

    return (
        <div className="live-data-container">
            {/* Top row with 3 cards */}
            <div className="top-row">
                <div className="card1">
                    <Temp weatherData={weatherData} /> {/* Pass weatherData to Temp */}
                </div>
                <div className="card1">
                    <CurrentRain weatherData={ weatherData }/>
                </div>
                <div className="card1">
                    <AQI />
                </div>
            </div>

            {/* Bottom row with 5 cards */}
            <div className="bottom-row">
                <div className="card2">
                    <Humidity weatherData={ weatherData } />
                </div>
                <div className="card2">
                    <WindDirection  weatherData={ weatherData }/>
                </div>
                <div className="card2">
                    <Solar weatherData={ weatherData }/>
                </div>
                <div className="card2">
                    <THWS weatherData={ weatherData }/>
                </div>
                <div className="card3">
                    <Barometer />
                </div>
            </div>

            {/* Extra rows */}
            <div className="extra-rows">
                <div className="wind-rose-section">
                    <div className="wind-rose-card">
                        <WindRose weatherData={ weatherData } />
                    </div>
                </div>
                <div className="right-section">
                    <div className="top-extra-row">
                        <div className="extra-card">
                            <ET />
                        </div>
                        <div className="extra-card">
                            <UV weatherData={ weatherData }/>
                        </div>
                        <div className="extra-card-remain">
                            <LocalForecast />
                        </div>
                    </div>
                    <div className="bottom-extra-row">
                        <div className="extra-card-wide">
                            <CurrentAQI />
                        </div>
                        <div className="extra-card-wide">
                            <PM />
                        </div>
                        <div className="extra-card-wide-remain">
                            <AQI_7Days />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveData;