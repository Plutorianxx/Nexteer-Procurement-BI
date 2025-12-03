import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { InputNumber, Space, Typography, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface MatrixData {
    pns: string;
    part_desc: string;
    supplier: string;
    commodity: string;
    apv: number;
    gap_percent: number;
    opportunity: number;
}

interface Props {
    data: MatrixData[];
}

// 计算中位数
const calculateMedian = (values: number[]) => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export const OpportunityMatrix: React.FC<Props> = ({ data }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);

    // 阈值状态
    const [apvThreshold, setApvThreshold] = useState<number>(0);
    const [gapThreshold, setGapThreshold] = useState<number>(0);

    // 初始化默认阈值（中位数）
    useEffect(() => {
        if (data.length > 0) {
            const apvMedian = calculateMedian(data.map(d => d.apv));
            const gapMedian = calculateMedian(data.map(d => d.gap_percent));
            // 如果从未设置过（初始加载），则设置默认值
            if (apvThreshold === 0) setApvThreshold(Math.round(apvMedian));
            if (gapThreshold === 0) setGapThreshold(Number(gapMedian.toFixed(1)));
        }
    }, [data]);

    useEffect(() => {
        if (!chartRef.current || !data.length) return;

        // 初始化或获取实例
        if (!chartInstance.current) {
            chartInstance.current = echarts.init(chartRef.current);
        }
        const chart = chartInstance.current;

        // 准备数据
        const bubbleData = data.map(item => {
            // 动态判断象限颜色
            let color = '#B0B0B0'; // 默认左下 (Low Value)
            if (item.apv >= apvThreshold && item.gap_percent >= gapThreshold) {
                color = '#E31837'; // 右上: Core Opportunity (Red)
            } else if (item.apv < apvThreshold && item.gap_percent >= gapThreshold) {
                color = '#FF7F50'; // 左上: Potential (Orange)
            } else if (item.apv >= apvThreshold && item.gap_percent < gapThreshold) {
                color = '#2196F3'; // 右下: Stable (Blue)
            }

            return {
                value: [
                    item.apv,
                    item.gap_percent,
                    item.opportunity
                ],
                itemStyle: { color },
                metadata: item
            };
        });

        // 计算坐标轴范围 (增加一点 padding)
        const apvValues = data.map(d => d.apv);
        const gapValues = data.map(d => d.gap_percent);
        const maxApv = Math.max(...apvValues) * 1.1;
        const maxGap = Math.max(...gapValues) * 1.1;

        const option = {
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(0,0,0,0.8)',
                borderWidth: 0,
                textStyle: { color: '#FFFFFF' },
                formatter: (params: any) => {
                    const item = params.data.metadata;
                    return `
            <strong>PN: ${item.pns}</strong><br/>
            Part: ${item.part_desc || 'N/A'}<br/>
            Supplier: ${item.supplier}<br/>
            Commodity: ${item.commodity}<br/>
            APV: $${item.apv.toLocaleString()}<br/>
            Gap %: ${item.gap_percent.toFixed(1)}%<br/>
            Opportunity: $${item.opportunity.toLocaleString()}
          `;
                }
            },
            grid: {
                left: '10%',
                right: '10%',
                bottom: '15%',
                top: '10%'
            },
            xAxis: {
                name: 'APV ($)',
                nameLocation: 'middle',
                nameGap: 30,
                type: 'value',
                min: 0, // 总是从 0 开始，展示全貌
                max: maxApv,
                axisLabel: {
                    formatter: (value: number) => {
                        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                        if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
                        return value;
                    }
                }
            },
            yAxis: {
                name: 'Gap %',
                nameLocation: 'middle',
                nameGap: 40,
                type: 'value',
                min: 0,
                max: maxGap,
                axisLabel: { formatter: '{value}%' }
            },
            series: [
                {
                    type: 'scatter',
                    symbolSize: (data: number[]) => {
                        const opportunity = data[2];
                        if (opportunity <= 0) return 6;
                        // 调整气泡大小公式
                        return Math.sqrt(opportunity) / 10 + 6;
                    },
                    data: bubbleData,
                    emphasis: {
                        focus: 'self',
                        itemStyle: {
                            borderColor: '#1A1A1A',
                            borderWidth: 2
                        }
                    },
                    markLine: {
                        silent: true,
                        symbol: ['none', 'none'],
                        label: { show: true, position: 'end' },
                        lineStyle: {
                            color: '#333',
                            type: 'dashed',
                            width: 1
                        },
                        data: [
                            { xAxis: apvThreshold, name: 'APV Threshold' },
                            { yAxis: gapThreshold, name: 'Gap Threshold' }
                        ]
                    },
                    markArea: {
                        silent: true,
                        itemStyle: {
                            color: 'transparent',
                            borderWidth: 0
                        },
                        data: [
                            [
                                { name: 'Core Opportunity', xAxis: apvThreshold, yAxis: gapThreshold, label: { color: '#E31837', position: 'insideTopRight' } },
                                { xAxis: maxApv, yAxis: maxGap }
                            ]
                        ]
                    }
                }
            ]
        };

        chart.setOption(option);

        const handleResize = () => chart.resize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.dispose();
            chartInstance.current = null;
        };
    }, [data, apvThreshold, gapThreshold]);

    return (
        <div>
            {/* 控制栏 */}
            <div style={{ marginBottom: 16, padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                    <div>
                        <Text type="secondary" style={{ fontSize: 12, marginRight: 8 }}>
                            APV Threshold ($):
                            <Tooltip title="Divides High/Low Spend. Default is Median.">
                                <InfoCircleOutlined style={{ marginLeft: 4 }} />
                            </Tooltip>
                        </Text>
                        <InputNumber
                            value={apvThreshold}
                            onChange={val => setApvThreshold(val || 0)}
                            step={1000}
                            style={{ width: 120 }}
                        />
                    </div>
                    <div>
                        <Text type="secondary" style={{ fontSize: 12, marginRight: 8 }}>
                            Gap Threshold (%):
                            <Tooltip title="Divides High/Low Gap. Default is Median.">
                                <InfoCircleOutlined style={{ marginLeft: 4 }} />
                            </Tooltip>
                        </Text>
                        <InputNumber
                            value={gapThreshold}
                            onChange={val => setGapThreshold(val || 0)}
                            step={0.5}
                            style={{ width: 80 }}
                        />
                    </div>
                </Space>

                {/* 图例说明 */}
                <Space size="large">
                    <Space size={4}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E31837' }}></div><Text style={{ fontSize: 12 }}>Core Opp</Text></Space>
                    <Space size={4}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF7F50' }}></div><Text style={{ fontSize: 12 }}>Potential</Text></Space>
                    <Space size={4}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2196F3' }}></div><Text style={{ fontSize: 12 }}>Stable</Text></Space>
                </Space>
            </div>

            <div ref={chartRef} style={{ width: '100%', height: 500 }} />
        </div>
    );
};
