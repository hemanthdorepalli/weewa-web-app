import React, { useEffect } from 'react';
import * as echarts from 'echarts';
import './WindDirection.css';

const WindDirection = ({ weatherData }) => {
    useEffect(() => {
        const chartDom = document.getElementById('windDirectionChart');
        const myChart = echarts.init(chartDom);

        // Wind direction mapping to 16 compass points
        const windDirectionMap = {
            N: 0,
            NNW: 22.5,
            NW: 45,
            WNW: 67.5,
            W: 90,
            WSW: 112.5,
            SW: 135,
            SSW: 157.5,
            S: 180,
            SSE: 202.5,
            SE: 225,
            ESE: 247.5,
            E: 270,
            ENE: 292.5,
            NE: 315,
            NNE: 337.5
        };

        // Get wind direction, default to 'N' if undefined
        const windDirection = weatherData?.wind_dir ?? 'N';
        const rotationAngle = windDirectionMap[windDirection] ?? 0; // Convert to degrees

        const option = {
            backgroundColor: '#fff',
            title: [
                {
                    text: 'Wind Direction',
                    top: 5,
                    left: 10,
                    textStyle: {
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#0066cc'
                    }
                },
                {
                    text: 'Weather Station',
                    top: 30,
                    left: 10,
                    textStyle: {
                        fontSize: 12,
                        fontWeight: 'normal',
                        fontStyle: 'italic',
                        color: '#666'
                    }
                }
            ],
            polar: {
                radius: '65%',
                center: ['50%', '60%']
            },
            angleAxis: {
                type: 'category',
                data: ['N', '', 'NE', '', 'E', '', 'SE', '', 'S', '', 'SW', '', 'W', '', 'NW', ''],
                boundaryGap: false,
                startAngle: 90, // Ensures 'N' starts at the top
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#ddd',
                        type: 'solid'
                    },
                    interval: 2 // Show only 8 lines instead of 16
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#ddd'
                    }
                },
                axisLabel: {
                    fontSize: 12,
                    color: '#666',
                    margin: 5
                }
            },
            radiusAxis: {
                type: 'value',
                show: false,
                min: 0,
                max: 1
            },
            graphic: [
                {
                    type: 'group',
                    rotation: (rotationAngle * Math.PI) / 180, // Convert degrees to radians
                    bounding: 'raw',
                    left: '50%',
                    top: '60%',
                    origin: [0, 0],
                    children: [
                        {
                            type: 'polygon',
                            shape: {
                                points: [
                                    [0, -70],  // tip
                                    [-15, -20], // left corner
                                    [15, -20]   // right corner
                                ]
                            },
                            style: {
                                fill: '#2196F3'
                            }
                        }
                    ]
                }
            ],
            series: [
                {
                    name: 'Border',
                    type: 'pie',
                    center: ['50%'],
                    data: [1],
                    label: {
                        show: false
                    },
                    itemStyle: {
                        color: '#ddd'
                    }
                }
            ]
        };

        myChart.setOption(option);

        const handleResize = () => {
            myChart.resize();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            myChart.dispose();
        };
    }, [weatherData]); // Updates when weatherData changes

    return (
        <div className="wind-direction">
            <div id="windDirectionChart" style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
};

export default WindDirection;
