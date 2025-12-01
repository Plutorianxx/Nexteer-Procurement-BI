# 上下文信息

## 关键文件
- `backend/app/main.py`: 入口
- `prd.md`: 数据需求定义

## 标准字段定义 (Standard Schema)
根据 PRD 5.0 数据需求：
- `PNs` (主键)
- `Commodity`
- `Supplier`
- `Quantity`
- `APV` (Annual Purchase Value)
- `TargetSpend`
- `Opportunity` (Calculated or Uploaded)

## 模糊匹配规则
- 库：`Levenshtein`
- 阈值：Ratio > 0.8
- 忽略大小写
