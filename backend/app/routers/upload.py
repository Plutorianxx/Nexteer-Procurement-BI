from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.excel_parser import ExcelParser
from app.schemas.upload import UploadResponse

router = APIRouter(prefix="/api/upload", tags=["Upload"])
parser = ExcelParser()

@router.post("/", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith(('.xlsx', '.csv')):
        raise HTTPException(status_code=400, detail="Only .xlsx or .csv files are supported")
    
    content = await file.read()
    try:
        result = parser.parse_file(content, file.filename)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse file: {str(e)}")
