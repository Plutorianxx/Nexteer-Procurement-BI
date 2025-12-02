import React from 'react';
import { Upload, message, Card, Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { t } from '../utils/i18n';

const { Dragger } = Upload;
const { Title } = Typography;

interface Props {
    onUploadSuccess: (file: File) => void;
    loading: boolean;
}

export const FileUploader: React.FC<Props> = ({ onUploadSuccess, loading }) => {
    const props: UploadProps = {
        name: 'file',
        multiple: false,
        showUploadList: false,
        accept: '.xlsx,.csv',
        beforeUpload: (file) => {
            const isExcelOrCsv =
                file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.type === 'text/csv' ||
                file.name.endsWith('.xlsx') ||
                file.name.endsWith('.csv');

            if (!isExcelOrCsv) {
                message.error('You can only upload Excel or CSV file!');
                return Upload.LIST_IGNORE;
            }

            // 触发父组件处理上传逻辑（我们手动调用 API，不使用 AntD 的 action）
            onUploadSuccess(file);
            return false; // 阻止自动上传
        },
    };

    return (
        <Card className="kpi-card" style={{ maxWidth: 800, margin: '0 auto', marginTop: 40 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ color: '#1A1A1A' }}>{t('upload.title')}</Title>
            </div>

            <Dragger {...props} disabled={loading} style={{ padding: 40, background: '#FAFAFA', border: '2px dashed #E0E0E0' }}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined style={{ color: '#E31837', fontSize: 48 }} />
                </p>
                <p className="ant-upload-text" style={{ fontSize: 16, color: '#2D2D2D' }}>
                    {loading ? t('upload.processing') : t('upload.drag')}
                </p>
                <p className="ant-upload-hint" style={{ color: '#9E9E9E' }}>
                    {t('upload.hint')}
                </p>
            </Dragger>
        </Card>
    );
};
