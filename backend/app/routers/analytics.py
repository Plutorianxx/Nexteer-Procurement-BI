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
