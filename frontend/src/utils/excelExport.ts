import * as XLSX from 'xlsx';
import type { KPISummary, CommodityData, SupplierRank, ProjectRank } from '../types/analytics';

/**
 * Dashboard 全局数据导出
 */
export const exportDashboardToExcel = (
    sessionId: string,
    kpi: KPISummary,
    commodities: CommodityData[],
    suppliers: SupplierRank[],
    projects: ProjectRank[],
    matrixData: any[],
    concentrationData: any
) => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: KPI Summary
    const kpiData = [
        ['Metric', 'Value'],
        ['Total Spending', `$${kpi.total_spending.toLocaleString()}`],
        ['Spending Covered', `$${kpi.spending_covered.toLocaleString()}`],
        ['PNs Covered', kpi.pns_covered],
        ['Suppliers Covered', kpi.suppliers_covered],
        ['Total Opportunity', `$${kpi.total_opportunity.toLocaleString()}`],
        ['Gap %', `${kpi.gap_percent.toFixed(2)}%`]
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(kpiData);
    ws1['!cols'] = [{ wch: 20 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws1, 'KPI Summary');

    // Sheet 2: Top Commodities
    const commodityHeaders = ['Commodity', 'Total APV', 'Covered APV', 'Total Opportunity', 'Covered PNs', 'Supplier Count', 'Gap %'];
    const commodityRows = commodities.map(c => [
        c.commodity,
        c.total_apv,
        c.covered_apv,
        c.total_opportunity,
        c.covered_pns,
        c.supplier_count,
        c.gap_percent
    ]);
    const ws2 = XLSX.utils.aoa_to_sheet([commodityHeaders, ...commodityRows]);
    ws2['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 12 }, { wch: 15 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Top Commodities');

    // Sheet 3: Top Suppliers
    const supplierHeaders = ['Supplier', 'Total APV', 'Total Opportunity', 'Gap %', 'Main Commodity'];
    const supplierRows = suppliers.map(s => [
        s.supplier,
        s.total_apv,
        s.total_opportunity,
        s.gap_percent,
        s.main_commodity
    ]);
    const ws3 = XLSX.utils.aoa_to_sheet([supplierHeaders, ...supplierRows]);
    ws3['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 18 }, { wch: 10 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws3, 'Top Suppliers');

    // Sheet 4: Top Projects (PNs)
    const projectHeaders = ['PNs', 'Part Description', 'Supplier', 'APV', 'Opportunity', 'Gap %'];
    const projectRows = projects.map(p => [
        p.pns,
        p.part_desc,
        p.supplier,
        p.apv,
        p.opportunity,
        p.gap_percent
    ]);
    const ws4 = XLSX.utils.aoa_to_sheet([projectHeaders, ...projectRows]);
    ws4['!cols'] = [{ wch: 15 }, { wch: 35 }, { wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws4, 'Top Projects');

    // Sheet 5: Opportunity Matrix (Top 100)
    const matrixHeaders = ['PNs', 'Part Description', 'Supplier', 'Commodity', 'APV', 'Gap %', 'Opportunity'];
    const matrixRows = matrixData.slice(0, 100).map(m => [
        m.pns,
        m.part_desc,
        m.supplier,
        m.commodity,
        m.apv,
        m.gap_percent,
        m.opportunity
    ]);
    const ws5 = XLSX.utils.aoa_to_sheet([matrixHeaders, ...matrixRows]);
    ws5['!cols'] = [{ wch: 15 }, { wch: 35 }, { wch: 25 }, { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws5, 'Opportunity Matrix');

    // Sheet 6: Concentration Analysis
    const concentrationRows = [
        ['CR3 (%)', concentrationData?.cr3?.toFixed(2) || 'N/A'],
        ['CR5 (%)', concentrationData?.cr5?.toFixed(2) || 'N/A'],
        ['Total Suppliers', concentrationData?.total_suppliers || 0],
        ['Total APV', concentrationData?.total_apv || 0],
        ['', ''],
        ['Top Suppliers Breakdown', ''],
        ['Supplier', 'APV', 'Share (%)']
    ];

    if (concentrationData?.top_suppliers) {
        concentrationData.top_suppliers.forEach((s: any) => {
            concentrationRows.push([s.supplier, s.apv, s.share?.toFixed(2)]);
        });
    }

    const ws6 = XLSX.utils.aoa_to_sheet(concentrationRows);
    ws6['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws6, 'Concentration');

    // 下载文件
    const fileName = `Dashboard_Export_${sessionId}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
};

/**
 * Commodity Detail 数据导出
 */
export const exportCommodityToExcel = (
    sessionId: string,
    commodityName: string,
    kpi: any,
    topSuppliers: any[],
    supplierPNs: Record<string, any[]>,
    matrixData: any[],
    concentrationData: any
) => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Commodity KPI
    const kpiData = [
        ['Metric', 'Value'],
        ['Commodity', commodityName],
        ['Total Spending', `$${kpi?.total_spending?.toLocaleString() || 0}`],
        ['Spending Covered', `$${kpi?.spending_covered?.toLocaleString() || 0}`],
        ['PNs Covered', kpi?.pns_covered || 0],
        ['Suppliers Covered', kpi?.suppliers_covered || 0],
        ['Total Opportunity', `$${kpi?.total_opportunity?.toLocaleString() || 0}`],
        ['Gap %', `${kpi?.gap_percent?.toFixed(2) || 0}%`]
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(kpiData);
    ws1['!cols'] = [{ wch: 20 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, ws1, 'Commodity KPI');

    // Sheet 2: Top 5 Suppliers
    const supplierHeaders = ['Supplier', 'Total APV', 'Total Opportunity', 'Gap %'];
    const supplierRows = topSuppliers.map(s => [
        s.supplier,
        s.total_apv,
        s.total_opportunity,
        s.gap_percent
    ]);
    const ws2 = XLSX.utils.aoa_to_sheet([supplierHeaders, ...supplierRows]);
    ws2['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 18 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Top 5 Suppliers');

    // Sheet 3: All Top PNs (合并所有供应商的 Top PNs)
    const allPNs: any[] = [];
    Object.entries(supplierPNs).forEach(([supplier, pns]) => {
        pns.forEach(pn => {
            allPNs.push({
                supplier,
                pns: pn.pns,
                part_desc: pn.part_desc,
                opportunity: pn.opportunity,
                gap_percent: pn.gap_percent
            });
        });
    });

    // 按 Opportunity 排序
    allPNs.sort((a, b) => b.opportunity - a.opportunity);

    const pnHeaders = ['Supplier', 'PNs', 'Part Description', 'Opportunity', 'Gap %'];
    const pnRows = allPNs.map(p => [
        p.supplier,
        p.pns,
        p.part_desc,
        p.opportunity,
        p.gap_percent
    ]);
    const ws3 = XLSX.utils.aoa_to_sheet([pnHeaders, ...pnRows]);
    ws3['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 40 }, { wch: 15 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws3, 'All Top PNs');

    // Sheet 4: Opportunity Matrix (该品类的所有零件)
    const matrixHeaders = ['PNs', 'Part Description', 'Supplier', 'APV', 'Gap %', 'Opportunity'];
    const matrixRows = matrixData.map(m => [
        m.pns,
        m.part_desc,
        m.supplier,
        m.apv,
        m.gap_percent,
        m.opportunity
    ]);
    const ws4 = XLSX.utils.aoa_to_sheet([matrixHeaders, ...matrixRows]);
    ws4['!cols'] = [{ wch: 15 }, { wch: 40 }, { wch: 30 }, { wch: 12 }, { wch: 10 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws4, 'Opportunity Matrix');

    // Sheet 5: Concentration
    const concentrationRows = [
        ['CR3 (%)', concentrationData?.cr3?.toFixed(2) || 'N/A'],
        ['CR5 (%)', concentrationData?.cr5?.toFixed(2) || 'N/A'],
        ['Total Suppliers', concentrationData?.total_suppliers || 0],
        ['Total APV', concentrationData?.total_apv || 0],
        ['', ''],
        ['Top Suppliers Breakdown', ''],
        ['Supplier', 'APV', 'Share (%)']
    ];

    if (concentrationData?.top_suppliers) {
        concentrationData.top_suppliers.forEach((s: any) => {
            concentrationRows.push([s.supplier, s.apv, s.share?.toFixed(2)]);
        });
    }

    const ws5 = XLSX.utils.aoa_to_sheet(concentrationRows);
    ws5['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws5, 'Concentration');

    // 下载文件
    const fileName = `${commodityName}_Export_${sessionId}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
};
