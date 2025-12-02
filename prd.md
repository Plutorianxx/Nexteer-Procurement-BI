# 项目需求文档（PRD）

## 1. 概述
项目名称：零部件采购成本与机会分析系统 (PCO-BI)
目标用户：采购总监、品类经理、一线采购员
核心价值：解决Excel手工分析效率低、可视化差、缺乏深度洞察的问题。通过自动化数据清洗、多维度可视化（如机会矩阵）及AI智能辅助，帮助团队快速识别降本机会（Opportunity）并制定谈判策略。

## 2. 功能需求

| 功能 | 优先级 | 描述 | 验收标准 |
|-----|-------|------|---------|
| **Excel上传与智能映射** | P0 必需 | 支持.xlsx/.csv上传；系统自动模糊匹配表头（如识别"Qty"为"Quantity"），并提供用户确认界面。 | 1. 上传5万行Excel无卡顿<br>2. 能准确识别不同命名习惯的表头<br>3. 用户必须确认映射后才进行下一步 |
| **全局仪表盘 (Global)** | P0 必需 | 展示总支出(APV)、覆盖率、总机会金额等KPI；展示**机会矩阵气泡图** (X轴支出/Y轴差异率/气泡大小为机会金额)。 | 1. 气泡图交互流畅，悬停显示详情<br>2. KPI数据与Excel求和结果一致（严禁汇率换算） |
| **品类详情分析 (Commodity)** | P0 必需 | 按品类下钻分析，包含供应商集中度(CR5)分析、Top供应商排名(APV vs Gap%)、Top零件列表。 | 1. 能够识别单一来源风险<br>2. 列表按机会金额降序排列 |
| **高清导出** | P0 必需 | 将当前分析报告导出为PDF或PPT，要求所见即所得，包含图表与AI分析文本。 | 1. PDF/PPT清晰度高（矢量或高倍图）<br>2. 包含Nexteer Logo和保密声明页脚 |
| **供应商详情与沙箱** | P1 重要 | 展示单一供应商画像；提供**动态模拟器**，用户输入新报价后，图表即时增加对比柱状图。 | 1. 模拟器无需刷新页面，实时更新图表<br>2. 展示该供应商Top 10降本机会零件 |
| **LLM 智能分析报告** | P1 重要 | 集成LLM（兼容OpenAI/Kimi/Qwen），基于当前页面统计数据生成谈判策略或风险分析文本。 | 1. 支持配置不同模型的API Key和BaseURL<br>2. 生成结果以Markdown流式展示<br>3. 包含数据脱敏开关 |
| **任务/Session管理** | P1 重要 | 记录用户的每次分析任务，支持历史回溯。 | 1. 重启服务后数据不丢失<br>2. 可随时调阅历史分析结果 |
| **Prompt 模板管理** | P2 期望 | 允许用户自定义AI分析的提示词模板（如“谈判专家角色”、“风险分析角色”）。 | 1. 支持增删改查 Prompt 模板 |

## 3. 非功能需求

| 类型 | 要求 |
|-----|------|
| **性能** | 1. Excel (5万行内) 解析与清洗耗时 < 5秒<br>2. 图表渲染响应 < 1秒 |
| **安全** | 1. LLM 调用支持数据脱敏（将供应商名替换为代号）<br>2. 数据本地化存储，Docker容器重启不丢失 |
| **兼容** | 1. 适配 Chrome / Edge 最新版<br>2. 部署环境兼容 Aliyun ECS (Ubuntu/Debian) |
| **UI/UX** | 1. 严格遵循 Nexteer UI 规范 (红/黑/白配色)<br>2. 核心金额/数量字段使用等宽字体 (Roboto Mono) 以便对齐 |
| **网络** | 后端需支持配置 API Proxy，以确保在阿里云国内节点能顺利调用海外或国内大模型接口 |

## 4. 页面列表

| 页面 | 功能 | 设计稿参考 |
|-----|------|-------|
| **上传页** | 文件拖拽、表头映射确认 Modal | 简洁风格，重点在于映射关系的左右对照 |
| **全局概览页** | 核心KPI卡片、机会矩阵气泡图、Commodity双轴图 | 布局参考：顶部KPI，中部大图，底部Top榜单 |
| **品类详情页** | 供应商集中度饼图/帕累托图、项目列表 | 侧重于供应商对比和垄断风险提示 |
| **供应商详情页** | 供应商画像、What-If 模拟沙箱 | 需包含交互式输入框用于模拟报价 |
| **系统设置页** | LLM模型配置(Key/Url)、Prompt模板管理 | 表单式页面 |

## 4. 功能需求 (Functional Requirements)

### 4.1 数据上传与处理 (Data Ingestion)
- **文件支持**: Excel (.xlsx), CSV (.csv)
- **智能映射**:
  - 自动识别表头并映射到标准字段 (PNs, Quantity, APV, Opportunity 等)
  - 支持动态表头识别 (如 "2023 quantity" -> Quantity)
  - 映射置信度提示与人工修正界面
