import api from './api';
import type {
    UploadCostSheetResponse,
    GetCostTreeResponse,
    GetSessionsResponse,
    SessionInfo,
    CostView
} from '../types/costVariance';

export const costVarianceService = {
    /**
     * 上传成本明细表
     */
    upload: async (file: File): Promise<UploadCostSheetResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/cost-variance/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    /**
     * 获取成本树
     */
    getTree: async (sessionId: string, view: CostView = 'by_process'): Promise<GetCostTreeResponse> => {
        return api.get(`/cost-variance/tree/${sessionId}`, {
            params: { view }
        });
    },

    /**
     * 获取历史会话列表
     */
    getSessions: async (limit: number = 10): Promise<GetSessionsResponse> => {
        return api.get('/cost-variance/sessions', {
            params: { limit }
        });
    },

    /**
     * 获取单个会话信息
     */
    getSessionInfo: async (sessionId: string): Promise<SessionInfo> => {
        return api.get(`/cost-variance/session/${sessionId}`);
    },

    /**
     * 删除会话
     */
    deleteSession: async (sessionId: string): Promise<void> => {
        return api.delete(`/cost-variance/session/${sessionId}`);
    },

    /**
     * 导出Excel
     */
    exportExcel: async (sessionId: string, view: CostView = 'by_process'): Promise<void> => {
        // TODO: 实现Excel导出
        console.log('Excel export not implemented yet');
    }
};
