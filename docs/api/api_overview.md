# API 文档

## 概述

```
基础URL：/api/v1
认证：Bearer Token (除特别标注外均需认证)
响应格式：JSON
```

## 统一响应

```json
// 成功
{ "success": true, "data": {...} }

// 失败
{ "success": false, "error": { "code": "ERROR_CODE", "message": "描述" } }
```

## 认证模块

### POST /auth/login 登录
**认证**：不需要

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| email | string | ✅ | 邮箱 |
| password | string | ✅ | 密码 |

**响应**：`{ token, user }`

### POST /auth/register 注册
**认证**：不需要

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| email | string | ✅ | 邮箱 |
| password | string | ✅ | 密码(≥8位) |
| name | string | ✅ | 姓名 |

## 用户模块

### GET /users/me 获取当前用户
**响应**：`{ id, email, name, ... }`

### PUT /users/me 更新用户信息
| 参数 | 类型 | 说明 |
|-----|------|------|
| name | string | 姓名 |

## [模块名]

### [METHOD] [路径] [说明]
**认证**：需要/不需要

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| [参数] | [类型] | | [说明] |

**响应**：`{...}`

## 错误码

| 错误码 | HTTP状态 | 说明 |
|-------|---------|------|
| UNAUTHORIZED | 401 | 未认证 |
| FORBIDDEN | 403 | 无权限 |
| NOT_FOUND | 404 | 资源不存在 |
| VALIDATION_ERROR | 400 | 参数验证失败 |
