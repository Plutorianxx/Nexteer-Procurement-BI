# 项目主控文件

> 📌 每轮开发必须首先读取本文件。🔒标注内容不得修改。

---

## 第一部分：项目配置 ✏️
```
项目名称：零部件采购成本与机会分析系统
项目描述：解决Excel手工分析效率低、可视化差、缺乏深度洞察的问题。通过自动化数据清洗、多维度可视化（如机会矩阵）及AI智能辅助，帮助团队快速识别降本机会（Opportunity）并制定谈判策略。
项目规模：小型(<3万行) 

项目目录：/home/plutorianxx/Nexteer-Procurement-BI

技术栈：
| 层级 | 技术选择 | 原因 |
|-----|---------|------|
| **前端** | React (Vite) + Ant Design + ECharts | React生态丰富；AntD符合B端商务UI规范；ECharts对气泡图和复杂交互支持最佳。 |
| **后端** | Python (FastAPI) + Pandas | FastAPI性能高且易于开发；Pandas处理Excel数据最强；原生支持LLM生态。 |
| **数据库** | DuckDB (OLAP) | 专为数据分析设计的嵌入式数据库，处理聚合计算（Sum/Group By）速度极快，且无需单独部署服务。 |
| **AI模块** | OpenAI SDK (Adapter Mode) | 通过统一SDK适配器模式，兼容 OpenAI、Kimi、Qwen、GLM 等主流模型 API。 |
| **导出** | Puppeteer (Headless Chrome) | 唯一能保证前端图表（Canvas/SVG）“所见即所得”且高清导出为PDF的技术方案。 |

Git仓库：
  地址：git@github.com:Plutorianxx/Nexteer-Procurement-BI.git
  主分支：main
  当前分支：main

主要账号信息：
暂无
```

---

## 第二部分：开发规范 🔒

### 2.1 每轮开发流程
```
1. 读取 gemini.md + project_progress.md
2. 接收任务 → 根据本文档第三部分任务路由表加载相关文档/技能
3. 向用户确认理解 → 等待确认
4. 执行开发 → 运行测试验证
5. 更新文档（参考2.5自检） → Git提交推送 → 报告完成
```

### 2.2 核心原则

- 渐进式开发：每次只完成一个明确任务
- 规划先行：复杂任务先制定计划，用户确认后执行
- 测试验证：开发后必须测试
- 文档同步：每轮必须更新文档
- 强制提交：每轮必须Git提交推送

### 2.3 禁止事项

- ❌ 跳过规划直接开发复杂功能
- ❌ 未经确认就大规模修改
- ❌ 忽略测试、忘记更新文档、忘记Git提交
- ❌ 修改数据模型却不更新 `docs/database/`
- ❌ 修改API接口却不更新 `docs/api/`
- ❌ 新增文件却不更新 `files_index/`
- ❌ 修改本规范部分

### 2.4 Git提交规范 🔒

**格式**：`<type>: <简短描述>`

| type | 用途 | type | 用途 |
|------|------|------|------|
| feat | 新功能 | fix | Bug修复 |
| docs | 文档 | style | 格式 |
| refactor | 重构 | test | 测试 |
| chore | 其他 | | |

### 2.5 文档更新规范 🔒

**每轮必更新**：
| 文档 | 格式要求 |
|-----|---------|
| `project_progress.md` | 滚动更新，保留最近5轮，每条≤2行 |
| `changelog.md` | 追加格式：`- \`type\`: 描述` |

**按变更类型更新**（必须自检：本轮是否涉及？涉及则必须更新）：
| 变更类型 | 需更新文档 |
|---------|-----------|
| 新增/删除/移动文件 | `files_index/` |
| 数据模型/表结构/迁移 | `docs/database/` |
| API接口增改 | `docs/api/` |
| Bug修复或发现 | `development/bug_fixes.md` |

**格式要求**：
- 每条记录≤2行，用关键词非长段落，超限则归档
- 禁止 `cat >>` 或 `echo >>`，必须用 `str_replace` 精确修改

---

## 第三部分：任务路由表

> 根据任务关键词，确定需要读取和更新的文档

### 3.1 基础路由

| 任务类型 | 触发关键词 | 开发前读取 | 开发后更新 |
|---------|-----------|-----------|-----------|
| **前端** | 前端、UI、页面、组件、图表、样式 | `files_index/` + `skills/frontend-dev/SKILL.md` + `docs/ui/` | `files_index/` |
| **后端** | 后端、API、接口、服务 | `files_index/` + `skills/backend-dev/SKILL.md` + `docs/api/` | `docs/api/` |
| **数据库** | 数据库、表、字段、模型、迁移 | `skills/database-ops/SKILL.md` + `docs/database/` | `docs/database/` |
| **Bug修复** | bug、修复、错误、异常 | `development/bug_fixes.md` | `development/bug_fixes.md` |
| **新功能** | 新功能、实现、开发 | `implementation_plan.md` + `files_index/` | 按涉及类型更新 |
| **重构** | 重构、优化、架构 | `docs/architecture/` + 创建任务文档 | 按涉及类型更新 |

