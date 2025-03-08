import React, { useEffect } from 'react';
import * as echarts from 'echarts';
import './Temp.css';

const AQI = () => {
    useEffect(() => {
        const chartDom = document.getElementById('aqiChart');
        const myChart = echarts.init(chartDom);

        const option = {
            title: [
                {
                    text: 'Air Quality Index',
                    top: 5,
                    left: 10,
                    textStyle: {
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#0066cc'
                    }
                },
                {
                    text: 'AirLink-Air Quality',
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
                data: ['10 PM', '11 PM', '12 PM', '1 AM', '2 AM', '3 AM'],
                boundaryGap: false,
                axisLabel: {
                    fontSize: 11
                }
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: 2,
                interval: 1,
                axisLabel: {
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
                data: [0, 0, 1, 0, 1, 1, 0, 1],
                type: 'line',
                smooth: false,
                symbol: 'none',
                lineStyle: {
                    color: 'black',
                    width: 2
                }
            }],
            tooltip: {
                trigger: 'axis'
            }
        };

        // Footer text elements
        myChart.setOption({
            graphic: [
                {
                    type: 'text',
                    right: '10%',
                    bottom: '5%',
                    style: {
                        text: 'Based on PM 2.5 calculations only',
                        textAlign: 'right',
                        fill: '#666',
                        fontSize: 11,
                        fontStyle: 'italic'
                    }
                }
            ]
        });

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
        <div className="Temp">
            <div id="aqiChart" style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
};

export default AQI;