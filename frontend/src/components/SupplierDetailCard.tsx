import React, { useState } from 'react';
import { Card, Button, Input, Space, message } from 'antd';
import * as echarts from 'echarts';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

interface CustomSeries {
    name: string;
    value: number;
}

interface Props {
    supplier: string;
    apv: number;
    opportunity: number;
}

export const SupplierDetailCard: React.FC<Props> = ({ supplier, apv, opportunity }) => {
    const [customSeries, setCustomSeries] = useState<CustomSeries[]>([]);
    const [newSeriesName, setNewSeriesName] = useState('');
    const [newSeriesValue, setNewSeriesValue] = useState('');
    const chartRef = React.useRef<HTMLDivElement>(null);

    const handleAddSeries = () => {
        if (!newSeriesName || !newSeriesValue) {
            message.warning('Please enter both name and value');
            return;
        }

        const value = parseFloat(newSeriesValue);
        if (isNaN(value)) {
            message.error('Please enter a valid number');
            return;
        }

        setCustomSeries([...customSeries, { name: newSeriesName, value }]);
        setNewSeriesName('');
        setNewSeriesValue('');
    };

    const handleRemoveSeries = (index: number) => {
        setCustomSeries(customSeries.filter((_, i) => i !== index));
    };

    React.useEffect(() => {
        if (!chartRef.current) return;

        const chart = echarts.init(chartRef.current);

        const categories = ['APV', 'Opportunity', ...customSeries.map(s => s.name)];
        const values = [apv, opportunity, ...customSeries.map(s => s.value)];

        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            xAxis: {
                type: 'category',
                data: categories
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: (value: number) => {
                        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                        if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
                        return value;
                    }
                }
            },
            series: [
                {
                    type: 'bar',
                    data: values.map((val, idx) => ({
                        value: val,
                        itemStyle: {
                            color: idx === 0 ? '#1A1A1A' : idx === 1 ? '#E31837' : '#2196F3'
                        }
                    })),
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
    }, [apv, opportunity, customSeries]);

    return (
        <Card title={`${supplier} - Interactive Chart`} style={{ marginBottom: 24 }}>
            <div ref={chartRef} style={{ width: '100%', height: 300 }} />

            <div style={{ marginTop: 16, padding: '16px', background: '#FAFAFA', borderRadius: 4 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <span style={{ fontWeight: 600 }}>Add Custom Data Series</span>
                    <Space>
                        <Input
                            placeholder="Series Name (e.g. Target)"
                            value={newSeriesName}
                            onChange={e => setNewSeriesName(e.target.value)}
                            style={{ width: 200 }}
                        />
                        <Input
                            placeholder="Value"
                            value={newSeriesValue}
                            onChange={e => setNewSeriesValue(e.target.value)}
                            style={{ width: 150 }}
                            type="number"
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddSeries}
                            style={{ background: '#E31837', borderColor: '#E31837' }}
                        >
                            Add
                        </Button>
                    </Space>

                    {customSeries.length > 0 && (
                        <div>
                            <span style={{ fontSize: 12, color: '#888' }}>Custom Series:</span>
                            {customSeries.map((series, idx) => (
                                <div key={idx} style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
                                    <span style={{ flex: 1 }}>{series.name}: ${series.value.toLocaleString()}</span>
                                    <Button
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleRemoveSeries(idx)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </Space>
            </div>
        </Card>
    );
};
