import React, { useEffect } from 'react';
import * as echarts from 'echarts';
import './ET.css';

const ET = () => {
    useEffect(() => {
        const chartDom = document.getElementById('etChart');
        const myChart = echarts.init(chartDom);

        const option = {
            title: [
                {
                    text: 'ET',
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
                left: '15%',
                right: '15%',
                top: '25%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['day', 'month', 'year'],
                axisLabel: {
                    interval: 0,
                    fontSize: 11
                }
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: 3,
                interval: 1,
                axisLabel: {
                    formatter: '{value} in',
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
                    {value: 0.00, itemStyle: {color: '#4B9CD3'}},
                    {value: 0.16, itemStyle: {color: '#4B9CD3'}},
                    {value: 2.21, itemStyle: {color: '#4B9CD3'}}
                ],
                type: 'bar',
                barWidth: '40%',
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}',
                    fontSize: 11
                }
            }],
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    return `${params[0].name}: ${params[0].value} in`;
                }
            },
            media: [{
                query: {
                    maxWidth: 768
                },
                option: {
                    grid: {
                        left: '10%',
                        right: '10%',
                        top: '25%',
                        bottom: '15%'
                    },
                    title: [{
                        top: 0
                    }, {
                        top: 20
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
        <div className="extra-card">
            <div id="etChart" style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
};

export default ET;