import json
from typing import AsyncGenerator, Any
from openai import AsyncOpenAI
from app.services.analytics_service import AnalyticsService
from app.schemas.llm import LLMConfig

class LLMService:
    def __init__(self):
        self.analytics = AnalyticsService()

    def _get_system_prompt(self) -> str:
        return """You are an expert Procurement Analyst for Nexteer Automotive. 
Your task is to analyze procurement data and provide a professional Executive Summary.
Focus on:
1. Key Spending & Coverage (Identify major spend areas)
2. Cost Reduction Opportunities (Gap to Target)
3. Supply Chain Risks (Concentration, Single Source)
4. Actionable Recommendations

Format your response in Markdown. Use bolding for key metrics.
Keep it concise, professional, and data-driven.
"""

    async def _fetch_context_data(self, session_id: str, context_type: str, context_value: str = None) -> str:
        """
        根据上下文类型获取结构化数据，并转换为 JSON 字符串供 LLM 分析
        """
        data = {}
        
        if context_type == "dashboard":
            # 获取全局数据
            kpi = self.analytics.get_kpi_summary(session_id)
            commodities = self.analytics.get_commodity_overview(session_id)
            top_suppliers = self.analytics.get_top_suppliers(session_id, limit=5)
            concentration = self.analytics.get_supplier_concentration(session_id)
            matrix_stats = self.analytics.get_matrix_stats(session_id)
            
            data = {
                "scope": "Global Dashboard",
                "kpi": kpi,
                "top_commodities": commodities[:5], # 只取前5个关键品类
                "top_suppliers_by_opportunity": top_suppliers,
                "supplier_concentration": concentration,
                "matrix_quadrant_stats": matrix_stats
            }
            
        elif context_type == "commodity":
            # 获取品类数据
            commodity = context_value
            kpi = self.analytics.get_commodity_kpi(session_id, commodity)
            top_suppliers = self.analytics.get_commodity_top_suppliers(session_id, commodity, limit=5)
            matrix = self.analytics.get_opportunity_matrix(session_id, commodity)
            concentration = self.analytics.get_supplier_concentration(session_id, commodity)
            matrix_stats = self.analytics.get_matrix_stats(session_id, commodity)
            
            # 简化 Matrix 数据，只取 Opportunity 最大的前 10 个点
            top_opportunities = sorted(matrix, key=lambda x: x['opportunity'], reverse=True)[:10]
            
            data = {
                "scope": f"Commodity: {commodity}",
                "kpi": kpi,
                "top_suppliers": top_suppliers,
                "top_opportunities_pns": top_opportunities,
                "concentration": concentration,
                "matrix_quadrant_stats": matrix_stats,
                "coverage": {
                    "spend_covered": kpi.get("spending_covered", 0),
                    "total_spend": kpi.get("total_spending", 0),
                    "coverage_percent": (kpi.get("spending_covered", 0) / kpi.get("total_spending", 1)) * 100 if kpi.get("total_spending", 0) > 0 else 0
                }
            }

        return json.dumps(data, indent=2, ensure_ascii=False)

    async def generate_report_stream(self, session_id: str, context_type: str, context_value: str, config: LLMConfig, prompt_template: str = None) -> AsyncGenerator[str, None]:
        """
        生成流式报告
        """
        # 1. 获取数据上下文
        context_data = await self._fetch_context_data(session_id, context_type, context_value)
        
        # 2. 初始化 OpenAI Client (支持兼容接口)
        client = AsyncOpenAI(
            api_key=config.api_key,
            base_url=config.base_url if config.base_url else "https://api.openai.com/v1"
        )
        
        # 3. 构建 Prompt
        if prompt_template:
            # 使用用户自定义 Prompt
            user_prompt = f"""
{prompt_template}

Data Context:
```json
{context_data}
```
"""
        else:
            # 使用默认 Prompt
            user_prompt = f"""
Please analyze the following procurement data and generate an executive summary:

Data Context:
```json
{context_data}
```

Structure the report as follows:
## Executive Summary
### 1. Overview
(Summarize total spend, coverage, and overall health)

### 2. Key Opportunities
(Highlight top opportunities for cost reduction. Mention specific commodities or suppliers if relevant)

### 3. Risk Assessment
(Analyze supplier concentration and other risks)

### 4. Strategic Recommendations
(3-4 bullet points on what to do next)
"""

        # 4. 调用 LLM
        try:
            stream = await client.chat.completions.create(
                model=config.model,
                messages=[
                    {"role": "system", "content": self._get_system_prompt()},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=config.temperature,
                stream=True
            )

            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            yield f"\n\n**Error generating report:** {str(e)}"
