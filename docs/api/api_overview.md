# API 文档

## 概述

```
基础URL：/api/v1
认证：Bearer Token (除特别标注外均需认证)
响应格式：JSON
```

## 统一响应

```json
// 成功
{ "success": true, "data": {...} }

// 失败
{ "success": false, "error": { "code": "ERROR_CODE", "message": "描述" } }
```

## 认证模块

### POST /auth/login 登录
**认证**：不需要

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| email | string | ✅ | 邮箱 |
| password | string | ✅ | 密码 |

**响应**：`{ token, user }`

### POST /auth/register 注册
**认证**：不需要

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| email | string | ✅ | 邮箱 |
| password | string | ✅ | 密码(≥8位) |
| name | string | ✅ | 姓名 |

## 用户模块

### GET /users/me 获取当前用户
**响应**：`{ id, email, name, ... }`

### PUT /users/me 更新用户信息
| 参数 | 类型 | 说明 |
|-----|------|------|
| name | string | 姓名 |

## 上传模块

### POST /api/upload/ 上传 Excel/CSV 文件
**认证**：不需要  
**描述**：解析上传的 Excel 或 CSV 文件，执行智能字段映射并返回预览数据

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| file | File | ✅ | Excel (.xlsx) 或 CSV (.csv) 文件 |

**响应**：
```json
{
  "filename": "sample.xlsx",
  "file_hash": "sha256哈希值",
  "total_rows": 100,
  "columns": ["PNs", "Qty", "Supp", "Annual Spend"],
  "mapping_suggestions": [
    {
      "original_header": "Qty",
      "mapped_field": "Quantity",
      "confidence": 1.0,
      "is_mapped": true
    }
  ],
  "preview_data": [
    {"PNs": "A123", "Qty": 100, "Supp": "Supplier A"}
  ]
}
```

**错误**：
- 400: 文件格式不支持
- 500: 文件解析失败

## 数据模块

### POST /api/data/confirm 确认映射并入库
**认证**：不需要  
**描述**：用户确认字段映射后，执行数据清洗、Session 创建、批量入库

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| file_hash | string | ✅ | 文件 SHA256 哈希值 |
| file_name | string | ✅ | 文件名 |
| mapping | array | ✅ | 映射关系列表 |
| file_content_base64 | string | ✅ | Base64 编码的文件内容 |

**响应**：
```json
{
  "session_id": "uuid",
  "period": "2023",
  "inserted_rows": 100,
  "status": "completed"
}
```

**错误**：
- 400: 文件重复上传
- 500: ETL 处理失败

### GET /api/data/sessions/{session_id} 获取 Session 信息
**认证**：不需要

**响应**：
```json
{
  "session_id": "uuid",
  "period": "2023",
  "upload_time": "2025-12-02T14:00:00",
  "file_name": "sample.xlsx",
  "file_hash": "sha256...",
  "total_rows": 100,
  "status": "completed"
}
```

### GET /api/data/records/{session_id} 查询采购记录
**认证**：不需要

**响应**：
```json
{
  "session_id": "uuid",
  "records": [
    {
      "pns": "A123",
      "part_desc": "Controller Asm",
      "commodity": "Electronics",
      "supplier": "Supplier A",
      "currency": "USD",
      "quantity": 100.0,
      "price": 10.0,
      "apv": 1000.0,
      "covered_apv": 1000.0,
      "target_cost": 9.0,
      "target_spend": 900.0,
      "gap_to_target": 1.0,
      "opportunity": 100.0,
      "gap_percent": 10.0
    }
  ],
  "total": 100
}
```

## Analytics 模块

### GET /api/analytics/commodity/{session_id}/{commodity:path}/kpi 获取指定 Commodity 的 KPI
**认证**：不需要

**说明**：commodity 参数支持包含斜杠的名称（如 "E -C/P/M"）

**响应**：
```json
{
  "total_spending": 50000.0,
  "spending_covered": 45000.0,
  "pns_covered": 120,
  "suppliers_covered": 8,
  "total_opportunity": 2500.0,
  "gap_percent": 5.0
}
```

### GET /api/analytics/commodity/{session_id}/{commodity:path}/top-suppliers 获取指定 Commodity 的 Top Suppliers
**认证**：不需要

**参数**：
- `limit` (query, optional): 返回数量，默认 5

**响应**：
```json
[
  {
    "supplier": "Supplier A",
    "total_apv": 30000.0,
    "total_opportunity": 1500.0,
    "gap_percent": 5.0
  }
]
```

### GET /api/analytics/supplier/{session_id}/{supplier:path}/top-pns 获取指定 Supplier 的 Top PNs
**认证**：不需要

**参数**：
- `limit` (query, optional): 返回数量，默认 10

**响应**：
```json
[
  {
    "pns": "A123",
    "part_desc": "Controller Asm",
    "opportunity": 500.0,
    "gap_percent": 10.0
  }
]
```


### GET /api/analytics/opportunity-matrix/{session_id} 获取象限分析数据
**认证**：不需要

**参数**：
- `commodity` (query, optional): 过滤特定 Commodity

**响应**：
```json
[
  {
    "pns": "A123",
    "part_desc": "Controller",
    "supplier": "Supplier A",
    "commodity": "Electronics",
    "apv": 50000.0,
    "gap_percent": 15.0,
    "opportunity": 7500.0
  }
]
```

### GET /api/analytics/concentration/{session_id} 获取供应商集中度
**认证**：不需要

**参数**：
- `commodity` (query, optional): 过滤特定 Commodity

**响应**：
```json
{
  "cr3": 65.5,
  "cr5": 80.2,
  "total_suppliers": 20,
  "total_apv": 1000000.0,
  "top_suppliers": [
    {
      "supplier": "Supplier A",
      "apv": 300000.0,
      "share": 30.0
    }
  ]
}
```


### POST /api/llm/generate-report 生成智能报告
**认证**：不需要 (API Key 在请求体中)

**请求体**：
```json
{
  "session_id": "uuid",
  "context_type": "dashboard", // dashboard, commodity, supplier
  "context_value": "Electronics", // 可选
  "config": {
    "provider": "openai",
    "api_key": "sk-...",
    "base_url": "https://api.openai.com/v1",
    "model": "gpt-4o",
    "temperature": 0.7
  }
}
```

**响应**：
- Content-Type: `text/event-stream`
- 流式返回 Markdown 文本块

## 错误码

| 错误码 | HTTP状态 | 说明 |
|-------|---------|------|
| UNAUTHORIZED | 401 | 未认证 |
| FORBIDDEN | 403 | 无权限 |
| NOT_FOUND | 404 | 资源不存在 |
| VALIDATION_ERROR | 400 | 参数验证失败 |
