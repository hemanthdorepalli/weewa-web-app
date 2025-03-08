import React, { useEffect } from 'react';
import * as echarts from 'echarts';
import './PM.css';

const PM = () => {
  useEffect(() => {
    const chartDom = document.getElementById('pmChart');
    const myChart = echarts.init(chartDom);

    const option = {
      title: [
        {
          text: 'Particulate Matter',
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
        left: '15%',
        right: '15%',
        top: '25%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['PM 2.5', 'PM 10'],
        axisLabel: {
          interval: 0,
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 2,
        interval: 1,
        axisLabel: {
          formatter: '{value} μg/m³',
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
          {value: 0, itemStyle: {color: '#4B9CD3'}},
          {value: 1, itemStyle: {color: '#4B9CD3'}}
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
          return `${params[0].name}: ${params[0].value} μg/m³`;
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
            top: 5,
            left: 10
          }, {
            top: 25,
            left: 10
          }],
          yAxis: {
            axisLabel: {
              fontSize: 10
            }
          },
          xAxis: {
            axisLabel: {
              fontSize: 10
            }
          }
        }
      }]
    };

    const handleResize = () => {
      myChart.resize();
    };

    myChart.setOption(option);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      myChart.dispose();
    };
  }, []);

  return (
    <div className="extra-card">
      <div id="pmChart" style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default PM;