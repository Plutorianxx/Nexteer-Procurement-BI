# Nexteer Procurement BI

**智能采购成本分析 BI 系统**

---

## 🚀 快速启动

### 前置要求
- Python 3.10+
- Node.js 20.19+ 或 22.12+
- DuckDB (自动安装)

### 首次设置

1. **克隆项目**
```bash
git clone <repository-url>
cd Nexteer-Procurement-BI
```

2. **安装后端依赖**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

3. **安装前端依赖**
```bash
cd frontend
npm install
cd ..
```

### 启动应用

**一键启动（推荐）**
```bash
./start.sh
```

**停止服务**
```bash
./stop.sh
```

或按 `Ctrl+C` 停止（如果使用 `start.sh`）

**手动启动**
```bash
# 终端 1 - 后端
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 终端 2 - 前端
cd frontend
npm run dev -- --host
```

### 访问地址

- **前端**: http://localhost:5173
- **后端 API**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs

---

## 📖 功能特性

### ✅ 已实现

1. **数据上传与解析**
   - Excel 文件上传
   - 智能字段映射
   - 数据清洗与验证

2. **基础 BI Dashboard**
   - KPI 卡片（总花费、覆盖率、机会、Gap%）
   - Top Commodities 分析
   - Top Suppliers 分析
   - Top Projects (PNs) 分析

3. **高级分析**
   - **Opportunity Matrix**（气泡图）: 动态象限分析，支持交互式阈值调整
   - **Supplier Concentration**（饼图 + KPI）: CR3/CR5 集中度分析

4. **Commodity 详情页**
   - 品类级别 KPI
   - Top 5 Suppliers 详细分析
   - 交互式供应商详情卡片
   - Top 10 PNs 表格

5. **LLM 智能分析** 🤖
   - AI 执行摘要报告生成
   - 支持多种 LLM 模型（OpenAI / Kimi / GLM / Gemini）
   - 自定义 Prompt 模板
   - 流式 Markdown 输出
   - Dashboard 和 Commodity 双场景分析

6. **导出功能** 📊
   - **Excel 导出**: Dashboard 6 个 Sheet，Commodity Detail 5 个 Sheet
   - **图表导出**: 所有 ECharts 图表支持 PNG 导出（2x 高清）

### 🔮 规划中

- PDF 报告导出
- 供应商详情页
- 历史趋势分析
- 多期间对比分析

---

## 📂 项目结构

```
Nexteer-Procurement-BI/
├── backend/              # FastAPI 后端
│   ├── app/
│   │   ├── database/     # DuckDB 数据库
│   │   ├── routers/      # API 路由
│   │   ├── services/     # 业务逻辑
│   │   ├── schemas/      # Pydantic 模型
│   │   └── main.py       # 主应用
│   └── tests/            # 测试
├── frontend/             # React + Vite 前端
│   ├── src/
│   │   ├── components/   # UI 组件
│   │   ├── pages/        # 页面
│   │   ├── services/     # API 调用
│   │   ├── types/        # TypeScript 类型
│   │   └── utils/        # 工具函数
│   └── public/
├── docs/                 # 项目文档
├── start.sh              # 快速启动脚本
├── stop.sh               # 停止服务脚本
└── README.md             # 本文件
```

---

## 🛠️ 技术栈

**后端**
- FastAPI
- DuckDB
- Pydantic
- OpenAI SDK (LLM 集成)

**前端**
- React 18
- TypeScript
- Ant Design
- ECharts
- Axios
- XLSX (SheetJS)
- React Markdown

---

## 📝 使用流程

1. 访问 http://localhost:5173
2. 上传 Excel 采购数据文件
3. 确认字段映射
4. 查看 Dashboard 分析结果
5. 点击品类进入详情页深度分析
6. 使用 AI 生成智能报告（需配置 LLM API Key）
7. 导出 Excel 或图表图片

---

## 🔑 LLM 配置

在前端界面中点击 "Settings" 图标，配置 LLM：

**支持的模型**:
- OpenAI (GPT-4o, GPT-3.5-turbo)
- Kimi (Moonshot AI)
- GLM (Zhipu AI)
- Google Gemini
- Custom OpenAI-compatible APIs

**示例配置 (Kimi)**:
- Provider: Kimi
- Base URL: `https://api.moonshot.cn/v1`
- API Key: `your-api-key`
- Model: `moonshot-v1-8k`
- Temperature: 0.7

---

## 📄 文档

详细文档请参考 `docs/` 目录：
- `prd.md`: 产品需求文档
- `docs/database/database_schema.md`: 数据库设计
- `docs/api/api_overview.md`: API 接口文档
- `files_index/files_overview.md`: 文件索引

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📜 License

MIT License

---

**Built with ❤️ for Nexteer Automotive Procurement Team**
