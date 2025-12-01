# 前端开发技能

> 触发关键词：前端、UI、页面、组件、样式、React、Vue、界面、交互

## 核心原则

1. **组件化**：UI拆分为可复用组件，单一职责
2. **类型安全**：使用TypeScript，明确props/state类型
3. **状态处理**：始终处理 loading/error/empty 三种状态

## 命名规范

| 类型 | 规范 | 示例 |
|-----|------|------|
| 组件文件 | PascalCase | `UserProfile.tsx` |
| 工具函数 | camelCase | `formatDate.ts` |
| 样式文件 | 同组件名 | `UserProfile.module.css` |

## 目录结构

```
src/
├── components/   # 公共组件
├── pages/        # 页面组件
├── hooks/        # 自定义hooks
├── services/     # API调用
├── utils/        # 工具函数
└── types/        # 类型定义
```

## 组件结构模板

```tsx
// 1.导入
import { useState } from 'react';
import type { Props } from './types';

// 2.组件
export function Component({ prop1, prop2 }: Props) {
  // hooks
  const [state, setState] = useState();
  
  // 状态处理
  if (loading) return <Loading />;
  if (error) return <Error />;
  if (!data) return <Empty />;
  
  // 渲染
  return <div>...</div>;
}
```

## 禁止事项

- ❌ 使用 `any` 类型
- ❌ 组件内直接调用API（应封装到services）
- ❌ 忽略TypeScript错误
- ❌ 列表渲染缺少key

## 自查清单

- [ ] TypeScript无错误
- [ ] 处理了loading/error/empty状态
- [ ] 列表有唯一key
- [ ] 表单有验证

---
**详细资源**：`resources/` 目录（按需读取）
