import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, Select, Space, Alert, Spin } from 'antd';
import { RobotOutlined, SettingOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { llmService } from '../services/llmService';
import type { LLMConfig } from '../types/llm';

const { Option } = Select;

interface Props {
    sessionId: string;
    contextType: 'dashboard' | 'commodity' | 'supplier';
    contextValue?: string;
}

const DEFAULT_CONFIG: LLMConfig = {
    provider: 'openai',
    api_key: '',
    base_url: 'https://api.openai.com/v1',
    model: 'gpt-4o',
    temperature: 0.7
};

export const AIReportCard: React.FC<Props> = ({ sessionId, contextType, contextValue }) => {
    const [config, setConfig] = useState<LLMConfig>(DEFAULT_CONFIG);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [report, setReport] = useState<string>('');
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form] = Form.useForm();

    // 从 localStorage 加载配置
    useEffect(() => {
        const savedConfig = localStorage.getItem('llm_config');
        if (savedConfig) {
            const parsed = JSON.parse(savedConfig);
            setConfig(parsed);
            form.setFieldsValue(parsed);
        }
    }, []);

    const handleSaveSettings = (values: LLMConfig) => {
        setConfig(values);
        localStorage.setItem('llm_config', JSON.stringify(values));
        setIsSettingsOpen(false);
    };

    const handleGenerate = async () => {
        if (!config.api_key) {
            setIsSettingsOpen(true);
            return;
        }

        setGenerating(true);
        setReport('');
        setError(null);

        await llmService.generateReportStream(
            {
                session_id: sessionId,
                context_type: contextType,
                context_value: contextValue,
                config: config
            },
            (chunk) => {
                setReport(prev => prev + chunk);
            },
            (err) => {
                setError(err);
                setGenerating(false);
            },
            () => {
                setGenerating(false);
            }
        );
    };

    const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

    return (
        <Card
            title={
                <Space>
                    <RobotOutlined style={{ color: '#1890ff' }} />
                    <span>AI Executive Summary</span>
                </Space>
            }
            extra={
                <Space>
                    <Button
                        type="text"
                        icon={<SettingOutlined />}
                        onClick={() => setIsSettingsOpen(true)}
                    />
                    {report && !generating && (
                        <Button
                            type="text"
                            icon={<ReloadOutlined />}
                            onClick={handleGenerate}
                        >
                            Regenerate
                        </Button>
                    )}
                </Space>
            }
            style={{ marginBottom: 24, border: '1px solid #e8e8e8', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        >
            {!report && !generating && !error && (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
                    <p>Click the button below to generate an AI-powered analysis of this data.</p>
                    <Button type="primary" onClick={handleGenerate} icon={<RobotOutlined />}>
                        Generate Report
                    </Button>
                </div>
            )}

            {error && (
                <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: 16 }} />
            )}

            {(report || generating) && (
                <div style={{ lineHeight: '1.6', fontSize: '14px' }}>
                    <ReactMarkdown>{report}</ReactMarkdown>
                    {generating && <Spin indicator={antIcon} style={{ marginLeft: 8 }} />}
                </div>
            )}

            {/* Settings Modal */}
            <Modal
                title="LLM Configuration"
                open={isSettingsOpen}
                onCancel={() => setIsSettingsOpen(false)}
                onOk={() => form.submit()}
                okText="Save"
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={config}
                    onFinish={handleSaveSettings}
                >
                    <Form.Item name="provider" label="Provider">
                        <Select onChange={(value) => {
                            // 自动填充 Base URL 和 Model
                            if (value === 'kimi') {
                                form.setFieldsValue({
                                    base_url: 'https://api.moonshot.cn/v1',
                                    model: 'moonshot-v1-8k'
                                });
                            } else if (value === 'glm') {
                                form.setFieldsValue({
                                    base_url: 'https://open.bigmodel.cn/api/paas/v4',
                                    model: 'glm-4'
                                });
                            } else if (value === 'openai') {
                                form.setFieldsValue({
                                    base_url: 'https://api.openai.com/v1',
                                    model: 'gpt-4o'
                                });
                            }
                        }}>
                            <Option value="openai">OpenAI</Option>
                            <Option value="kimi">Kimi (Moonshot)</Option>
                            <Option value="glm">GLM (Zhipu AI)</Option>
                            <Option value="gemini">Google Gemini</Option>
                            <Option value="custom">Custom</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="base_url"
                        label="Base URL"
                        tooltip="e.g. https://api.openai.com/v1 or https://generativelanguage.googleapis.com/v1beta/openai/"
                    >
                        <Input placeholder="https://api.openai.com/v1" />
                    </Form.Item>
                    <Form.Item
                        name="api_key"
                        label="API Key"
                        rules={[{ required: true, message: 'Please enter your API Key' }]}
                    >
                        <Input.Password placeholder="sk-..." />
                    </Form.Item>
                    <Form.Item name="model" label="Model Name">
                        <Input placeholder="gpt-4o, gemini-1.5-flash, etc." />
                    </Form.Item>
                    <Form.Item name="temperature" label="Temperature">
                        <InputNumber min={0} max={2} step={0.1} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

// 临时解决 InputNumber 导入问题，如果 antd 没有导出 InputNumber，可以使用 Input type="number"
import { InputNumber } from 'antd';
