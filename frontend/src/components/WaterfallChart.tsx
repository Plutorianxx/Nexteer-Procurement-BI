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

        // 准备数据
        const categories = ['Target Cost'];
        const placeholders: number[] = [0]; // 辅助透明系列
        const values: any[] = [treeData.target_cost]; // 实际显示系列

        // 初始累积高度
        let cumulative = treeData.target_cost;

        level2Nodes.forEach((node) => {
            categories.push(node.item_name);

            const variance = node.variance;

            if (variance === 0) {
                // 无差异
                placeholders.push(cumulative);
                values.push({
                    value: 0,
                    itemStyle: { color: '#E0E0E0' }
                });
            } else if (variance > 0) {
                // 正差异 (增加): 辅助高度 = 当前累积
                placeholders.push(cumulative);
                values.push({
                    value: variance,
                    itemStyle: { color: '#E31837' }, // 红色
                    label: { position: 'top' }
                });
                cumulative += variance;
            } else {
                // 负差异 (减少): 辅助高度 = 当前累积 - |variance|
                cumulative += variance; // variance是负数，所以是减
                placeholders.push(cumulative);
                values.push({
                    value: Math.abs(variance),
                    itemStyle: { color: '#52C41A' }, // 绿色
                    label: { position: 'bottom' }
                });
            }
        });

        // 最终 Actual Cost
        categories.push('Actual Cost');
        placeholders.push(0);
        values.push({
            value: treeData.actual_cost,
            itemStyle: { color: '#1A1A1A' } // 黑色
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
                axisPointer: { type: 'shadow' },
                formatter: (params: any) => {
                    let tar: any;
                    // 找到非辅助系列的那个param
                    if (params[1].value !== '-') {
                        tar = params[1];
                    } else {
                        tar = params[0];
                    }

                    // 如果是 Target 或 Actual
                    if (tar.name === 'Target Cost' || tar.name === 'Actual Cost') {
                        return `${tar.name}<br/>$${tar.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    }

                    // 如果是差异项
                    const val = tar.value;
                    const color = tar.itemStyle?.color;
                    const sign = color === '#E31837' ? '+' : color === '#52C41A' ? '-' : '';
                    return `${tar.name}<br/>${sign}$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
                    name: 'Placeholder',
                    type: 'bar',
                    stack: 'Total',
                    itemStyle: {
                        borderColor: 'transparent',
                        color: 'transparent'
                    },
                    emphasis: {
                        itemStyle: {
                            borderColor: 'transparent',
                            color: 'transparent'
                        }
                    },
                    data: placeholders
                },
                {
                    name: 'Variance',
                    type: 'bar',
                    stack: 'Total',
                    data: values,
                    label: {
                        show: true,
                        position: 'inside', // 默认inside，后面会覆盖
                        formatter: (params: any) => {
                            if (params.value === 0) return '';
                            // Target 和 Actual 直接显示数值
                            if (params.name === 'Target Cost' || params.name === 'Actual Cost') {
                                return `$${params.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                            }

                            const color = params.data.itemStyle?.color;
                            const sign = color === '#E31837' ? '+' : color === '#52C41A' ? '-' : '';
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
