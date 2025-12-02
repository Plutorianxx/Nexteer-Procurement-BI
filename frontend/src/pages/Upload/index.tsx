import React, { useState } from 'react';
import { message, Layout, Result, Button } from 'antd';
import { FileUploader } from '../../components/FileUploader';
import { MappingModal } from '../../components/MappingModal';
import { uploadService } from '../../services/uploadService';
import type { UploadResponse, ColumnMapping } from '../../types';
import { t } from '../../utils/i18n';

const { Content } = Layout;

export const UploadPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [successResult, setSuccessResult] = useState<{ sessionId: string, insertedRows: number } | null>(null);

    const handleUpload = async (uploadedFile: File) => {
        setLoading(true);
        setFile(uploadedFile);
        try {
            const res = await uploadService.uploadFile(uploadedFile);
            setUploadData(res);
            setModalVisible(true);
        } catch (error: any) {
            message.error(error.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmMapping = async (mapping: ColumnMapping[]) => {
        if (!uploadData || !file) return;

        setLoading(true);
        try {
            // Convert file to base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Content = (reader.result as string).split(',')[1];

                try {
                    const res = await uploadService.confirmMapping({
                        file_hash: uploadData.file_hash,
                        file_name: uploadData.filename,
                        mapping: mapping,
                        file_content_base64: base64Content
                    });

                    setModalVisible(false);
                    setSuccessResult({
                        sessionId: res.session_id,
                        insertedRows: res.inserted_rows
                    });
                    message.success(t('mapping.success'));
                } catch (error: any) {
                    message.error(error.message || t('common.error'));
                } finally {
                    setLoading(false);
                }
            };
        } catch (error) {
            setLoading(false);
            message.error('File processing failed');
        }
    };

    if (successResult) {
        return (
            <Result
                status="success"
                title={t('mapping.success')}
                subTitle={`Session ID: ${successResult.sessionId}, Inserted Rows: ${successResult.insertedRows}`}
                extra={[
                    <Button type="primary" key="console" style={{ background: '#E31837' }} onClick={() => setSuccessResult(null)}>
                        Upload Another File
                    </Button>,
                ]}
            />
        );
    }

    return (
        <Layout style={{ minHeight: '100vh', background: '#F5F5F5' }}>
            <Content style={{ padding: '50px' }}>
                <FileUploader onUploadSuccess={handleUpload} loading={loading} />

                <MappingModal
                    visible={modalVisible}
                    uploadData={uploadData}
                    onConfirm={handleConfirmMapping}
                    onCancel={() => setModalVisible(false)}
                    confirmLoading={loading}
                />
            </Content>
        </Layout>
    );
};
