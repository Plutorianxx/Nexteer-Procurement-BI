# Bug 记录

> 待修复<100行 | 已修复定期归档

## 待修复

### BUG-[编号]：[标题]
**严重度**：🔴高 / 🟡中 / 🟢低
**现象**：[现象]
**位置**：[文件/函数]
**判断**：[初步原因]

## 已修复

### BUG-001: Excel 表头检测失效导致数据大量丢失 ✅
**原因**：`ExcelParser` 使用 `df.iterrows()` 遍历全表检测表头，判断条件过于宽泛（仅需包含任一关键字），导致误将数据行识别为表头，之前的行全部被跳过
**修复**：
- `backend/app/services/excel_parser.py`: 限制扫描前 50 行，且至少匹配 2 个关键字段
**教训**：对大文件使用 `iterrows()` 性能差，且条件判断需严格，避免误判

### BUG-002: 主键冲突导致双源采购数据丢失 ✅
**原因**：数据库主键设计为 `(session_id, pns)`，ETL 按 `pns` 聚合，导致同一零件由不同供应商供应时，只保留第一个供应商，其他供应商被丢弃
**修复**：
- `backend/app/database/init.py`: 主键改为 `(session_id, pns, supplier)`
- `backend/app/services/etl_service.py`: 聚合改为按 `["pns", "supplier"]` 分组
**教训**：主键设计需充分考虑业务场景（双源采购是常见需求）

### BUG-003: 重复上传文件报错 400/500 ✅
**原因**：`sessions` 表中 `file_hash` 设置了 `UNIQUE` 约束，且代码中有去重检查逻辑，导致用户无法重新处理同一文件
**修复**：
- `backend/app/database/init.py`: 移除 `file_hash UNIQUE` 约束
- `backend/app/routers/data.py`: 移除去重检查代码
**教训**：去重逻辑需根据业务需求设计，BI 系统通常允许重复分析

### BUG-004: Commodity 名称包含斜杠导致路由 404 ✅
**原因**：FastAPI 默认路径参数不支持包含 `/` 的值，导致 `E -C/P/M` 等名称被错误解析为多个路径段
**修复**：
- `backend/app/routers/analytics.py`: 路径参数改为 `{commodity:path}` 和 `{supplier:path}`
**教训**：对于可能包含特殊字符的参数（如用户输入的名称），应使用 `:path` 类型或进行额外的 URL 编码处理

---

<details>
<summary>📁 归档</summary>

[旧bug记录]

</details>
