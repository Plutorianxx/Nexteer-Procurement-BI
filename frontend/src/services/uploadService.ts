import api from './api';
import type { UploadResponse, ConfirmMappingRequest, ConfirmMappingResponse } from '../types';

export const uploadService = {
    // Upload and parse file
    uploadFile: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/upload/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Confirm mapping and insert data
    confirmMapping: async (data: ConfirmMappingRequest): Promise<ConfirmMappingResponse> => {
        return api.post('/data/confirm', data);
    },
};
