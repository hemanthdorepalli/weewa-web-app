import React, { useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { useNavigate } from 'react-router-dom';

const WindRose = ({ weatherData }) => {
    const navigate = useNavigate();
    const [windData, setWindData] = useState({
        directions: [],
        speedRanges: [],
        values: {},
    });

    useEffect(() => {
        if (!weatherData || !weatherData.wind_dir_distribution) return;

        const allDirections = [
            "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
            "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"
        ];

        // Filter out "---" (calm wind)
        const existingDirectionObjects = weatherData.wind_dir_distribution.filter(item => Object.keys(item)[0] !== "---");

        if (existingDirectionObjects.length === 0) return; // Ensure there's valid data

        const firstDirKey = Object.keys(existingDirectionObjects[0])[0];
        const speedRanges = Object.keys(existingDirectionObjects[0][firstDirKey]);

        const directionDataMap = {};
        existingDirectionObjects.forEach(item => {
            const dirKey = Object.keys(item)[0];
            directionDataMap[dirKey] = item[dirKey];
        });

        const values = {};
        speedRanges.forEach(range => {
            values[range] = allDirections.map(dir => {
                return directionDataMap[dir] ? parseInt(directionDataMap[dir][range] || 0) : 0;
            });
        });

        setWindData({
            directions: allDirections,
            speedRanges,
            values,
        });
    }, [weatherData]);

    useEffect(() => {
        if (windData.directions.length === 0) return;

        const chartDom = document.getElementById('windRoseChart');
        if (!chartDom) return;
        
        const myChart = echarts.init(chartDom);

        const series = windData.speedRanges.map((range) => {
            const colorMap = {
                "0-4.9kmph": "#10b981",
                "5-6.9kmph": "#60a5fa",
                "7-9.9kmph": "#3b82f6",
                "10-14.99kmph": "#f97316",
                "15-19.99kmph": "#fb923c",
                "20+kmph": "#ef4444"
            };

            return {
                name: range,
                type: 'bar',
                coordinateSystem: 'polar',
                stack: 'wind',
                data: windData.values[range],
                itemStyle: {
                    color: colorMap[range] || "#9ca3af"
                }
            };
        });

        series.reverse();

        const option = {
            title: [
                {
                    text: 'Wind Rose',
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
                radius: ['8%', '70%'],
                center: ['50%', '52%']
            },
            radiusAxis: {
                type: 'value',
                max: Math.max(...Object.values(windData.values).flatMap(arr => arr)) * 1.2,
                axisLine: { show: false },
                axisLabel: { show: false },
                splitLine: {
                    lineStyle: {
                        color: '#e2e8f0',
                        type: 'dashed',
                        width: 0.5
                    }
                }
            },
            angleAxis: {
                type: 'category',
                data: windData.directions,
                clockwise: true,
                startAngle: 90,
                boundaryGap: false,
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#e2e8f0',
                        width: 0.5
                    }
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#cbd5e1',
                        width: 0.5
                    }
                },
                axisLabel: {
                    fontSize: 10,
                    padding: 3,
                    color: '#64748b'
                }
            },
            series: series,
            legend: {
                data: windData.speedRanges,
                bottom: 10,
                left: 'center',
                icon: 'roundRect',
                itemWidth: 24,
                itemHeight: 8,
                itemGap: 8,
                textStyle: {
                    fontSize: 9,
                    color: '#64748b'
                },
                pageTextStyle: {
                    color: '#64748b'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                textStyle: {
                    color: '#334155',
                    fontSize: 11
                },
                formatter: function (params) {
                    let total = 0;
                    let result = `<div style="font-weight: 500">${params[0].axisValue}</div>`;
                    params.forEach(param => {
                        if (param.value > 0) {
                            result += `<div style="display: flex; justify-content: space-between; margin: 4px 0;">
                                <span>${param.seriesName}:</span>
                                <span style="margin-left: 12px">${param.value}%</span>
                            </div>`;
                            total += param.value;
                        }
                    });
                    result += `<div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #e2e8f0;">
                        <strong>Total: ${total}%</strong>
                    </div>`;
                    return result;
                }
            }
        };

         // Footer text elements - Changed to "View History" link
      myChart.setOption({
        graphic: [
            {
                type: 'text',
                right: '4%',
                bottom: '2%',
                style: {
                    text: 'View History',
                    textAlign: 'right',
                    fill: '#0066cc', // Blue color for a link effect
                    fontSize: 10,
                    // fontWeight: 'bold',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                },
                onclick: function () {
                    navigate('/dashboard/wind');
                }
            }
        ]
    });
        const handleResize = () => {
            myChart.resize();
        };

        myChart.setOption(option);
        window.addEventListener('resize', handleResize);

        myChart.resize();

        return () => {
            window.removeEventListener('resize', handleResize);
            myChart.dispose();
        };
    }, [windData]);

    return (
        <div className="wind-rose-section">
            <div className="wind-rose-card p-0 bg-white rounded-lg shadow-md" style={{ width: '100%', height: '500px' }}>
                <div id="windRoseChart" style={{ width: '100%', height: '100%', padding: 0 }}></div>
            </div>
        </div>
    );
};

export default WindRose;
