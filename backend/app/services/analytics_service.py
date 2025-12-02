from typing import Dict, List, Any
from app.database.init import get_connection
import duckdb

class AnalyticsService:
    def __init__(self):
        self.conn = get_connection()

    def get_kpi_summary(self, session_id: str) -> Dict[str, Any]:
        """
        计算 6 大核心 KPI
        """
        query = """
        SELECT 
            SUM(apv) as total_spending,
            SUM(covered_apv) as spending_covered,
            COUNT(DISTINCT CASE WHEN covered_apv > 0 THEN pns END) as pns_covered,
            COUNT(DISTINCT CASE WHEN covered_apv > 0 THEN supplier END) as suppliers_covered,
            SUM(opportunity) as total_opportunity,
            CASE 
                WHEN SUM(apv) > 0 THEN (SUM(opportunity) / SUM(apv)) * 100 
                ELSE 0 
            END as gap_percent
        FROM procurement_records
        WHERE session_id = ?
        """
        result = self.conn.execute(query, [session_id]).fetchone()
        
        return {
            "total_spending": float(result[0] or 0),
            "spending_covered": float(result[1] or 0),
            "pns_covered": int(result[2] or 0),
            "suppliers_covered": int(result[3] or 0),
            "total_opportunity": float(result[4] or 0),
            "gap_percent": float(result[5] or 0)
        }

    def get_commodity_overview(self, session_id: str) -> List[Dict[str, Any]]:
        """
        按 Commodity 分组的概览数据 (图表 + 表格)
        """
        query = """
        SELECT 
            commodity,
            SUM(apv) as total_apv,
            SUM(covered_apv) as covered_apv,
            SUM(opportunity) as total_opportunity,
            COUNT(DISTINCT pns) as covered_pns,
            COUNT(DISTINCT supplier) as supplier_count,
            CASE 
                WHEN SUM(apv) > 0 THEN (SUM(opportunity) / SUM(apv)) * 100 
                ELSE 0 
            END as gap_percent
        FROM procurement_records
        WHERE session_id = ?
        GROUP BY commodity
        ORDER BY total_apv DESC
        """
        results = self.conn.execute(query, [session_id]).fetchall()
        
        return [
            {
                "commodity": row[0],
                "total_apv": float(row[1] or 0),
                "covered_apv": float(row[2] or 0),
                "total_opportunity": float(row[3] or 0),
                "covered_pns": int(row[4] or 0),
                "supplier_count": int(row[5] or 0),
                "gap_percent": float(row[6] or 0)
            }
            for row in results
        ]

    def get_top_suppliers(self, session_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Top Suppliers 列表 (按 Opportunity 排序)
        """
        query = """
        SELECT 
            supplier,
            SUM(apv) as total_apv,
            SUM(opportunity) as total_opportunity,
            CASE 
                WHEN SUM(apv) > 0 THEN (SUM(opportunity) / SUM(apv)) * 100 
                ELSE 0 
            END as gap_percent,
            -- 主营 Commodity (取 APV 最大的那个)
            arg_max(commodity, apv) as main_commodity
        FROM procurement_records
        WHERE session_id = ?
        GROUP BY supplier
        ORDER BY total_opportunity DESC
        LIMIT ?
        """
        results = self.conn.execute(query, [session_id, limit]).fetchall()
        
        return [
            {
                "supplier": row[0],
                "total_apv": float(row[1] or 0),
                "total_opportunity": float(row[2] or 0),
                "gap_percent": float(row[3] or 0),
                "main_commodity": row[4]
            }
            for row in results
        ]

    def get_top_projects(self, session_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Top Projects (PNs) 列表 (按 Opportunity 排序)
        """
        query = """
        SELECT 
            pns,
            part_desc,
            supplier,
            apv,
            opportunity,
            gap_percent
        FROM procurement_records
        WHERE session_id = ?
        ORDER BY opportunity DESC
        LIMIT ?
        """
        results = self.conn.execute(query, [session_id, limit]).fetchall()
        
        return [
            {
                "pns": row[0],
                "part_desc": row[1],
                "supplier": row[2],
                "apv": float(row[3] or 0),
                "opportunity": float(row[4] or 0),
                "gap_percent": float(row[5] or 0)
            }
            for row in results
        ]

    def get_commodity_kpi(self, session_id: str, commodity: str) -> Dict[str, Any]:
        """
        获取指定 Commodity 的 KPI 汇总
        """
        query = """
        SELECT 
            SUM(apv) as total_spending,
            SUM(covered_apv) as spending_covered,
            COUNT(DISTINCT CASE WHEN covered_apv > 0 THEN pns END) as pns_covered,
            COUNT(DISTINCT CASE WHEN covered_apv > 0 THEN supplier END) as suppliers_covered,
            SUM(opportunity) as total_opportunity,
            CASE 
                WHEN SUM(apv) > 0 THEN (SUM(opportunity) / SUM(apv)) * 100 
                ELSE 0 
            END as gap_percent
        FROM procurement_records
        WHERE session_id = ? AND commodity = ?
        """
        result = self.conn.execute(query, [session_id, commodity]).fetchone()
        
        return {
            "total_spending": float(result[0] or 0),
            "spending_covered": float(result[1] or 0),
            "pns_covered": int(result[2] or 0),
            "suppliers_covered": int(result[3] or 0),
            "total_opportunity": float(result[4] or 0),
            "gap_percent": float(result[5] or 0)
        }

    def get_commodity_top_suppliers(self, session_id: str, commodity: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        获取指定 Commodity 的 Top Suppliers (按 Opportunity 排序)
        """
        query = """
        SELECT 
            supplier,
            SUM(apv) as total_apv,
            SUM(opportunity) as total_opportunity,
            CASE 
                WHEN SUM(apv) > 0 THEN (SUM(opportunity) / SUM(apv)) * 100 
                ELSE 0 
            END as gap_percent
        FROM procurement_records
        WHERE session_id = ? AND commodity = ?
        GROUP BY supplier
        ORDER BY total_opportunity DESC
        LIMIT ?
        """
        results = self.conn.execute(query, [session_id, commodity, limit]).fetchall()
        
        return [
            {
                "supplier": row[0],
                "total_apv": float(row[1] or 0),
                "total_opportunity": float(row[2] or 0),
                "gap_percent": float(row[3] or 0)
            }
            for row in results
        ]

    def get_supplier_top_pns(self, session_id: str, supplier: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        获取指定 Supplier 的 Top PNs (按 Opportunity 排序)
        """
        query = """
        SELECT 
            pns,
            part_desc,
            opportunity,
            gap_percent
        FROM procurement_records
        WHERE session_id = ? AND supplier = ?
        ORDER BY opportunity DESC
        LIMIT ?
        """
        results = self.conn.execute(query, [session_id, supplier, limit]).fetchall()
        
        return [
            {
                "pns": row[0],
                "part_desc": row[1],
                "opportunity": float(row[2] or 0),
                "gap_percent": float(row[3] or 0)
            }
            for row in results
        ]
