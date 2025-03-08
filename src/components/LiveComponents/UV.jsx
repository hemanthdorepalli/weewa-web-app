import React, { useEffect } from 'react';
import * as echarts from 'echarts';
import { useNavigate } from 'react-router-dom';
import './Gauge.css';

const UV = ({ weatherData }) => {
    const navigate = useNavigate();
    useEffect(() => {
        const chartDom = document.getElementById('UVChart');
        const myChart = echarts.init(chartDom);

        const updateChart = () => {
            const uvValue = Math.round(weatherData?.uv_index ?? 0); // Round to nearest integer

            const option = {
                title: [
                    {
                        text: 'UV Index',
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
                series: [{
                    type: 'gauge',
                    startAngle: 180,
                    endAngle: 0,
                    min: 0,
                    max: 12, // UV index typically ranges from 0 to 11+ (extreme)
                    splitNumber: 6,
                    radius: '70%',
                    center: ['50%', '75%'],
                    progress: {
                        show: true,
                        width: 30,
                        itemStyle: {
                            color: '#4CAF50'
                        }
                    },
                    pointer: {
                        show: false
                    },
                    axisLine: {
                        lineStyle: {
                            width: 30,
                            color: [[1, '#E0E0E0']]
                        }
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    },
                    axisLabel: {
                        show: false
                    },
                    detail: {
                        valueAnimation: true,
                        offsetCenter: [0, '0%'],
                        fontSize: 20,
                        fontWeight: 'normal',
                        formatter: '{value}',
                        color: 'inherit'
                    },
                    data: [{ value: uvValue }]
                }]
            };

            myChart.setOption(option);
        };

        updateChart();

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
                            navigate('/dashboard/solar-uv');
                        }
                    }
                ]
            });
        const handleResize = () => {
            myChart.resize();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            myChart.dispose();
        };
    }, [weatherData]); // Depend on weatherData to update dynamically

    return (
        <div className="gauge">
            <div id="UVChart" style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
};

export default UV;
