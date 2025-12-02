import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { CommodityData } from '../types/analytics';

interface Props {
    data: CommodityData[];
}

export const CommodityChart: React.FC<Props> = ({ data }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current || !data.length) return;

        const chart = echarts.init(chartRef.current);

        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            legend: {
                data: ['Total APV', 'Covered APV', 'Gap %'],
                bottom: 0
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: data.map(item => item.commodity),
                axisLabel: { interval: 0, rotate: 30 }
            },
            yAxis: [
                {
                    type: 'value',
                    name: 'Amount ($)',
                    axisLabel: {
                        formatter: (value: number) => {
                            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                            if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
                            return value;
                        }
                    }
                },
                {
                    type: 'value',
                    name: 'Gap %',
                    min: 0,
                    max: 100,
                    axisLabel: { formatter: '{value} %' }
                }
            ],
            series: [
                {
                    name: 'Total APV',
                    type: 'bar',
                    data: data.map(item => item.total_apv),
                    itemStyle: { color: '#2D2D2D' }
                },
                {
                    name: 'Covered APV',
                    type: 'bar',
                    data: data.map(item => item.covered_apv),
                    itemStyle: { color: '#9E9E9E' } // 灰色表示已覆盖
                },
                {
                    name: 'Gap %',
                    type: 'line',
                    yAxisIndex: 1,
                    data: data.map(item => item.gap_percent),
                    itemStyle: { color: '#E31837' },
                    lineStyle: { width: 3 }
                }
            ]
        };

        chart.setOption(option);

        const handleResize = () => chart.resize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.dispose();
        };
    }, [data]);

    return <div ref={chartRef} style={{ width: '100%', height: 400 }} />;
};
