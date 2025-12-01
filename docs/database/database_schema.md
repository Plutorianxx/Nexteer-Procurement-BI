# 数据库设计

## 概述

```
数据库：[类型，如MySQL]
命名规范：表名小写复数，字段小写下划线
```

## 表结构

### users 用户表

| 字段 | 类型 | 约束 | 说明 |
|-----|------|------|------|
| id | BIGINT | PK, AUTO | 主键 |
| email | VARCHAR(100) | UNIQUE | 邮箱 |
| password | VARCHAR(255) | NOT NULL | 密码(加密) |
| name | VARCHAR(50) | | 姓名 |
| created_at | TIMESTAMP | DEFAULT NOW | 创建时间 |
| updated_at | TIMESTAMP | ON UPDATE | 更新时间 |

**索引**：email(唯一)

### [表名] [说明]

| 字段 | 类型 | 约束 | 说明 |
|-----|------|------|------|
| id | BIGINT | PK | 主键 |
| [字段] | [类型] | [约束] | [说明] |

## 关系图

```
users 1──┬──N orders
         │
         └──1 profiles

orders N──M products (通过 order_items)
```

## 索引策略

| 表 | 索引 | 类型 | 用途 |
|---|------|------|------|
| users | email | UNIQUE | 登录查询 |
| orders | user_id | INDEX | 用户订单 |
