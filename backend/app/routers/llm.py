from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.schemas.llm import ReportRequest
from app.services.llm_service import LLMService

router = APIRouter(prefix="/api/llm", tags=["LLM"])
service = LLMService()

@router.post("/generate-report")
async def generate_report(request: ReportRequest):
    """
    生成智能分析报告 (流式响应)
    """
    try:
        return StreamingResponse(
            service.generate_report_stream(
                request.session_id,
                request.context_type,
                request.context_value,
                request.config
            ),
            media_type="text/event-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
