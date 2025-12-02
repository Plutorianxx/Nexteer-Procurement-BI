export interface ColumnMapping {
    original_header: string;
    mapped_field: string | null;
    confidence: number;
    is_mapped: boolean;
}

export interface UploadResponse {
    filename: string;
    file_hash: string;
    total_rows: number;
    columns: string[];
    mapping_suggestions: ColumnMapping[];
    preview_data: Record<string, any>[];
}

export interface ConfirmMappingRequest {
    file_hash: string;
    file_name: string;
    mapping: ColumnMapping[];
    file_content_base64: string;
}

export interface ConfirmMappingResponse {
    session_id: string;
    period: string;
    inserted_rows: number;
    status: string;
}

export const STANDARD_FIELDS = [
    { value: 'PNs', label: 'PNs (Part Number)' },
    { value: 'PartDescription', label: 'Part Description' },
    { value: 'Commodity', label: 'Commodity' },
    { value: 'Supplier', label: 'Supplier' },
    { value: 'Currency', label: 'Currency' },
    { value: 'Quantity', label: 'Quantity' },
    { value: 'Price', label: 'Price' },
    { value: 'APV', label: 'APV (Annual Purchase Value)' },
    { value: 'CoveredAPV', label: 'Covered APV' },
    { value: 'TargetCost', label: 'Target Cost' },
    { value: 'TargetSpend', label: 'Target Spend' },
    { value: 'GapToTarget', label: 'Gap to Target' },
    { value: 'Opportunity', label: 'Opportunity' },
    { value: 'GapPercent', label: 'Gap %' },
];
