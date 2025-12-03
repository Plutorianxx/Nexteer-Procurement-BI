import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, Select, Space, Alert, Spin, Tooltip } from 'antd';
import { RobotOutlined, SettingOutlined, LoadingOutlined, ReloadOutlined, EditOutlined, SaveOutlined, UndoOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { llmService } from '../services/llmService';
import type { LLMConfig } from '../types/llm';

const { Option } = Select;
const { TextArea } = Input;

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

const SYSTEM_PROMPTS = {
    dashboard: `## Executive Summary (Global)
### 1. Overall Health
(Analyze Total Spend, Opportunity, and Gap %. Is the gap high or low?)

### 2. Commodity Strategy
(Which commodities have high spend AND high gap? These are priority areas.)

### 3. Supply Chain Risks
(Is the opportunity concentrated in a few suppliers? Should we consolidate or diversify?)

### 4. Recommendations
(Strategic actions based on the matrix quadrants)`,

    commodity: `## Commodity Deep Dive
### 1. Supply Chain Structure
(Is this commodity dominated by a few suppliers? Check CR3/CR5.)

### 2. Cost Reduction Path
(Analyze Top PNs. Are we targeting high spend/low gap items or outliers?)

### 3. Outlier Detection
(Do specific suppliers have significantly higher gaps than others?)

### 4. Negotiation Prep
(For the top supplier: Generate a negotiation script based on their total spend and gap.)`
};

export const AIReportCard: React.FC<Props> = ({ sessionId, contextType, contextValue }) => {
    const [config, setConfig] = useState<LLMConfig>(DEFAULT_CONFIG);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [report, setReport] = useState<string>('');
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form] = Form.useForm();

    // Prompt State
    const [showPromptEditor, setShowPromptEditor] = useState(false);
    const [currentPrompt, setCurrentPrompt] = useState('');

    // Load Config & Prompt
    useEffect(() => {
        // 1. Load Config
        const savedConfig = localStorage.getItem('llm_config');
        if (savedConfig) {
            const parsed = JSON.parse(savedConfig);
            setConfig(parsed);
            form.setFieldsValue(parsed);
        }

        // 2. Load Prompt (User Saved > System Default)
        const savedPrompt = localStorage.getItem(`llm_prompt_${contextType}`);
        if (savedPrompt) {
            setCurrentPrompt(savedPrompt);
        } else {
            setCurrentPrompt(SYSTEM_PROMPTS[contextType as keyof typeof SYSTEM_PROMPTS] || '');
        }
    }, [contextType]);

    const handleSaveSettings = (values: LLMConfig) => {
        setConfig(values);
        localStorage.setItem('llm_config', JSON.stringify(values));
        setIsSettingsOpen(false);
    };

    const handleSavePrompt = () => {
        localStorage.setItem(`llm_prompt_${contextType}`, currentPrompt);
        setShowPromptEditor(false);
    };

    const handleResetPrompt = () => {
        const defaultPrompt = SYSTEM_PROMPTS[contextType as keyof typeof SYSTEM_PROMPTS] || '';
        setCurrentPrompt(defaultPrompt);
    };

    const handleGenerate = async () => {
        if (!config.api_key) {
            setIsSettingsOpen(true);
            return;
        }

        setGenerating(true);
        setReport('');
        setError(null);
        setShowPromptEditor(false); // 收起编辑器

        await llmService.generateReportStream(
            {
                session_id: sessionId,
                context_type: contextType,
                context_value: contextValue,
                config: config,
                prompt_template: currentPrompt
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
                    <Tooltip title="Customize Analysis Prompt">
                        <Button
                            type={showPromptEditor ? 'primary' : 'text'}
                            icon={<EditOutlined />}
                            onClick={() => setShowPromptEditor(!showPromptEditor)}
                        />
                    </Tooltip>
                    <Tooltip title="LLM Settings">
                        <Button
                            type="text"
                            icon={<SettingOutlined />}
                            onClick={() => setIsSettingsOpen(true)}
                        />
                    </Tooltip>
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
            {/* Prompt Editor */}
            {showPromptEditor && (
                <div style={{ marginBottom: 20, background: '#fafafa', padding: 16, borderRadius: 8, border: '1px solid #f0f0f0' }}>
                    <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 500 }}>Analysis Instructions (Prompt):</span>
                        <Space>
                            <Button size="small" icon={<UndoOutlined />} onClick={handleResetPrompt}>Reset Default</Button>
                            <Button size="small" type="primary" icon={<SaveOutlined />} onClick={handleSavePrompt}>Save & Close</Button>
                        </Space>
                    </div>
                    <TextArea
                        rows={6}
                        value={currentPrompt}
                        onChange={e => setCurrentPrompt(e.target.value)}
                        style={{ fontFamily: 'monospace', fontSize: 12 }}
                    />
                </div>
            )}

            {!report && !generating && !error && !showPromptEditor && (
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
                <div style={{
                    lineHeight: '1.8',
                    fontSize: '14px',
                    textAlign: 'left',
                    color: '#333'
                }}>
                    <ReactMarkdown
                        components={{
                            h1: ({ children }) => (
                                <h1 style={{
                                    color: '#E31837',
                                    fontWeight: 700,
                                    fontSize: '24px',
                                    marginTop: '0',
                                    marginBottom: '16px',
                                    borderBottom: '2px solid #E31837',
                                    paddingBottom: '8px'
                                }}>
                                    {children}
                                </h1>
                            ),
                            h2: ({ children }) => (
                                <h2 style={{
                                    color: '#E31837',
                                    fontWeight: 700,
                                    fontSize: '20px',
                                    marginTop: '24px',
                                    marginBottom: '12px',
                                    borderLeft: '4px solid #E31837',
                                    paddingLeft: '12px'
                                }}>
                                    {children}
                                </h2>
                            ),
                            h3: ({ children }) => (
                                <h3 style={{
                                    color: '#333',
                                    fontWeight: 600,
                                    fontSize: '16px',
                                    marginTop: '20px',
                                    marginBottom: '10px'
                                }}>
                                    {children}
                                </h3>
                            ),
                            h4: ({ children }) => (
                                <h4 style={{
                                    color: '#666',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    marginTop: '16px',
                                    marginBottom: '8px'
                                }}>
                                    {children}
                                </h4>
                            ),
                            p: ({ children }) => (
                                <p style={{
                                    marginBottom: '12px',
                                    lineHeight: '1.8',
                                    color: '#555'
                                }}>
                                    {children}
                                </p>
                            ),
                            ul: ({ children }) => (
                                <ul style={{
                                    marginBottom: '12px',
                                    paddingLeft: '24px',
                                    listStyleType: 'disc'
                                }}>
                                    {children}
                                </ul>
                            ),
                            ol: ({ children }) => (
                                <ol style={{
                                    marginBottom: '12px',
                                    paddingLeft: '24px'
                                }}>
                                    {children}
                                </ol>
                            ),
                            li: ({ children }) => (
                                <li style={{
                                    marginBottom: '6px',
                                    lineHeight: '1.6'
                                }}>
                                    {children}
                                </li>
                            ),
                            strong: ({ children }) => (
                                <strong style={{
                                    color: '#E31837',
                                    fontWeight: 600
                                }}>
                                    {children}
                                </strong>
                            ),
                            code: ({ children }) => (
                                <code style={{
                                    backgroundColor: '#f5f5f5',
                                    padding: '2px 6px',
                                    borderRadius: '3px',
                                    fontFamily: 'monospace',
                                    fontSize: '13px',
                                    color: '#e91e63'
                                }}>
                                    {children}
                                </code>
                            ),
                            blockquote: ({ children }) => (
                                <blockquote style={{
                                    borderLeft: '3px solid #e0e0e0',
                                    paddingLeft: '16px',
                                    marginLeft: 0,
                                    color: '#666',
                                    fontStyle: 'italic'
                                }}>
                                    {children}
                                </blockquote>
                            )
                        }}
                    >
                        {report}
                    </ReactMarkdown>
                    {generating && (
                        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Spin indicator={antIcon} />
                            <span style={{ color: '#999', fontSize: '13px' }}>Generating analysis...</span>
                        </div>
                    )}
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
                                form.setFieldsValue({ base_url: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k' });
                            } else if (value === 'glm') {
                                form.setFieldsValue({ base_url: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4' });
                            } else if (value === 'openai') {
                                form.setFieldsValue({ base_url: 'https://api.openai.com/v1', model: 'gpt-4o' });
                            }
                        }}>
                            <Option value="openai">OpenAI</Option>
                            <Option value="kimi">Kimi (Moonshot)</Option>
                            <Option value="glm">GLM (Zhipu AI)</Option>
                            <Option value="gemini">Google Gemini</Option>
                            <Option value="custom">Custom</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="base_url" label="Base URL">
                        <Input placeholder="https://api.openai.com/v1" />
                    </Form.Item>
                    <Form.Item name="api_key" label="API Key" rules={[{ required: true }]}>
                        <Input.Password placeholder="sk-..." />
                    </Form.Item>
                    <Form.Item name="model" label="Model Name">
                        <Input placeholder="gpt-4o, etc." />
                    </Form.Item>
                    <Form.Item name="temperature" label="Temperature">
                        <Input type="number" step="0.1" min="0" max="2" />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};
