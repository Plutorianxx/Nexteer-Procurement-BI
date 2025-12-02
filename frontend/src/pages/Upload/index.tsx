import React, { useState } from 'react';
import { message, Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FileUploader } from '../../components/FileUploader';
import { MappingModal } from '../../components/MappingModal';
import { uploadService } from '../../services/uploadService';
import type { UploadResponse, ColumnMapping } from '../../types';
import { t } from '../../utils/i18n';

const { Content } = Layout;

export const UploadPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [file, setFile] = useState<File | null>(null);

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
                    message.success(t('mapping.success'));
                    // 跳转到 Dashboard
                    navigate(`/dashboard?session_id=${res.session_id}`);
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
