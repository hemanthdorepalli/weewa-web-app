import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as echarts from 'echarts';
import './Temp.css';

const Temp = ({ weatherData }) => {

    const navigate = useNavigate();

    useEffect(() => {
        const chartDom = document.getElementById('tempChart');
        const myChart = echarts.init(chartDom);

        const option = {
            title: [
                {
                    text: 'Temperature',
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
                left: '5%',
                right: '5%',
                top: '25%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['Outside\nTemp', 'Wind Chill', 'Heat Index', 'Dew Point', 'Wet Bulb'],
                axisLabel: {
                    interval: 0,
                    fontSize: 11,
                    align: 'center'
                },
                axisTick: {
                    alignWithLabel: true
                }
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: 80,
                interval: 50,
                axisLabel: {
                    formatter: '{value}°C',
                    fontSize: 11
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        type: 'dashed'
                    }
                }
            },
            series: [{
                data: [
                    weatherData ? weatherData.temp_out.toFixed(0) : 0, // Outside Temp
                    weatherData ? weatherData.wind_chill.toFixed(0) : 0, // Wind Chill
                    weatherData ? weatherData.heat_index.toFixed(0) : 0, // Heat Index
                    weatherData ? weatherData.dew_pt.toFixed(0) : 0, // Dew Point
                    0 // Wet Bulb (not provided in the data)
                ],
                type: 'bar',
                itemStyle: {
                    color: function(params) {
                        const colors = ['#DC3545', '#4B9CD3', '#F4A460', '#3CB371', '#87CEEB'];
                        return colors[params.dataIndex];
                    }
                },
                barWidth: '60%',
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}',
                    fontSize: 11
                }
            }],
            tooltip: {
                trigger: 'axis',
                formatter: '{b}: {c}°C'
            }
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
                        navigate('/dashboard/temperature');
                    }
                }
            ]
        });

        const handleResize = () => {
            myChart.resize();
        };

        myChart.setOption(option);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            myChart.dispose();
        };
    }, [weatherData]); // Re-run effect when weatherData changes

    return (
        <div className="Temp">
            <div id="tempChart"></div>
        </div>
    );
};

export default Temp;
