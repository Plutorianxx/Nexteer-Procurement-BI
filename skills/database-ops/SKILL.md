# 数据库操作技能

> 触发关键词：数据库、表、字段、SQL、查询、数据、存储
> ⚠️ 包含护栏规则，部分操作需用户确认

## 🛡️ 护栏规则

| 操作 | 风险 | 要求 |
|-----|------|------|
| DROP TABLE/DATABASE | 🔴极高 | 必须确认+备份 |
| DROP COLUMN | 🔴高 | 必须确认 |
| DELETE/UPDATE批量 | 🟡中 | 确认影响行数 |
| TRUNCATE | 🔴极高 | 必须确认+备份 |

**执行前必须说明**：操作内容、影响范围、是否需要备份

## 核心原则

1. **数据安全**：重要操作先备份
2. **事务保护**：多步操作用事务
3. **参数化查询**：防止SQL注入
4. **索引优化**：避免全表扫描

## 表设计规范

| 规范 | 要求 | 示例 |
|-----|------|------|
| 表名 | 小写+下划线+复数 | `order_items` |
| 字段名 | 小写+下划线 | `created_at` |
| 主键 | 每表必须有 | `id` |
| 时间字段 | 必须有创建/更新时间 | `created_at`, `updated_at` |
| 外键 | 表名_id | `user_id` |

## 必备字段模板

```sql
CREATE TABLE example (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  -- 业务字段
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 查询规范

```typescript
// ❌ 危险：字符串拼接
`SELECT * FROM users WHERE id = ${id}`

// ✅ 安全：参数化查询
db.query('SELECT * FROM users WHERE id = ?', [id])
```

## 禁止事项

- ❌ 字符串拼接SQL
- ❌ 生产环境未测试就执行迁移
- ❌ 删除数据不备份
- ❌ 使用 SELECT *
- ❌ 大表无索引查询

## 自查清单

- [ ] 使用参数化查询
- [ ] 重要操作已备份
- [ ] 多步操作用事务
- [ ] 查询字段有索引
- [ ] 已获用户确认（如需要）

---
**详细资源**：`resources/` 目录（按需读取）
