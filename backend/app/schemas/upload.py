from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ColumnMapping(BaseModel):
    original_header: str
    mapped_field: Optional[str]
    confidence: float
    is_mapped: bool

class UploadResponse(BaseModel):
    filename: str
    file_hash: str
    total_rows: int
    columns: List[str]
    mapping_suggestions: List[ColumnMapping]
    preview_data: List[Dict[str, Any]]
