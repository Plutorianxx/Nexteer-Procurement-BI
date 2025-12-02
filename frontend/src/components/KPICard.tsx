import React from 'react';
import { Card, Statistic, Typography } from 'antd';

const { Text } = Typography;

interface Props {
    title: string;
    value: number;
    prefix?: string;
    suffix?: string;
    precision?: number;
    trend?: number; // 暂时不用，预留
    color?: string; // 数值颜色
}

export const KPICard: React.FC<Props> = ({
    title,
    value,
    prefix = '',
    suffix = '',
    precision = 0,
    color
}) => {
    return (
        <Card
            className="kpi-card"
            bodyStyle={{ padding: '16px 24px' }}
            style={{ borderTop: '3px solid #E31837', height: '100%' }}
        >
            <Text type="secondary" style={{ fontSize: 14 }}>{title}</Text>
            <Statistic
                value={value}
                precision={precision}
                prefix={prefix}
                suffix={suffix}
                valueStyle={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: color || '#1A1A1A',
                    marginTop: 8
                }}
            />
        </Card>
    );
};
