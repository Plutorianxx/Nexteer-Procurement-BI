import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { CostTreeNode } from '../types/costVariance';

interface Props {
    treeData: CostTreeNode;
}

export const WaterfallChart: React.FC<Props> = ({ treeData }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current || !treeData) return;

        const chart = echarts.init(chartRef.current);

        // 从树中提取Level 2的节点作为瀑布图的各段
        const level2Nodes = treeData.children || [];

        // 构建瀑布图数据
        const categories = ['Target Cost'];
        const data: any[] = [{
            value: treeData.target_cost,
            itemStyle: { color: '#8C8C8C' }
        }];

        let cumulative = treeData.target_cost;

        level2Nodes.forEach((node, index) => {
            categories.push(node.item_name);

            if (node.variance !== 0) {
                data.push({
                    value: node.variance > 0 ? node.variance : -node.variance,
                    itemStyle: {
                        color: node.variance > 0 ? '#E31837' : '#52C41A'
                    },
                    label: {
                        formatter: `{c}`,
                        position: node.variance > 0 ? 'top' : 'bottom'
                    }
                });
                cumulative += node.variance;
            } else {
                data.push({
                    value: 0,
                    itemStyle: { color: '#E0E0E0' }
                });
            }
        });

        categories.push('Actual Cost');
        data.push({
            value: treeData.actual_cost,
            itemStyle: { color: '#1A1A1A' }
        });

        const option = {
            title: {
                text: 'Cost Variance Waterfall',
                left: 'center',
                textStyle: {
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#333'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: (params: any) => {
                    const param = params[0];
                    const value = param.value;
                    return `${param.name}<br/>$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: categories,
                axisLabel: {
                    interval: 0,
                    rotate: 30,
                    fontSize: 11
                }
            },
            yAxis: {
                type: 'value',
                name: 'Amount ($)',
                axisLabel: {
                    formatter: (value: number) => {
                        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                        if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
                        return value.toFixed(0);
                    }
                }
            },
            toolbox: {
                feature: {
                    saveAsImage: {
                        title: 'Save as Image',
                        name: `Cost_Waterfall_${new Date().toISOString().split('T')[0]}`,
                        pixelRatio: 2
                    }
                },
                right: 20,
                top: 10
            },
            series: [
                {
                    type: 'bar',
                    stack: 'total',
                    data: data,
                    label: {
                        show: true,
                        position: 'inside',
                        formatter: (params: any) => {
                            if (params.value === 0) return '';
                            const sign = params.data.itemStyle?.color === '#E31837' ? '+' :
                                params.data.itemStyle?.color === '#52C41A' ? '-' : '';
                            return `${sign}$${params.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                        },
                        fontSize: 11,
                        color: '#FFF',
                        fontWeight: 600
                    },
                    barWidth: '60%'
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
    }, [treeData]);

    return <div ref={chartRef} style={{ width: '100%', height: 450 }} />;
};
