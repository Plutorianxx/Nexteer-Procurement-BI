# 文件索引

> 自动维护 | 核心文件列表

## 根目录
- `gemini.md`: 项目主控文件
- `prd.md`: 需求文档
- `implementation_plan.md`: 开发计划
- `project_progress.md`: 进度记录
- `docker-compose.yml`: 容器编排
- `UI_standard.md`: UI规范

## Backend (`/backend`)
- `app/main.py`: API 入口
- `app/routers/upload.py`: 文件上传路由
- `app/routers/data.py`: 数据确认与查询路由
- `app/services/excel_parser.py`: Excel 解析服务
- `app/services/session_manager.py`: Session 管理服务
- `app/services/etl_service.py`: ETL 数据清洗与入库服务
- `app/schemas/upload.py`: 上传响应模型
- `app/schemas/data.py`: 数据确认模型
- `app/database/init.py`: DuckDB 初始化与连接
- `tests/create_mock.py`: 测试数据生成脚本
- `tests/create_payload.py`: 测试请求生成脚本
- `tests/mock_data.xlsx`: 测试用 Excel 文件
- `data/procurement.duckdb`: DuckD B 数据库文件
- `Dockerfile`: 后端镜像构建
- `requirements.txt`: Python依赖
- `venv/`: Python 虚拟环境

## Frontend (`/frontend`)
- `src/App.tsx`: 主应用组件
- `src/main.tsx`: 入口文件
- `src/pages/Upload/index.tsx`: 上传页面主组件
- `src/pages/Dashboard/index.tsx`: 仪表盘主组件
- `src/components/FileUploader.tsx`: 文件上传组件
- `src/components/MappingModal.tsx`: 映射确认弹窗
- `src/components/KPICard.tsx`: KPI 卡片组件
- `src/components/CommodityChart.tsx`: 品类双轴图组件
- `src/services/api.ts`: Axios 封装
- `src/services/uploadService.ts`: 上传服务
- `src/pages/CommodityDetail/index.tsx`: 品类详情页
- `src/components/OpportunityMatrix.tsx`: 象限分析气泡图
- `src/components/ConcentrationChart.tsx`: 供应商集中度图表
- `src/components/TopSuppliersChart.tsx`: Top Suppliers 双轴图
- `src/components/SupplierDetailCard.tsx`: 交互式 Supplier 详情卡片
- `src/services/analyticsService.ts`: 分析服务
- `src/types/index.ts`: 基础类型定义
- `src/types/analytics.ts`: 分析类型定义
- `src/utils/i18n.ts`: 国际化工具
- `vite.config.ts`: Vite配置
- `package.json`: 前端依赖

## Docs (`/docs`)
- `api/`: API文档
- `database/`: 数据库文档
- `ui/`: UI设计文档
