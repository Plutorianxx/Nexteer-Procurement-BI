# 任务清单：后端 Excel 解析

## 依赖与配置
- [ ] 更新 `backend/requirements.txt` 添加 `python-Levenshtein`
- [ ] 重建 Docker 镜像或重新安装依赖

## 核心逻辑开发
- [ ] 创建 `backend/app/schemas/upload.py` (定义 Response Model)
- [ ] 创建 `backend/app/services/excel_parser.py` (实现 Hash 与 Pandas 读取)
- [ ] 实现 Fuzzy Matching 算法 (表头映射)

## API 开发
- [ ] 创建 `backend/app/routers/upload.py`
- [ ] 在 `backend/app/main.py` 中注册路由

## 测试与验证
- [ ] 生成测试数据 `backend/tests/mock_data.xlsx`
- [ ] 启动服务并测试 `/api/upload` 接口
