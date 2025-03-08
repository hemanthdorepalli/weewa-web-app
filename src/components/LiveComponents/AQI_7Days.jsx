import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const AQI_7Days = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      // Initialize chart
      chartInstance.current = echarts.init(chartRef.current);

      const option = {
        title: {
          text: '7 Day Air Quality Index',
          subtext: 'AirLink-Air Quality',
          left: 10,
          top: 2,
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#0066cc'
          },
          subtextStyle: {
            fontSize: 12,
            color: '#666'
          }
        },
        
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c}',
          axisPointer: {
            type: 'line'
          }
        },
        grid: {
          left: '8%',
          right: '4%',
          top: '20%',
          bottom: '12%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['01/30', '01/31', '02/01', '02/02', '02/03', '02/04', '02/05'],
          axisLabel: {
            fontSize: 11
          }
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 80,
          interval: 8,
          axisLabel: {
            fontSize: 11
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
              color: '#ddd'
            }
          }
        },
        series: [{
          type: 'line',
          data: [24, 56, 72, 32, 8, 8, 24],
          smooth: true,
          symbol: 'none',
          lineStyle: {
            color: '#005b96',
            width: 2
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
                color: 'rgba(0, 91, 150, 0.3)'
              }, {
                offset: 1,
                color: 'rgba(0, 91, 150, 0.1)'
              }]
            }
          }
        }]
      };

      chartInstance.current.setOption(option);

      // Handle resize
      const handleResize = () => {
        if (chartInstance.current) {
          chartInstance.current.resize();
        }
      };

      window.addEventListener('resize', handleResize);

      // Force initial resize
      handleResize();

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartInstance.current) {
          chartInstance.current.dispose();
        }
      };
    }
  }, []);

  return (
    <div className="extra-card-wide-remain" style={{ background: 'white' }}>
      <div 
        ref={chartRef} 
        style={{ 
          width: '100%', 
          height: '247.5px',
          maxWidth: '1050px'
        }} 
      />
    </div>
  );
};

export default AQI_7Days;