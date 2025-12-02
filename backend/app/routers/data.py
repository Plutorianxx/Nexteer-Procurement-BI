from fastapi import APIRouter, HTTPException
from app.schemas.data import ConfirmMappingRequest, ConfirmMappingResponse
from app.services.session_manager import SessionManager
from app.services.etl_service import ETLService
from app.services.excel_parser import ExcelParser
import base64
import io
import pandas as pd

router = APIRouter(prefix="/api/data", tags=["Data"])

session_mgr = SessionManager()
etl_service = ETLService()
parser = ExcelParser()

@router.post("/confirm", response_model=ConfirmMappingResponse)
async def confirm_mapping(request: ConfirmMappingRequest):
    """
    确认字段映射并将数据入库
    
    流程:
    1. 检查文件是否已上传（去重）
    2. 解析文件并提取 Period
    3. 创建 Session
    4. 清洗数据并转换为标准格式
    5. 批量插入数据库
    6. 更新 Session 状态
    """
    try:
        # 1. 检查去重 (已移除，允许重复上传)
        # existing_session_id = session_mgr.check_duplicate(request.file_hash)
        
        # 2. 使用 ExcelParser 解析文件（自动处理表头检测）
        file_content = base64.b64decode(request.file_content_base64)
        parse_result = parser.parse_file(file_content, request.file_name)
        
        # 重新读取 DataFrame（使用检测到的表头）
        if request.file_name.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(file_content))
        else:
            df_raw = pd.read_excel(io.BytesIO(file_content), header=None)
            header_row_idx = 0
            for idx, row in df_raw.iterrows():
                row_str = ' '.join(row.astype(str).tolist()).lower()
                if any(field in row_str for field in ['pns', 'qty', 'supplier', 'commodity']):
                    header_row_idx = idx
                    break
            df = pd.read_excel(io.BytesIO(file_content), header=header_row_idx)
        
        # 3. 提取 Period
        period = session_mgr.extract_period(df, request.file_name)
        
        # 4. 创建 Session
        session_id = session_mgr.create_session(
            file_hash=request.file_hash,
            file_name=request.file_name,
            period=period,
            total_rows=len(df)
        )
        
        # 5. 数据清洗与转换
        df_cleaned = etl_service.clean_and_transform(df, request.mapping)
        
        # 6. 批量插入
        inserted_rows = etl_service.insert_records(session_id, df_cleaned)
        
        # 7. 更新状态
        session_mgr.update_status(session_id, "completed")
        
        return ConfirmMappingResponse(
            session_id=session_id,
            period=period,
            inserted_rows=inserted_rows,
            status="completed"
        )
    
    except Exception as e:
        # 如果失败，更新 Session 状态
        if 'session_id' in locals():
            session_mgr.update_status(session_id, "failed")
        raise HTTPException(status_code=500, detail=f"ETL process failed: {str(e)}")

@router.get("/sessions/{session_id}")
async def get_session_info(session_id: str):
    """获取 Session 详细信息"""
    session = session_mgr.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.get("/records/{session_id}")
async def get_records(session_id: str):
    """获取指定 Session 的所有采购记录"""
    records = etl_service.get_records_by_session(session_id)
    return {"session_id": session_id, "records": records, "total": len(records)}
