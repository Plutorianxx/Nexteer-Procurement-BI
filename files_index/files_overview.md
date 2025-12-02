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
- `app/services/excel_parser.py`: Excel 解析服务
- `app/schemas/upload.py`: 上传响应模型
- `tests/create_mock.py`: 测试数据生成脚本
- `tests/mock_data.xlsx`: 测试用 Excel 文件
- `Dockerfile`: 后端镜像构建
- `requirements.txt`: Python依赖
- `venv/`: Python 虚拟环境

## Frontend (`/frontend`)
- `src/App.tsx`: 主应用组件
- `src/main.tsx`: 入口文件
- `vite.config.ts`: Vite配置
- `package.json`: 前端依赖

## Docs (`/docs`)
- `api/`: API文档
- `database/`: 数据库文档
- `ui/`: UI设计文档
