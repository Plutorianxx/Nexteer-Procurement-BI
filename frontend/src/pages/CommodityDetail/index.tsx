import React, { useEffect, useState } from 'react';
import { Layout, Row, Col, Typography, Table, Card, Spin, Collapse } from 'antd';
import { useParams, useSearchParams } from 'react-router-dom';
import { KPICard } from '../../components/KPICard';
import { TopSuppliersChart } from '../../components/TopSuppliersChart';
import { SupplierDetailCard } from '../../components/SupplierDetailCard';
import { analyticsService } from '../../services/analyticsService';
import type { KPISummary } from '../../types/analytics';

const { Content } = Layout;
const { Title } = Typography;
const { Panel } = Collapse;

interface SupplierData {
    supplier: string;
    total_apv: number;
    total_opportunity: number;
    gap_percent: number;
}

interface PNData {
    pns: string;
    part_desc: string;
    opportunity: number;
    gap_percent: number;
}

export const CommodityDetail: React.FC = () => {
    const { commodityName } = useParams<{ commodityName: string }>();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id') || '';

    const [loading, setLoading] = useState(true);
    const [kpi, setKpi] = useState<KPISummary | null>(null);
    const [topSuppliers, setTopSuppliers] = useState<SupplierData[]>([]);
    const [supplierPNs, setSupplierPNs] = useState<Record<string, PNData[]>>({});

    useEffect(() => {
        if (!sessionId || !commodityName) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [kpiData, suppliersResponse] = await Promise.all([
                    analyticsService.getCommodityKPI(sessionId, commodityName),
                    analyticsService.getCommodityTopSuppliers(sessionId, commodityName, 5)
                ]);

                setKpi(kpiData);
                const suppliers = suppliersResponse as unknown as SupplierData[];
                setTopSuppliers(suppliers);

                // 加载每个 Supplier 的 Top 10 PNs
                const pnsPromises = suppliers.map((s: SupplierData) =>
                    analyticsService.getSupplierTopPNs(sessionId, s.supplier, 10)
                );
                const pnsResults = await Promise.all(pnsPromises);

                const pnsMap: Record<string, PNData[]> = {};
                suppliers.forEach((s: SupplierData, idx: number) => {
                    pnsMap[s.supplier] = pnsResults[idx] as unknown as PNData[];
                });
                setSupplierPNs(pnsMap);

            } catch (error) {
                console.error("Failed to fetch commodity detail", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sessionId, commodityName]);

    if (!sessionId || !commodityName) {
        return <div style={{ padding: 50 }}>Invalid parameters</div>;
    }

    return (
        <Layout style={{ minHeight: '100vh', background: '#F5F5F5' }}>
            <Content style={{ padding: '24px' }}>
                <Title level={2} style={{ marginBottom: 24 }}>
                    {commodityName} - Detail Analysis
                </Title>

                {loading ? (
                    <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />
                ) : (
                    <>
                        {/* 1. KPI Cards */}
                        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                            <Col span={4}>
                                <KPICard title="Total Spending" value={kpi?.total_spending || 0} prefix="$" precision={0} />
                            </Col>
                            <Col span={4}>
                                <KPICard title="Spending Covered" value={kpi?.spending_covered || 0} prefix="$" precision={0} />
                            </Col>
                            <Col span={4}>
                                <KPICard title="PNs Covered" value={kpi?.pns_covered || 0} />
                            </Col>
                            <Col span={4}>
                                <KPICard title="Suppliers Covered" value={kpi?.suppliers_covered || 0} />
                            </Col>
                            <Col span={4}>
                                <KPICard title="Total Opportunity" value={kpi?.total_opportunity || 0} prefix="$" color="#E31837" />
                            </Col>
                            <Col span={4}>
                                <KPICard title="Gap % of APV" value={kpi?.gap_percent || 0} suffix="%" precision={1} color="#E31837" />
                            </Col>
                        </Row>

                        {/* 2. Top 5 Suppliers Chart */}
                        <Card title="Top 5 Suppliers (by Opportunity)" style={{ marginBottom: 24 }}>
                            <TopSuppliersChart data={topSuppliers} />
                        </Card>

                        {/* 3. Supplier Details (Accordion) */}
                        <Card title="Top 5 Suppliers - Detail Analysis">
                            <Collapse accordion>
                                {topSuppliers.map((supplier) => (
                                    <Panel
                                        header={`${supplier.supplier} - Opportunity: $${supplier.total_opportunity.toLocaleString()}`}
                                        key={supplier.supplier}
                                    >
                                        {/* 交互式图表 */}
                                        <SupplierDetailCard
                                            supplier={supplier.supplier}
                                            apv={supplier.total_apv}
                                            opportunity={supplier.total_opportunity}
                                        />

                                        {/* Top 10 PNs 表 */}
                                        <Card title="Top 10 PNs (by Opportunity)" size="small">
                                            <Table
                                                dataSource={supplierPNs[supplier.supplier] || []}
                                                rowKey="pns"
                                                pagination={false}
                                                size="small"
                                                columns={[
                                                    { title: 'PNs', dataIndex: 'pns', width: 120 },
                                                    { title: 'Part Description', dataIndex: 'part_desc', ellipsis: true },
                                                    {
                                                        title: 'Opportunity',
                                                        dataIndex: 'opportunity',
                                                        render: val => <span style={{ color: '#E31837' }}>${val.toLocaleString()}</span>,
                                                        sorter: (a, b) => a.opportunity - b.opportunity,
                                                        defaultSortOrder: 'descend'
                                                    },
                                                    {
                                                        title: 'Gap %',
                                                        dataIndex: 'gap_percent',
                                                        render: val => `${val.toFixed(1)}%`
                                                    },
                                                ]}
                                            />
                                        </Card>
                                    </Panel>
                                ))}
                            </Collapse>
                        </Card>
                    </>
                )}
            </Content>
        </Layout>
    );
};
