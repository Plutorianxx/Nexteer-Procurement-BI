from pydantic import BaseModel
from typing import List, Dict, Any

class ConfirmMappingRequest(BaseModel):
    file_hash: str
    file_name: str
    mapping: List[Dict[str, Any]]  # 映射关系
    file_content_base64: str  # Base64 编码的文件内容

class ConfirmMappingResponse(BaseModel):
    session_id: str
    period: str
    inserted_rows: int
    status: str
