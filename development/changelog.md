# 变更日志

> 格式：`- \`type\`: 描述` | 保持<150行，版本发布时归档

## 未发布

### 12-02
- `feat`: DuckDB 表结构设计（sessions + procurement_records），支持数据持久化
- `feat`: 实现 Session管理服务，支持去重检查与 Period 自动提取
- `feat`: 实现 ETL 服务，支持数据清洗、类型转换、批量入库
- `feat`: 新增 `/api/data/confirm` 接口，完成映射确认与数据入库流程
- `feat`: 新增 `/api/data/records/{session_id}` 查询接口
- `feat`: 实现 Excel/CSV 上传解析接口，支持智能字段映射（同义词+模糊匹配）
- `feat`: 创建后端核心服务 ExcelParser，支持 Hash 校验与数据预览

### 12-01
- `feat`: 项目初始化，搭建 React + FastAPI + Docker 开发环境
- `chore`: Git 仓库初始化并推送至远程

## [v1.0.0] - [YYYY-MM-DD]

### Features
- [功能描述]

### Fixes
- [修复描述]

### Breaking Changes
- [如有]

---

<details>
<summary>📁 历史版本</summary>

## [v0.1.0] - [日期]
- 初始版本

</details>

---
**type**：feat新功能 | fix修复 | docs文档 | style格式 | refactor重构 | test测试 | chore其他
