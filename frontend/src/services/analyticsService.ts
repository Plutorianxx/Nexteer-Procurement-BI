import api from './api';
import type { KPISummary, CommodityData, SupplierRank, ProjectRank } from '../types/analytics';

export const analyticsService = {
    getSummary: async (sessionId: string): Promise<KPISummary> => {
        return api.get(`/analytics/summary/${sessionId}`);
    },

    getCommodityOverview: async (sessionId: string): Promise<CommodityData[]> => {
        return api.get(`/analytics/commodity/${sessionId}`);
    },

    getTopSuppliers: async (sessionId: string, limit: number = 20): Promise<SupplierRank[]> => {
        return api.get(`/analytics/top/suppliers/${sessionId}`, { params: { limit } });
    },

    getTopProjects: async (sessionId: string, limit: number = 20): Promise<ProjectRank[]> => {
        return api.get(`/analytics/top/projects/${sessionId}`, { params: { limit } });
    },

    getCommodityKPI: async (sessionId: string, commodity: string): Promise<KPISummary> => {
        return api.get(`/analytics/commodity/${sessionId}/${encodeURIComponent(commodity)}/kpi`);
    },

    getCommodityTopSuppliers: async (sessionId: string, commodity: string, limit: number = 5) => {
        return api.get(`/analytics/commodity/${sessionId}/${encodeURIComponent(commodity)}/top-suppliers`, { params: { limit } });
    },

    getSupplierTopPNs: async (sessionId: string, supplier: string, limit: number = 10) => {
        return api.get(`/analytics/supplier/${sessionId}/${encodeURIComponent(supplier)}/top-pns`, { params: { limit } });
    }
};
