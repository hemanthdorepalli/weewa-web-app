import React, { useEffect } from 'react';
import * as echarts from 'echarts';
import './CurrentAQI.css';

const CurrentAQI = () => {
    useEffect(() => {
        const chartDom = document.getElementById('AQIChart');
        const myChart = echarts.init(chartDom);

        const option = {
            title: [
                {
                    text: 'Current AQI',
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
                max: 100,
                splitNumber: 5,
                radius: '70%',
                center: ['50%', '75%'],
                progress: {
                    show: true,
                    // roundCap: true,
                    width: 30,
                    itemStyle: {
                        color: '#4CAF50'
                    }
                },
                pointer: {
                    show: false
                },
                axisLine: {
                    // roundCap: true,
                    lineStyle: {
                        width: 30,
                        color: [
                            [1, '#E0E0E0']
                        ]
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
                    fontSize: 30,
                    fontWeight: 'normal',
                    formatter: '{value}%',
                    color: 'inherit'
                },
                data: [{
                    value: 45
                }]
            }],
            media: [{
                query: {
                    maxWidth: 768
                },
                option: {
                    series: [{
                        center: ['50%', '70%'],
                        radius: '65%',
                        detail: {
                            fontSize: 24,
                            offsetCenter: [0, '0%']
                        }
                    }],
                    title: [{
                        top: 5,
                        left: 10
                    }, {
                        top: 25,
                        left: 10
                    }]
                }
            }]
        };

        const handleResize = () => {
            myChart.resize();
        };

        myChart.setOption(option);
        window.addEventListener('resize', handleResize);

        // Initial resize to fit container
        myChart.resize();

        return () => {
            window.removeEventListener('resize', handleResize);
            myChart.dispose();
        };
    }, []);

    return (
        <div className="gauge">
            <div id="AQIChart" style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
};

export default CurrentAQI;