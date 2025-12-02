export interface KPISummary {
    total_spending: number;
    spending_covered: number;
    pns_covered: number;
    suppliers_covered: number;
    total_opportunity: number;
    gap_percent: number;
}

export interface CommodityData {
    commodity: string;
    total_apv: number;
    covered_apv: number;
    total_opportunity: number;
    covered_pns: number;
    supplier_count: number;
    gap_percent: number;
}

export interface SupplierRank {
    supplier: string;
    total_apv: number;
    total_opportunity: number;
    gap_percent: number;
    main_commodity: string;
}

export interface ProjectRank {
    pns: string;
    part_desc: string;
    supplier: string;
    apv: number;
    opportunity: number;
    gap_percent: number;
}
