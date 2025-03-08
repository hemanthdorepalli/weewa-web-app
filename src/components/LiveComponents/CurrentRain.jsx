import React, { useEffect } from 'react';
import * as echarts from 'echarts';
import { useNavigate } from 'react-router-dom';
import './Temp.css';

const CurrentRain = ({ weatherData }) => { 
    const navigate = useNavigate();
    useEffect(() => {
        if (!weatherData) return;

        const chartDom = document.getElementById('rainChart');
        if (!chartDom) return;
        
        const myChart = echarts.init(chartDom);

        const updateChart = () => {
            // Extract rainfall values from WeatherData
            const rainDay = weatherData.rain.toFixed(2) || 0.00; // Rainfall for the day
            const rainStorm = weatherData.rain_storm || 0.00; // Rainfall for storm event
            const rainRate = weatherData.rain_rate.toFixed(2) || 0.00; // Current rainfall rate

            const option = {
                title: [
                    {
                        text: 'Current Rain',
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
                grid: {
                    left: '10%',
                    right: '10%',
                    top: '25%',
                    bottom: '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: ['Day', 'Storm', 'Rate'],
                    axisLabel: {
                        interval: 0,
                        fontSize: 11
                    }
                },
                yAxis: [
                    {
                        type: 'value',
                        min: 0,
                        max: 3,
                        interval: 1,
                        position: 'left',
                        axisLabel: {
                            formatter: '{value} mm',
                            fontSize: 11
                        },
                        splitLine: {
                            show: true,
                            lineStyle: {
                                type: 'dashed'
                            }
                        }
                    },
                    {
                        type: 'value',
                        min: 0,
                        max: 0.20,
                        interval: 0.10,
                        position: 'right',
                        axisLabel: {
                            formatter: '{value} mm/hr',
                            fontSize: 11
                        },
                        splitLine: {
                            show: false
                        }
                    }
                ],
                series: [
                    {
                        name: 'Rainfall',
                        data: [rainDay, rainStorm, rainRate],
                        type: 'bar',
                        itemStyle: {
                            color: '#4B9CD3'
                        },
                        barWidth: '40%',
                        label: {
                            show: true,
                            position: 'top',
                            formatter: '{c} mm',
                            fontSize: 11
                        }
                    }
                ],
                tooltip: {
                    trigger: 'axis',
                    formatter: function(params) {
                        return `${params[0].name}: ${params[0].value} mm`;
                    }
                }
            };

            myChart.setOption(option);
        };
      // Footer text elements - Changed to "View History" link
      myChart.setOption({
        graphic: [
            {
                type: 'text',
                left: '4%',
                bottom: '5%',
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
                    navigate('/dashboard/rainfall');
                }
            }
        ]
    });
        updateChart(); // Initial chart update

        const handleResize = () => {
            myChart.resize();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            myChart.dispose();
        };
    }, [weatherData]); // Runs when WeatherData changes

    return (
        <div className="Temp">
            <div id="rainChart" style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
};

export default CurrentRain;
