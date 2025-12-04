import React, { useEffect, useState } from 'react';
import { Layout, Row, Col, Typography, Table, Card, Spin } from 'antd';
import { KPICard } from '../../components/KPICard';
import { CommodityChart } from '../../components/CommodityChart';
import { OpportunityMatrix } from '../../components/OpportunityMatrix';
import { ConcentrationChart } from '../../components/ConcentrationChart';
import { AIReportCard } from '../../components/AIReportCard';
import { analyticsService } from '../../services/analyticsService';
import type { KPISummary, CommodityData, SupplierRank, ProjectRank } from '../../types/analytics';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, message, Space } from 'antd';
import { DownloadOutlined, DollarOutlined } from '@ant-design/icons';
import { exportDashboardToExcel } from '../../utils/excelExport';

const { Content } = Layout;
const { Title } = Typography;

export const Dashboard: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    // 暂时硬编码 session_id 用于测试，实际应从 URL  或 Context 获取
    // 假设用户上传后跳转带上了 ?session_id=xxx
    const sessionId = searchParams.get('session_id') || 'latest';

    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<KPISummary | null>(null);
    const [commodityData, setCommodityData] = useState<CommodityData[]>([]);
    const [topSuppliers, setTopSuppliers] = useState<SupplierRank[]>([]);
    const [topProjects, setTopProjects] = useState<ProjectRank[]>([]);
    const [matrixData, setMatrixData] = useState<any[]>([]);
    const [concentrationData, setConcentrationData] = useState<any>(null);

    useEffect(() => {
        // 如果没有 session_id，暂时不加载（实际场景应跳转回上传页或显示空状态）
        if (!sessionId || sessionId === 'latest') return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [sum, com, sup, proj, matrix, concentration] = await Promise.all([
                    analyticsService.getSummary(sessionId),
                    analyticsService.getCommodityOverview(sessionId),
                    analyticsService.getTopSuppliers(sessionId),
                    analyticsService.getTopProjects(sessionId),
                    analyticsService.getOpportunityMatrix(sessionId),
                    analyticsService.getSupplierConcentration(sessionId)
                ]);
                setSummary(sum);
                setCommodityData(com);
                setTopSuppliers(sup);
                setTopProjects(proj);
                setMatrixData(matrix as any);
                setConcentrationData(concentration);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sessionId]);

    const handleExport = () => {
        if (!summary || !commodityData.length) {
            message.warning('No data available to export');
            return;
        }

        try {
            exportDashboardToExcel(
                sessionId,
                summary,
                commodityData,
                topSuppliers,
                topProjects,
                matrixData,
                concentrationData
            );
            message.success('Excel exported successfully');
        } catch (error) {
            console.error('Export failed:', error);
            message.error('Failed to export Excel');
        }
    };

    if (!sessionId) {
        return <div style={{ padding: 50 }}>Please upload a file first.</div>;
    }

    return (
        <Layout style={{ minHeight: '100vh', background: '#F5F5F5' }}>
            <Content style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Title level={2} style={{ margin: 0 }}>Commodity Assessment Overview</Title>
                    <Space>
                        <Button
                            type="primary"
                            icon={<DollarOutlined />}
                            onClick={() => navigate('/cost-variance')}
                        >
                            Cost Variance Analysis
                        </Button>
                        <Button
                            type="default"
                            icon={<DownloadOutlined />}
                            onClick={handleExport}
                            disabled={loading}
                        >
                            Export to Excel
                        </Button>
                    </Space>
                </div>

                {loading ? (
                    <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />
                ) : (
                    <>
                        {/* 1. KPI Cards */}
                        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                            <Col span={4}>
                                <KPICard title="Total Spending" value={summary?.total_spending || 0} prefix="$" precision={0} />
                            </Col>
                            <Col span={4}>
                                <KPICard title="Spending Covered" value={summary?.spending_covered || 0} prefix="$" precision={0} />
                            </Col>
                            <Col span={4}>
                                <KPICard title="PNs Covered" value={summary?.pns_covered || 0} />
                            </Col>
                            <Col span={4}>
                                <KPICard title="Suppliers Covered" value={summary?.suppliers_covered || 0} />
                            </Col>
                            <Col span={4}>
                                <KPICard title="Total Opportunity" value={summary?.total_opportunity || 0} prefix="$" color="#E31837" />
                            </Col>
                            <Col span={4}>
                                <KPICard title="Gap % of APV" value={summary?.gap_percent || 0} suffix="%" precision={1} color="#E31837" />
                            </Col>
                        </Row>

                        {/* AI Report */}
                        <AIReportCard sessionId={sessionId} contextType="dashboard" />

                        {/* 2. Commodity Overview Chart */}
                        <Card title="Commodity Overview" style={{ marginBottom: 24 }}>
                            <CommodityChart data={commodityData} />
                        </Card>

                        {/* 3. Top Lists */}
                        <Row gutter={24}>
                            <Col span={12}>
                                <Card title="Top 20 Suppliers by Opportunity">
                                    <Table
                                        dataSource={topSuppliers}
                                        rowKey="supplier"
                                        pagination={false}
                                        size="small"
                                        scroll={{ y: 400 }}
                                        columns={[
                                            { title: 'Supplier', dataIndex: 'supplier' },
                                            { title: 'Main Commodity', dataIndex: 'main_commodity' },
                                            { title: 'APV', dataIndex: 'total_apv', render: val => `$${val.toLocaleString()}` },
                                            { title: 'Gap %', dataIndex: 'gap_percent', render: val => `${val.toFixed(1)}%` },
                                            { title: 'Opportunity', dataIndex: 'total_opportunity', render: val => <span style={{ color: '#E31837' }}>${val.toLocaleString()}</span> },
                                        ]}
                                    />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card title="Top 20 Projects (PNs) by Opportunity">
                                    <Table
                                        dataSource={topProjects}
                                        rowKey="pns"
                                        pagination={false}
                                        size="small"
                                        scroll={{ y: 400 }}
                                        columns={[
                                            { title: 'PN', dataIndex: 'pns' },
                                            { title: 'Desc', dataIndex: 'part_desc', ellipsis: true },
                                            { title: 'APV', dataIndex: 'apv', render: val => `$${val.toLocaleString()}` },
                                            { title: 'Gap %', dataIndex: 'gap_percent', render: val => `${val.toFixed(1)}%` },
                                            { title: 'Opportunity', dataIndex: 'opportunity', render: val => <span style={{ color: '#E31837' }}>${val.toLocaleString()}</span> },
                                        ]}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* 4. Advanced Analytics */}
                        <Row gutter={24} style={{ marginTop: 24 }}>
                            <Col span={12}>
                                <Card title="Opportunity Matrix">
                                    <OpportunityMatrix data={matrixData} />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card title="Supplier Concentration">
                                    <ConcentrationChart data={concentrationData} />
                                </Card>
                            </Col>
                        </Row>
                    </>
                )}
            </Content>
        </Layout>
    );
};
