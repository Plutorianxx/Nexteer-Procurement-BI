from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])
service = AnalyticsService()

@router.get("/summary/{session_id}")
async def get_kpi_summary(session_id: str):
    """获取 Session 的 6 大核心 KPI"""
    try:
        return service.get_kpi_summary(session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/commodity/{session_id}")
async def get_commodity_overview(session_id: str):
    """获取按 Commodity 分组的概览数据"""
    try:
        return service.get_commodity_overview(session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/top/suppliers/{session_id}")
async def get_top_suppliers(session_id: str, limit: int = 20):
    """获取 Top Suppliers 列表"""
    try:
        return service.get_top_suppliers(session_id, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/top/projects/{session_id}")
async def get_top_projects(session_id: str, limit: int = 20):
    """获取 Top Projects (PNs) 列表"""
    try:
        return service.get_top_projects(session_id, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/commodity/{session_id}/{commodity:path}/kpi")
async def get_commodity_kpi(session_id: str, commodity: str):
    """获取指定 Commodity 的 KPI 汇总"""
    try:
        return service.get_commodity_kpi(session_id, commodity)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/commodity/{session_id}/{commodity:path}/top-suppliers")
async def get_commodity_top_suppliers(session_id: str, commodity: str, limit: int = 5):
    """获取指定 Commodity 的 Top Suppliers"""
    try:
        return service.get_commodity_top_suppliers(session_id, commodity, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/supplier/{session_id}/{supplier:path}/top-pns")
async def get_supplier_top_pns(session_id: str, supplier: str, limit: int = 10):
    """获取指定 Supplier 的 Top PNs"""
    try:
        return service.get_supplier_top_pns(session_id, supplier, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/opportunity-matrix/{session_id}")
async def get_opportunity_matrix(session_id: str, commodity: str = Query(None)):
    """获取象限分析数据 (Opportunity Matrix)"""
    try:
        return service.get_opportunity_matrix(session_id, commodity)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/concentration/{session_id}")
async def get_supplier_concentration(session_id: str, commodity: str = Query(None)):
    """获取供应商集中度 (CR3, CR5)"""
    try:
        return service.get_supplier_concentration(session_id, commodity)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

