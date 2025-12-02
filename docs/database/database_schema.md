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
| gap_percent | DECIMAL(5,2) | | 差异百分比 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**主键**：(session_id, pns)  
**外键**：session_id → sessions.session_id

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
