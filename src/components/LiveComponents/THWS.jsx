import React, { useEffect } from 'react';
import * as echarts from 'echarts';
import { useNavigate } from 'react-router-dom';
import './Gauge.css';

const THWS = ({ weatherData }) => {
    const navigate = useNavigate();
    useEffect(() => {
        const chartDom = document.getElementById('THWSChart');
        const myChart = echarts.init(chartDom);

        const updateChart = () => {
            const thwsValue = Math.round(weatherData?.thsw_index ?? 0); // Round value to avoid decimals

            const option = {
                title: [
                    {
                        text: 'THWS Index',
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
                    max: 50,
                    splitNumber: 5,
                    radius: '70%',
                    center: ['50%', '75%'],
                    progress: {
                        show: true,
                        width: 30,
                        itemStyle: {
                            color: '#03fc73'
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
                        formatter: '{value}°C',
                        color: 'inherit'
                    },
                    data: [{ value: thwsValue }]
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
                            navigate('/dashboard/temperature');
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
            <div id="THWSChart" style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
};

export default THWS;
