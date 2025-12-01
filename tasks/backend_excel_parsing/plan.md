# 任务：后端 Excel 解析与智能映射

## 目标
实现 `/api/upload` 接口，支持 Excel 文件上传、解析、去重校验（Hash）及表头模糊匹配。

## 需求分析 (参考 PRD)
- **输入**：`.xlsx` 或 `.csv` 文件
- **处理**：
  1. **Hash校验**：计算文件 SHA256，防止重复处理（本轮仅计算，暂不查库）。
  2. **解析**：使用 Pandas 读取数据。
  3. **智能映射**：识别表头（如 "Qty" -> "Quantity"），使用 Levenshtein 距离算法。
- **输出**：JSON 响应，包含文件元数据、映射建议、前 5 行预览数据。

## 技术方案
1. **依赖**：新增 `python-Levenshtein` 用于模糊匹配。
2. **架构**：
   - `services/excel_parser.py`: 核心解析逻辑类 `ExcelParser`。
   - `routers/upload.py`: FastAPI 路由处理。
   - `schemas/upload.py`: Pydantic 模型定义响应结构。
3. **映射逻辑**：
   - 预定义标准字段：`PNs`, `Commodity`, `Supplier`, `Quantity`, `APV`, `TargetSpend`, `Opportunity`。
   - 对上传文件的每个表头，计算与标准字段的相似度。
   - 阈值 > 80% 自动匹配，否则标记为 `Unmapped`。

## 验证计划
- 创建一个测试用 Excel (`tests/sample_data.xlsx`)。
- 使用 `curl` 或 Swagger UI 上传。
- 验证返回的 JSON 结构是否包含 `mapping` 和 `preview`。
