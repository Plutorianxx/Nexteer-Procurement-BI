# UI/UX 设计规范

## 概述
项目：零部件采购成本与机会分析系统 (PCO-BI)
版本：1.0
风格关键词：Industrial (工业感), Professional (专业), Data-Centric (数据为中心)
设计基准：基于 Nexteer Corporate Identity (CI) 规范适配
code
Code
## 1. 色彩系统 (Color Palette)

### 1.1 核心品牌色
用于界面的主基调，确立品牌识别度。

| 类别 | 色值 | Hex | 用途 |
|-----|------|-----|------|
| **Primary Red** | 🔴 品牌红 | `#E31837` | 主按钮、Tab 高亮、图表关键点、KPI 中的“机会金额” |
| **Primary Black** | ⚫ 品牌黑 | `#1A1A1A` | 顶部导航栏、一级标题、图表中的“实际支出 (APV)” |

### 1.2 语义功能色 (BI 专用)
用于数据可视化和状态表达。

| 语义 | 颜色 | Hex | 含义 |
|-----|------|-----|------|
| **Opportunity** | 🔴 红色 | `#E31837` | **降本机会 (Gap)** - 需要攻克的差异 |
| **Base Spend** | ⚫ 炭黑 | `#2D2D2D` | **基础支出** - 当前的事实数据 |
| **Target** | 🟢 绿色 | `#28A745` | **目标** - 要达到的标准 (图表中也可使用虚线) |
| **Comparison** | 🔵 蓝色 | `#2196F3` | **对比项** - 用于 Scenario 模拟时的新增数据 |

### 1.3 界面基础色

| 类别 | 色值 | Hex | 用途 |
|-----|------|-----|------|
| **Page Bg** | 🌫 浅灰 | `#F5F5F5` | 全局背景，减少长期使用的视觉疲劳 |
| **Card Bg** | ⚪ 纯白 | `#FFFFFF` | 内容承载容器背景 |
| **Border** | ◽ 灰线 | `#E0E0E0` | 分割线、边框 |

## 2. 字体与排版 (Typography)

### 2.1 字体家族

| 类型 | 字体栈 (Font Stack) | 适用场景 |
|-----|-------------------|---------|
| **UI / 正文** | `'Montserrat', 'Roboto', sans-serif` | 标题、导航、说明文本 (保持品牌一致性) |
| **数据 / 代码** | `'Roboto Mono', 'Consolas', monospace` | **PN (零件号)、金额、数量** (确保数字等宽对齐，方便比对) |

### 2.2 关键排版规范

| 元素 | 字号 (px) | 字重 | 颜色 | 备注 |
|-----|-----------|------|------|------|
| **KPI Big Number** | 32px | 700 (Bold) | `#E31837` | 强调数字 |
| **Card Title** | 16px | 600 (Semi-Bold) | `#2D2D2D` | 卡片标题 |
| **Table Header** | 13px | 600 (Semi-Bold) | `#FFFFFF` | 背景为黑色 |
| **Table Content** | 13px | 400 (Regular) | `#4A4A4A` | 紧凑型设计 |

## 3. 布局与组件 (Layout & Components)

### 3.1 框架布局

| 区域 | 规范描述 |
|-----|---------|
| **导航栏 (Navbar)** | **深色模式** (`#1A1A1A`)，高度 `64px`。<br>左侧：白色 Logo + "Procurement BI"。<br>右侧："New Analysis" (红色按钮) + 历史记录。 |
| **栅格系统 (Grid)** | 采用 `24px` 间距。布局逻辑：<br>1. 顶部：KPI 卡片组 (4-6个)<br>2. 中部：可视化图表区 (左2/3) + Top榜单 (右1/3)<br>3. 底部：宽幅明细数据表格 |

### 3.2 核心组件样式参考

#### A. KPI 卡片 (KPI Card)
特征：顶部带有品牌红条，突显专业感。
```css
.kpi-card {
  background: #FFFFFF;
  border-radius: 4px;
  border-top: 3px solid #E31837; /* 核心特征 */
  padding: 16px 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
B. 数据表格 (Data Table)
特征：高密度，适合大量数据浏览。
code
CSS
/* 表头 */
th {
  background: #1A1A1A;
  color: #FFFFFF;
  height: 40px;
  text-transform: uppercase;
}
/* 单元格 - 使用等宽字体 */
td {
  border-bottom: 1px solid #EEEEEE;
  height: 36px;
  font-family: 'Roboto Mono', monospace; 
}
/* 交互 */
tr:hover { background: rgba(227, 24, 55, 0.05); } /* 悬停微红 */
C. AI 分析报告容器
特征：Markdown 渲染风格，左侧强提示。
code
CSS
.ai-report-box {
  background: #FAFAFA;
  border: 1px solid #E0E0E0;
  border-left: 4px solid #1A1A1A;
  padding: 24px;
  line-height: 1.6;
}
4. 数据可视化规范 (Data Viz)
4.1 颜色映射逻辑
原则：避免全盘红色，红色仅用于“差异”和“机会”。
数据指标	图表颜色	视觉含义
Spend (APV)	⚫ #2D2D2D	稳重的现状基数
Target	⚪ #9E9E9E (或虚线)	参考基准线
Gap / Opportunity	🔴 #E31837	警示与机会
4.2 特殊图表：机会矩阵 (Bubble Chart)
X轴 (Spend): 线性或对数轴。
Y轴 (Gap %): 线性轴。
气泡颜色: 热力渐变 —— 低 Gap (灰色) ➔ 高 Gap (深红)。
4.3 交互体验
Tooltip: 黑色半透明背景 (rgba(0,0,0,0.8)), 白色文字。
Selection: 点击某数据项时，非选中项透明度降低至 30%。
5. 交互与反馈 (Interaction)
状态	表现形式	备注
全屏 Loading	居中 Logo + 红色脉冲动画 (Pulse)	用于文件解析/页面初始化
局部 Loading	骨架屏 (Skeleton) 或打字机效果	用于 AI 报告生成区
Error / Alert	右上角 Toast 弹窗	图标🔴 + 背景#FDEDED + 深红边框
6. 导出规范 (Export)
项目	要求
背景	强制白色 (#FFFFFF)，去除网页灰色背景
页眉	左侧 Nexteer Logo，右侧文本 "Confidential - Internal Use Only"
页脚	自动生成的时间戳、页码
清晰度	图表渲染 DPI ≥ 2x (保证打印清晰)
维护者：UI Design Team | 最后更新：2023-10-27