import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { CommodityData } from '../types/analytics';

interface Props {
    data: CommodityData[];
}

export const CommodityChart: React.FC<Props> = ({ data }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');

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
            toolbox: {
                feature: {
                    saveAsImage: {
                        title: 'Save as Image',
                        name: `Commodity_Analysis_${new Date().toISOString().split('T')[0]}`,
                        pixelRatio: 2
                    }
                },
                right: 20,
                top: 10
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
                    axisLabel: { formatter: '{value} %' },
                    splitLine: { show: false }
                }
            ],
            series: [
                {
                    name: 'Total APV',
                    type: 'bar',
                    data: data.map(item => item.total_apv),
                    itemStyle: { color: '#1A1A1A' }
                },
                {
                    name: 'Covered APV',
                    type: 'bar',
                    data: data.map(item => item.covered_apv),
                    itemStyle: { color: '#595959' }
                },
                {
                    name: 'Gap %',
                    type: 'line',
                    yAxisIndex: 1,
                    data: data.map(item => item.gap_percent),
                    itemStyle: { color: '#E31837' },
                    lineStyle: { width: 3 },
                    symbol: 'circle',
                    symbolSize: 6
                }
            ]
        };

        chart.setOption(option);

        // 添加点击事件，跳转到 Commodity Detail 页面
        chart.on('click', (params: any) => {
            if (params.componentType === 'series' && sessionId) {
                const commodityName = data[params.dataIndex]?.commodity;
                if (commodityName) {
                    navigate(`/commodity/${encodeURIComponent(commodityName)}?session_id=${sessionId}`);
                }
            }
        });

        const handleResize = () => chart.resize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.dispose();
        };
    }, [data, navigate, sessionId]);

    return <div ref={chartRef} style={{ width: '100%', height: 400 }} />;
};
