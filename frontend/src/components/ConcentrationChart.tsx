import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Card, Row, Col, Statistic } from 'antd';

interface ConcentrationData {
    cr3: number;
    cr5: number;
    total_suppliers: number;
    total_apv: number;
    top_suppliers: Array<{
        supplier: string;
        apv: number;
        share: number;
    }>;
}

interface Props {
    data: ConcentrationData | null;
}

export const ConcentrationChart: React.FC<Props> = ({ data }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current || !data) return;

        const chart = echarts.init(chartRef.current);

        // 准备饼图数据：只保留 Top 5，其余聚合为 Others
        const top5 = data.top_suppliers.slice(0, 5);
        const othersApv = data.total_apv - top5.reduce((sum, s) => sum + s.apv, 0);

        // 5 色板 (Nexteer 红 -> 黄)
        const colors = ['#E31837', '#FF4D4F', '#FF7A45', '#FFA940', '#FFC53D'];

        const pieData = [
            ...top5.map((item, idx) => ({
                name: item.supplier,
                value: item.apv,
                itemStyle: { color: colors[idx] }
            })),
            {
                name: 'Others',
                value: othersApv,
                itemStyle: { color: '#E0E0E0' }
            }
        ].filter(item => item.value > 0); // 过滤掉值为 0 的项

        const option = {
            // 移除 ECharts 内部标题
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    const share = ((params.value / data.total_apv) * 100).toFixed(1);
                    return `${params.name}<br/>APV: $${params.value.toLocaleString()}<br/>Share: ${share}%`;
                }
            },
            toolbox: {
                feature: {
                    saveAsImage: {
                        title: 'Save as Image',
                        name: `Supplier_Concentration_${new Date().toISOString().split('T')[0]}`,
                        pixelRatio: 2
                    }
                },
                right: 20,
                top: 10
            },
            legend: {
                bottom: 10,
                left: 'center',
                data: pieData.map(item => item.name)
            },
            series: [
                {
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['50%', '45%'],
                    data: pieData,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    label: {
                        formatter: '{b}: {d}%'
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
        };
    }, [data]);

    if (!data) return <div>No data available</div>;

    return (
        <div>
            {/* KPI 卡片 */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="CR3 (Top 3 Suppliers)"
                            value={data.cr3}
                            precision={1}
                            suffix="%"
                            valueStyle={{ color: data.cr3 > 70 ? '#E31837' : '#1A1A1A' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="CR5 (Top 5 Suppliers)"
                            value={data.cr5}
                            precision={1}
                            suffix="%"
                            valueStyle={{ color: data.cr5 > 85 ? '#E31837' : '#1A1A1A' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Total Suppliers"
                            value={data.total_suppliers}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 饼图 */}
            <div ref={chartRef} style={{ width: '100%', height: 400 }} />
        </div>
    );
};