### 3.2 补充路由

| 触发条件 | 需要读取 | 说明 |
|---------|---------|------|
| 任务涉及**修改**现有代码 | `files_index/files_overview.md` | 定位文件位置 |
| 任务涉及**需求细节**不明确 | `prd.md` | 查阅需求定义 |
| 任务涉及**接口对接** | `docs/api/api_overview.md` | 查阅API规范 |
| 任务涉及**表结构** | `docs/database/database_schema.md` | 查阅字段定义 |

### 3.3 复杂度判断

| 复杂度 | 信号词 | 文档读取程度 |
|-------|-------|-------------|
| 低 | 小改、微调 | 只读 files_index 定位 |
| 中 | 添加、修改 | files_index + 对应领域文档 |
| 高 | 重构、跨模块 | 完整读取 + 创建任务文档 |

---

## 第四部分：检查清单

### 4.1 开发前

- [ ] 已读 gemini.md + project_progress.md
- [ ] 已读 files_index/files_overview.md（如需修改现有代码）
- [ ] 已按路由表读取对应领域文档（API/数据库/Bug等）
- [ ] 已向用户确认任务理解
- [ ] （大型任务）已创建 tasks/[任务名]/ 并获用户确认

### 4.2 开发后

- [ ] 代码无语法错误，已测试
- [ ] 符合技能文件规范
- [ ] 已处理错误和安全风险

### 4.3 收尾（按顺序执行）��

**Step 1 - 更新文档**：
- [ ] `project_progress.md`（必须）
- [ ] `changelog.md`（必须）
- [ ] 变更类型自检（参考2.5），更新涉及的文档：
  - [ ] 文件结构变更？ → `files_index/`
  - [ ] 数据模型变更？ → `docs/database/`
  - [ ] API接口变更？ → `docs/api/`
  - [ ] Bug相关？ → `development/bug_fixes.md`

**Step 2 - Git提交**：
```bash
git add .
git commit -m "<type>: <描述>"
git pull origin <分支>
git push origin <分支>
```

**Step 3 - 报告**（固定格式）：
```
## 本轮完成
**完成**：[1-2行概述]
**文件**：[修改的文件列表]
**Git**：`<type>: <描述>` → ✅ 已推送
**下一步**：[建议]
```

---

## 第五部分：护栏规则 🔒

> 以下操作必须先确认，获得用户许可后才能执行

| 危险操作 | 确认要求 |
|---------|---------|
| 删除文件 | 列出清单，等待确认 |
| 数据库结构变更 | 说明影响范围，等待确认 |
| 修改认证/权限/支付代码 | 详细说明改动，等待确认 |
| 大规模重构 | 先制定计划，分阶段执行 |
| 修改配置文件 | 说明影响，等待确认 |
| git push -f | 禁止，必须先沟通 |

**确认格式**：
```
⚠️ 护栏确认：[操作] | 影响：[范围] | 风险：[说明]
请确认是否继续？(是/否)
```

---

## 第六部分：大型任务管理

**触发条件**（满足任一）：修改>5文件 / 开发>1小时 / 跨模块 / 多轮对话 / 架构调整

**任务文档结构**：
```
tasks/[任务名]/
├── plan.md      # 实施计划（需用户确认）
├── context.md   # 关键文件、技术决策
└── tasks.md     # 任务清单、进度、下一步
```

**继续任务流程**：
1. 读 gemini.md + project_progress.md
2. 读 tasks/[任务名]/ 三个文件
3. 向用户确认上下文
4. 从 tasks.md 的"下一步"继续

**任务完成后**：归档或删除 tasks/[任务名]/ 目录

---

## 附录：文档索引速查

| 分类 | 文档 | 路径 |
|-----|------|------|
| 🔴必读 | 主控文件 | `gemini.md` |
| 🔴必读 | 项目进度 | `project_progress.md` |
| 🔴必读 | 文件索引 | `files_index/files_overview.md` |
| 项目 | 需求/计划 | `prd.md`, `implementation_plan.md` |
| 技术 | 数据库/API/UI | `docs/database/`, `docs/api/`, `docs/ui/` |
| 索引 | 文件位置 | `files_index/` |
| 记录 | 变更/Bug | `development/changelog.md`, `development/bug_fixes.md` |
| 任务 | 大型任务文档 | `tasks/[任务名]/` |

---
