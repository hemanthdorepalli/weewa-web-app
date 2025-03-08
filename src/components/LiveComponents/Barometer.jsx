import React, { useEffect } from 'react';
import * as echarts from 'echarts';
import './Temp.css';

const Barometer = () => {
    useEffect(() => {
        const chartDom = document.getElementById('barometerChart');
        const myChart = echarts.init(chartDom);

        const option = {
            title: [
                {
                    text: 'Barometer',
                    top: 5,
                    left: 10,
                    textStyle: {
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#0066cc'
                    }
                },
                {
                    text: 'Gateway',
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
                right: '5%',
                top: '25%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: ['9 PM', '10 PM', '11 PM', '5 Feb', '1 AM', '2 AM'],
                axisLabel: {
                    fontSize: 11,
                    interval: 0
                }
            },
            yAxis: {
                type: 'value',
                min: 29.90,
                max: 30.20,
                interval: 0.10,
                axisLabel: {
                    formatter: '{value} in Hg',
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
                data: [29.92, 29.98, 30.02, 30.06, 30.12, 30.15],
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: {
                    color: '#333'
                },
                lineStyle: {
                    width: 2,
                    color: '#333'
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0,
                            color: 'rgba(51, 51, 51, 0.2)'
                        }, {
                            offset: 1,
                            color: 'rgba(51, 51, 51, 0)'
                        }]
                    }
                }
            }],
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    return `${params[0].name}: ${params[0].value} in Hg`;
                }
            }
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
        <div className="Temp">
            <div id="barometerChart" style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
};

export default Barometer;