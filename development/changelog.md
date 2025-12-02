# 变更日志

> 格式：`- \`type\`: 描述` | 保持<150行，版本发布时归档

## 未发布

### 12-02
- `feat`: 开发基础 BI 面板，展示 KPI、品类全景图与 Top 20 榜单
- `feat`: 实现 Analytics Service，支持多维度聚合查询 (DuckDB)
- `feat`: 扩展数据模型，新增 PartDesc/Price/Gap 等7个关键字段
- `feat`: 增强 Excel 解析器，支持正则匹配动态表头（如 "2023 quantity"）
- `feat`: 开发前端上传页面，支持文件拖拽与进度显示
- `feat`: 开发字段映射确认 Modal，支持置信度展示与手动修正
- `feat`: 封装前端 API 服务与国际化工具，支持中英文切换
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
