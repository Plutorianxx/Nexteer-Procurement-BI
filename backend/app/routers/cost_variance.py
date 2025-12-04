from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from typing import Optional
from app.services.cost_variance_service import CostVarianceService
from app.schemas.cost_variance import (
    UploadCostSheetResponse, GetCostTreeResponse, GetSessionsResponse, SessionInfo
)
import io

router = APIRouter(prefix="/api/cost-variance", tags=["Cost Variance Analysis"])
service = CostVarianceService()

@router.post("/upload", response_model=UploadCostSheetResponse)
async def upload_cost_sheet(file: UploadFile = File(...)):
    """
    上传成本明细表
    
    - 支持 .xlsx, .xls, .xlsm 格式
    - 基于固定行号解析
    - 返回会话ID和基本信息
    """
    try:
        # 读取文件内容
        content = await file.read()
        
        # 验证文件格式
        if not file.filename.endswith(('.xlsx', '.xls', '.xlsm')):
            raise HTTPException(
                status_code=400,
                detail="Invalid file format. Only .xlsx, .xls, and .xlsm files are supported."
            )
        
        # 处理上传
        response = service.process_upload(content, file.filename)
        
        return response
    
    except ValueError as e:
        import traceback
        traceback.print_exc()  # 打印完整堆栈
        raise HTTPException(status_code=400, detail=f"Parsing error: {str(e)}")
    except Exception as e:
        import traceback
        traceback.print_exc()  # 打印完整堆栈
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/tree/{session_id}", response_model=GetCostTreeResponse)
async def get_cost_tree(
    session_id: str,
    view: str = Query('by_process', regex='^(by_process|by_type)$')
):
    """
    获取成本树
    
    - session_id: 会话ID
    - view: 视角 ('by_process' | 'by_type')
      - by_process: 按工序分组
      - by_type: 按成本类型分组
    """
    try:
        response = service.get_cost_tree(session_id, view)
        return response
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sessions", response_model=GetSessionsResponse)
async def get_sessions(limit: int = Query(10, ge=1, le=100)):
    """
    获取历史会话列表
    
    - limit: 返回数量 (1-100)
    """
    try:
        response = service.get_sessions(limit)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/session/{session_id}", response_model=SessionInfo)
async def get_session_info(session_id: str):
    """
    获取单个会话信息
    
    - session_id: 会话ID
    """
    try:
        session_info = service.get_session_info(session_id)
        if not session_info:
            raise HTTPException(status_code=404, detail="Session not found")
        return session_info
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """
    删除会话
    
    - session_id: 会话ID
    """
    try:
        success = service.delete_session(session_id)
        if not success:
            raise HTTPException(status_code=404, detail="Session not found or deletion failed")
        return {"message": "Session deleted successfully", "session_id": session_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/excel/{session_id}")
async def export_excel(session_id: str, view: str = Query('by_process')):
    """
    导出Excel
    
    - session_id: 会话ID
    - view: 视角 (by_process | by_type)
    
    TODO: 实现Excel导出逻辑（Phase 4）
    """
    raise HTTPException(status_code=501, detail="Excel export not implemented yet")
