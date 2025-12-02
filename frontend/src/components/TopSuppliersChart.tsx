import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface SupplierData {
    supplier: string;
    total_apv: number;
    total_opportunity: number;
    gap_percent: number;
}

interface Props {
    data: SupplierData[];
}

export const TopSuppliersChart: React.FC<Props> = ({ data }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current || !data.length) return;

        const chart = echarts.init(chartRef.current);

        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross' }
            },
            legend: {
                data: ['APV $', 'Opportunity $', 'Gap %'],
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
                data: data.map(item => item.supplier),
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
                    axisLabel: { formatter: '{value} %' },
                    splitLine: { show: false }
                }
            ],
            series: [
                {
                    name: 'APV $',
                    type: 'bar',
                    data: data.map(item => item.total_apv),
                    itemStyle: { color: '#1A1A1A' }
                },
                {
                    name: 'Opportunity $',
                    type: 'bar',
                    data: data.map(item => item.total_opportunity),
                    itemStyle: { color: '#E31837' }
                },
                {
                    name: 'Gap %',
                    type: 'line',
                    yAxisIndex: 1,
                    data: data.map(item => item.gap_percent),
                    itemStyle: { color: '#2196F3' },
                    lineStyle: { width: 3 },
                    symbol: 'circle',
                    symbolSize: 6
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
