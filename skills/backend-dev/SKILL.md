# 后端开发技能

> 触发关键词：后端、API、接口、服务、控制器、路由、服务器

## 核心原则

1. **分层架构**：路由 → 控制器 → 服务 → 数据访问
2. **单一职责**：每层只做自己的事
3. **错误处理**：所有async操作必须有错误处理
4. **参数验证**：永远不信任用户输入

## 分层职责

| 层级 | 职责 | 禁止 |
|-----|------|------|
| 路由 | URL映射，调用控制器 | 写业务逻辑 |
| 控制器 | 接收参数，调用服务，返回响应 | 直接操作数据库 |
| 服务 | 业务逻辑 | 处理HTTP请求/响应 |
| 数据访问 | 数据库操作 | 写业务逻辑 |

## 目录结构

```
src/
├── routes/       # 路由
├── controllers/  # 控制器
├── services/     # 服务
├── middlewares/  # 中间件
├── models/       # 数据模型
└── utils/        # 工具
```

## 统一响应格式

```json
// 成功
{ "success": true, "data": {...} }

// 失败
{ "success": false, "error": { "code": "ERROR_CODE", "message": "描述" } }

// 分页
{ "success": true, "data": [...], "pagination": { "page": 1, "total": 100 } }
```

## 控制器模板

```typescript
async function handler(req, res, next) {
  try {
    const result = await service.method(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
```

## 禁止事项

- ❌ 控制器写业务逻辑
- ❌ 不验证用户输入
- ❌ 忽略错误处理
- ❌ 返回敏感信息（password等）
- ❌ 硬编码敏感配置

## 自查清单

- [ ] 遵循分层架构
- [ ] 所有输入已验证
- [ ] 错误已处理
- [ ] 响应格式统一
- [ ] 无敏感信息泄露

---
**详细资源**：`resources/` 目录（按需读取）
