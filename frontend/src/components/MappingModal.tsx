import React, { useState, useEffect } from 'react';
import { Modal, Table, Select, Tag, Button, Typography } from 'antd';
import type { ColumnMapping, UploadResponse } from '../types';
import { STANDARD_FIELDS } from '../types';
import { t } from '../utils/i18n';

const { Text } = Typography;

interface Props {
    visible: boolean;
    uploadData: UploadResponse | null;
    onConfirm: (mapping: ColumnMapping[]) => void;
    onCancel: () => void;
    confirmLoading: boolean;
}

export const MappingModal: React.FC<Props> = ({
    visible,
    uploadData,
    onConfirm,
    onCancel,
    confirmLoading
}) => {
    const [dataSource, setDataSource] = useState<ColumnMapping[]>([]);

    useEffect(() => {
        if (uploadData) {
            setDataSource(uploadData.mapping_suggestions);
        }
    }, [uploadData]);

    const handleFieldChange = (originalHeader: string, newField: string | null) => {
        setDataSource(prev => prev.map(item => {
            if (item.original_header === originalHeader) {
                return {
                    ...item,
                    mapped_field: newField,
                    is_mapped: !!newField
                };
            }
            return item;
        }));
    };

    const columns = [
        {
            title: t('mapping.original'),
            dataIndex: 'original_header',
            key: 'original_header',
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: t('mapping.sample'),
            key: 'sample',
            render: (_: any, record: ColumnMapping) => {
                // 从 preview_data 中获取第一行的对应值
                const sampleValue = uploadData?.preview_data[0]?.[record.original_header];
                return <Text type="secondary" style={{ fontFamily: 'Roboto Mono' }}>{String(sampleValue || '-')}</Text>;
            }
        },
        {
            title: t('mapping.target'),
            key: 'mapped_field',
            render: (_: any, record: ColumnMapping) => (
                <Select
                    style={{ width: 200 }}
                    value={record.mapped_field}
                    onChange={(val) => handleFieldChange(record.original_header, val)}
                    allowClear
                    placeholder="Select field"
                >
                    {STANDARD_FIELDS.map(field => (
                        <Select.Option key={field.value} value={field.value}>
                            {field.label}
                        </Select.Option>
                    ))}
                </Select>
            ),
        },
        {
            title: t('mapping.confidence'),
            dataIndex: 'confidence',
            key: 'confidence',
            render: (val: number) => {
                let color = 'default';
                if (val >= 0.8) color = 'success';
                else if (val >= 0.5) color = 'warning';
                return <Tag color={color}>{(val * 100).toFixed(0)}%</Tag>;
            }
        },
    ];

    return (
        <Modal
            title={t('mapping.title')}
            open={visible}
            onCancel={onCancel}
            width={800}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    {t('mapping.cancel')}
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={confirmLoading}
                    onClick={() => onConfirm(dataSource)}
                    style={{ background: '#E31837', borderColor: '#E31837' }}
                >
                    {t('mapping.confirm')}
                </Button>,
            ]}
        >
            <p>{t('mapping.desc')}</p>
            <Table
                dataSource={dataSource}
                columns={columns}
                rowKey="original_header"
                pagination={false}
                size="small"
            />
        </Modal>
    );
};