- **数据清洗**: 自动去除货币符号、百分号，处理空值

### 4.2 基础 BI 面板 (Basic BI Dashboard)

#### A. 总览页 (Commodity Assessment Overview)
**1. 核心 KPI 卡片**
- **Total Spending**: 所有记录的 APV 总和
- **Spending Covered**: Covered APV 总和
- **PNs Covered**: 唯一 PNs 数量
- **Suppliers Covered**: 唯一 Supplier 数量
- **Gap/Opportunity Identified**: Gap to Target pc cost 汇总
- **Gap % of APV**: (Total Opportunity / Total APV) %

**2. 品类全景 (Commodity Overview)**
- **图表**: 双轴图
  - 主轴 (柱状): APV $ vs Covered Spending $
  - 副轴 (折线): Gap in %
  - 维度: 按 Commodity 类型分组
- **数据表**: 包含 APV, Covered Spending, Covered PNs, Opportunity, Gap %, No. of Suppliers
- **Top 20 Lists**:
  - **Suppliers**: 按 Opportunity 排序，展示 APV, Gap%, 主营 Commodity
  - **Projects (PNs)**: 按 Opportunity 排序，展示 PNs, Part Description, APV, Gap%, Supplier

#### B. 品类详情页 (Commodity Detail Page)
*为每个 Commodity 类型提供独立视图*

**1. 局部总览**
- 复用总览页 KPI 逻辑，但数据范围仅限于当前 Commodity

**2. Top 5 Suppliers 分析**
- **图表**: 
  - 柱状: APV $ vs Opportunity $ (按 Opportunity 降序排列)
  - 折线: Gap in % (副轴)

**3. 供应商深度分析 (Top 5 Suppliers Detail)**
- **交互式图表**: 默认展示 APV 和 Opportunity，支持用户**手动添加数据系列** (如输入新数值，实时生成对比柱状图)
- **Top 10 PNs 表**: 该供应商名下 Opportunity 最大的 10 个零件 (PNs, Description, Opportunity, Gap%)

### 4.3 高级数据分析 (Advanced Analytics)

#### A. 象限分析 (Opportunity Matrix) - **必做**
- **图表类型**: 气泡图 (Bubble Chart)
- **X轴**: APV $ (采购额，代表重要性)
- **Y轴**: Gap in % (降本空间，代表潜力)
- **气泡大小**: Annual Opportunity $
- **业务价值**: 识别"现金牛"(优先攻坚)、"难啃骨头"和"长尾零件"

#### B. 供应商集中度 (Supplier Concentration) - **必做**
- **指标**: CR3, CR5 (Top Suppliers 份额占比)
- **业务价值**: 识别单一来源 (Single Source) 风险，辅助供应链安全决策

#### C. 后续规划 (V2)
- **价格离散度 (Price Benchmarking)**: 基于 Part Description 聚类，对比相似零件单价
- **长尾分析 (Tail Spend Analysis)**: 统计后 80% 供应商/零件的支出占比，辅助 VMI 决策

### 4.4 LLM 智能分析 (AI Insights)
- **覆盖范围**: 所有页面 (总览、品类详情、供应商详情)
- **功能**:
  - 上下文感知：自动获取当前页面的统计数据作为 Context
  - 模板选择：提供预设 Prompt (如"降本策略建议", "风险评估")
  - 报告生成：输出 Markdown 格式的分析报告

## 5. 数据需求

| 数据 | 关键字段 | 来源 |
|-----|------|------|
| **采购记录 (Source Data)** | `PNs`(主键), `Commodity`, `Supplier`, `Quantity`, `APV`, `TargetSpend`, `Opportunity` | 用户上传 Excel (经清洗入库) |
| **任务元数据 (Session)** | `SessionID`, `Period` (如2023), `UploadTime`, `FileName` | 系统自动生成 / 表头正则提取 |
| **LLM 配置** | `ProviderName`, `BaseUrl`, `ApiKey`, `ModelName`, `IsActive` | 用户在设置页输入 |
| **映射规则库** | `ExcelHeader` (原名), `SystemField` (目标名), `Weight` | 系统内置 + 用户行为学习(可选) |

## 6. 约束（💡 **注意**：具体技术选型在 `gemini.md` 中配置）

| 类型 | 约束内容 |
|-----|---------|
| **技术约束** | 1. 必须容器化交付 (Docker)，包含导出功能所需的系统依赖 (如Headless Chrome库)<br>2. 后端需实现 OpenAI 接口兼容层，以适配多种国产大模型<br>3. 严禁在代码中进行汇率换算，完全透传 Excel 原值 |
| **部署约束** | 生产环境为阿里云 ECS，需处理好网络连通性 (API Proxy) 和数据持久化挂载 |
| **资源约束** | 单人全栈开发，需采用高效的敏捷开发模式 |
| **时间约束** | 预计开发周期 4-6 周 |

---
**版本**：2.0.0 | **作者**：AI PM | **日期**：2023-10-27
**更新**：技术栈详情已移至 `gemini.md`，本文档专注于业务与架构约束。