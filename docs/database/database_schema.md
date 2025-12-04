# 数据库架构

## 概述

```
数据库：DuckDB (OLAP、嵌入式)
存储路径：backend/data/procurement.duckdb
命名规范：表名小写复数，字段小写下划线
```

## 表结构

### sessions 会话元数据表

| 字段 | 类型 | 约束 | 说明 |
|-----|------|------|------|
| session_id | VARCHAR | PK | 会话唯一标识 (UUID) |
| period | VARCHAR | | 数据期间（如 "2023"） |
| upload_time | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 上传时间 |
| file_name | VARCHAR | | 文件名 |
| file_hash | VARCHAR | UNIQUE | 文件 SHA256 哈希值（去重） |
| total_rows | INTEGER | | 总行数 |
| status | VARCHAR | DEFAULT 'pending' | 状态（pending/completed/failed） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**索引**：file_hash (唯一)

### procurement_records 采购记录表

| 字段 | 类型 | 约束 | 说明 |
|-----|------|------|------|
| session_id | VARCHAR | PK (复合) | 关联的会话 ID |
| pns | VARCHAR | PK (复合) | 零件号（主键） |
| part_desc | VARCHAR | | 零件名称 (中英文) |
| commodity | VARCHAR | | 品类 |
| supplier | VARCHAR | | 供应商 |
| currency | VARCHAR | | 币种 |
| quantity | DECIMAL(15,2) | | 数量 |
| price | DECIMAL(15,2) | | 单价 |
| apv | DECIMAL(15,2) | | 年度采购额 (Annual Purchase Value) |
| covered_apv | DECIMAL(15,2) | | 覆盖分析的采购额 |
| target_cost | DECIMAL(15,2) | | 目标单价 |
| target_spend | DECIMAL(15,2) | | 目标支出 |
| gap_to_target | DECIMAL(15,2) | | 单价差异 |
| opportunity | DECIMAL(15,2) | | 机会金额 |
| gap_percent | DECIMAL(5,2) | Gap % | 差异百分比 |
| created_at | TIMESTAMP | | 创建时间 |

**主键**：`(session_id, pns, supplier)` (支持同一零件由多个供应商供应)  
**外键**：session_id → sessions.session_id

### part_cost_sessions 成本分析会话表 (Phase 5)

| 字段 | 类型 | 约束 | 说明 |
|-----|------|------|------|
| session_id | VARCHAR | PK | 会话唯一标识 (UUID) |
| part_number | VARCHAR | | 零件号 |
| part_description | VARCHAR | | 零件描述 |
| supplier_name | VARCHAR | | 供应商名称 |
| currency | VARCHAR | | 币种 |
| target_price | DECIMAL(15,2) | | 目标价格 |
| supplier_price | DECIMAL(15,2) | | 供应商报价 |
| total_variance | DECIMAL(15,2) | | 总差异金额 |
| variance_pct | DECIMAL(5,2) | | 差异百分比 |
| upload_time | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 上传时间 |
| file_name | VARCHAR | | 原始文件名 |
| file_hash | VARCHAR | | 文件哈希 |

### cost_items 成本树明细表 (Phase 5)

| 字段 | 类型 | 约束 | 说明 |
|-----|------|------|------|
| id | BIGINT | PK | 唯一标识 (Hash生成) |
| session_id | VARCHAR | FK | 关联会话ID |
| item_id | VARCHAR | | 成本项ID (如 MAT_001) |
| parent_id | VARCHAR | | 父节点ID |
| level | INTEGER | | 树层级 (1-5) |
| category | VARCHAR | | 类别 (Material/Process/etc) |
| item_name | VARCHAR | | 项目名称 |
| target_cost | DECIMAL(15,2) | | 目标成本 |
| actual_cost | DECIMAL(15,2) | | 实际成本 |
| variance | DECIMAL(15,2) | | 差异金额 |
| variance_pct | DECIMAL(5,2) | | 差异百分比 |
| sort_order | INTEGER | | 排序索引 |
| metadata | JSON | | 额外元数据 |

**外键**：session_id → part_cost_sessions.session_id

### processing_breakdown 加工成本分解表 (Phase 5)

| 字段 | 类型 | 约束 | 说明 |
|-----|------|------|------|
| id | BIGINT | PK | 唯一标识 (Hash生成) |
| session_id | VARCHAR | FK | 关联会话ID |
| process_id | VARCHAR | | 工序ID |
| process_desc | VARCHAR | | 工序描述 |
| setup_cost_target | DECIMAL(15,2) | | 设置成本(目标) |
| setup_cost_actual | DECIMAL(15,2) | | 设置成本(实际) |
| labor_cost_target | DECIMAL(15,2) | | 人工成本(目标) |
| labor_cost_actual | DECIMAL(15,2) | | 人工成本(实际) |
| burden_cost_target | DECIMAL(15,2) | | 间接成本(目标) |
| burden_cost_actual | DECIMAL(15,2) | | 间接成本(实际) |

**外键**：session_id → part_cost_sessions.session_id

## 关系图

```
sessions 1──────N procurement_records
   │
   └── file_hash (UNIQUE) 用于去重
```

## 数据流

```
1. 用户上传 Excel → ExcelParser 解析 → 生成映射建议
2. 用户确认映射 → 创建 Session (检查 file_hash)
3. ETL 清洗数据 → 批量插入 procurement_records
4. 更新 Session 状态为 completed
```

## Period 提取逻辑

Period 从以下位置提取（优先级递减）：
1. Excel 前 3 行单元格内容（正则 `20\d{2}`）
2. 文件名（正则 `20\d{2}`）
3. 默认当前年份
