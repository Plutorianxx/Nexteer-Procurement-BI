import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Upload, Button, Radio, message, Spin, Statistic, Space, Dropdown, Modal } from 'antd';
import { UploadOutlined, DownloadOutlined, HistoryOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { CostTree } from '../../components/CostTree';
import { WaterfallChart } from '../../components/WaterfallChart';
import { costVarianceService } from '../../services/costVarianceService';
import type { SessionInfo, CostTreeNode, CostView } from '../../types/costVariance';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title } = Typography;
const { Dragger } = Upload;
import { Typography } from 'antd';

export const CostVarianceAnalysis: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // 当前会话数据
    const [currentSession, setCurrentSession] = useState<SessionInfo | null>(null);
    const [treeData, setTreeData] = useState<CostTreeNode | null>(null);
    const [view, setView] = useState<CostView>('by_process');

    // 历史会话
    const [sessions, setSessions] = useState<SessionInfo[]>([]);

    // 载入历史会话列表
    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const response = await costVarianceService.getSessions(10);
            setSessions(response.sessions);
        } catch (error) {
            console.error('Failed to load sessions:', error);
        }
    };

    const handleFileUpload = async (file: File) => {
        setUploading(true);
        try {
            const response = await costVarianceService.upload(file);
            message.success('File uploaded successfully');

            // 加载会话数据
            await loadSession(response.session_id);
            await loadSessions();
        } catch (error: any) {
            message.error(error.response?.data?.detail || 'Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const loadSession = async (sessionId: string) => {
        setLoading(true);
        try {
            const [sessionInfo, treeResponse] = await Promise.all([
                costVarianceService.getSessionInfo(sessionId),
                costVarianceService.getTree(sessionId, view)
            ]);

            setCurrentSession(sessionInfo);
            setTreeData(treeResponse.tree);
        } catch (error: any) {
            message.error(error.response?.data?.detail || 'Failed to load session');
        } finally {
            setLoading(false);
        }
    };

    const handleViewChange = async (newView: CostView) => {
        if (!currentSession) return;

        setView(newView);
        setLoading(true);
        try {
            const treeResponse = await costVarianceService.getTree(currentSession.session_id, newView);
            setTreeData(treeResponse.tree);
        } catch (error: any) {
            message.error('Failed to switch view');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        Modal.confirm({
            title: 'Delete Session',
            content: 'Are you sure you want to delete this analysis session?',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await costVarianceService.deleteSession(sessionId);
                    message.success('Session deleted');
                    await loadSessions();

                    if (currentSession?.session_id === sessionId) {
                        setCurrentSession(null);
                        setTreeData(null);
                    }
                } catch (error) {
                    message.error('Failed to delete session');
                }
            }
        });
    };

    const uploadProps = {
        accept: '.xlsx,.xls,.xlsm',
        showUploadList: false,
        beforeUpload: (file: UploadFile) => {
            handleFileUpload(file as unknown as File);
            return false;
        }
    };

    const historyMenuItems = sessions.map(session => ({
        key: session.session_id,
        label: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 300 }}>
                <div>
                    <div style={{ fontWeight: 600 }}>{session.part_number}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                        {session.supplier_name} • {new Date(session.upload_time).toLocaleDateString()}
                    </div>
                </div>
                <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.session_id);
                    }}
                />
            </div>
        ),
        onClick: () => loadSession(session.session_id)
    }));

    return (
        <Layout style={{ minHeight: '100vh', background: '#F5F5F5' }}>
            <Content style={{ padding: '24px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate('/dashboard')}
                        >
                            Back to Dashboard
                        </Button>
                        <Title level={2} style={{ margin: 0 }}>Cost Variance Analysis</Title>
                    </div>

                    <Space>
                        <Dropdown menu={{ items: historyMenuItems }} trigger={['click']} disabled={sessions.length === 0}>
                            <Button icon={<HistoryOutlined />}>
                                History ({sessions.length})
                            </Button>
                        </Dropdown>

                        <Dragger {...uploadProps} style={{ display: 'inline-block' }}>
                            <Button
                                type="primary"
                                icon={<UploadOutlined />}
                                loading={uploading}
                            >
                                Upload Cost Sheet
                            </Button>
                        </Dragger>
                    </Space>
                </div>

                {/* 如果没有数据，显示上传引导 */}
                {!currentSession && !loading && (
                    <Card>
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <UploadOutlined style={{ fontSize: 64, color: '#E0E0E0', marginBottom: 16 }} />
                            <Title level={4}>Upload a Cost Sheet to Start Analysis</Title>
                            <p style={{ color: '#666', marginBottom: 24 }}>
                                Please upload an Excel file (.xlsx) in the standard cost breakdown format.
                            </p>
                            <Dragger {...uploadProps}>
                                <Button type="primary" size="large" icon={<UploadOutlined />} loading={uploading}>
                                    Select File
                                </Button>
                            </Dragger>
                        </div>
                    </Card>
                )}

                {/* 主内容区 */}
                {currentSession && (
                    <Spin spinning={loading}>
                        {/* Session Info KPIs */}
                        <Row gutter={16} style={{ marginBottom: 24 }}>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="Part Number"
                                        value={currentSession.part_number}
                                        valueStyle={{ fontSize: 18 }}
                                        formatter={(value) => value} // 直接显示字符串，不进行数值格式化
                                    />
                                    <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                                        {currentSession.part_description}
                                    </div>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="Supplier"
                                        value={currentSession.supplier_name}
                                        valueStyle={{ fontSize: 18 }}
                                    />
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="Target Price"
                                        value={currentSession.target_price}
                                        precision={2}
                                        prefix="$"
                                        valueStyle={{ fontSize: 20 }}
                                    />
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="Total Variance"
                                        value={currentSession.total_variance}
                                        precision={2}
                                        prefix="$"
                                        suffix={`(${currentSession.variance_pct > 0 ? '+' : ''}${currentSession.variance_pct.toFixed(2)}%)`}
                                        valueStyle={{
                                            color: currentSession.total_variance > 0 ? '#E31837' : '#52C41A',
                                            fontSize: 20,
                                            fontWeight: 600
                                        }}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* 成本树 + 瀑布图 */}
                        <Row gutter={16}>
                            <Col span={14}>
                                <Card
                                    title="Cost Breakdown Tree"
                                    extra={
                                        <Radio.Group value={view} onChange={(e) => handleViewChange(e.target.value)}>
                                            <Radio.Button value="by_process">By Process</Radio.Button>
                                            <Radio.Button value="by_type">By Type</Radio.Button>
                                        </Radio.Group>
                                    }
                                >
                                    {treeData && <CostTree treeData={treeData} />}
                                </Card>
                            </Col>

                            <Col span={10}>
                                <Card title="Variance Waterfall">
                                    {treeData && <WaterfallChart treeData={treeData} />}
                                </Card>
                            </Col>
                        </Row>

                        {/* Export Buttons */}
                        <div style={{ marginTop: 24, textAlign: 'center' }}>
                            <Space>
                                <Button icon={<DownloadOutlined />} size="large">
                                    Export Excel
                                </Button>
                                <Button icon={<DownloadOutlined />} size="large">
                                    Export Waterfall Chart
                                </Button>
                            </Space>
                        </div>
                    </Spin>
                )}
            </Content>
        </Layout>
    );
};
