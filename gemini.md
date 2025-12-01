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

