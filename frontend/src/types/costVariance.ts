// 成本差异分析相关类型定义

export interface CostTreeNode {
    item_id: string;
    item_name: string;
    level: number;
    category: string;
    target_cost: number;
    actual_cost: number;
    variance: number;
    variance_pct: number;
    sort_order: number;
    metadata?: any;
    children: CostTreeNode[];
}

export interface SessionInfo {
    session_id: string;
    part_number: string;
    part_description: string;
    supplier_name: string;
    target_price: number;
    supplier_price: number;
    total_variance: number;
    variance_pct: number;
    upload_time: string;
    file_name: string;
}

export interface UploadCostSheetResponse {
    session_id: string;
    part_number: string;
    part_description: string;
    supplier_name: string;
    currency: string;
    target_price: number;
    supplier_price: number;
    total_variance: number;
    variance_pct: number;
}

export interface GetCostTreeResponse {
    session_id: string;
    view: 'by_process' | 'by_type';
    tree: CostTreeNode;
}

export interface GetSessionsResponse {
    sessions: SessionInfo[];
}

export type CostView = 'by_process' | 'by_type';
