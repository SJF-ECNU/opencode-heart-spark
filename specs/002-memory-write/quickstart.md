# Quick Start: 恋爱模拟记忆功能增强

## 概述

本功能增强 HeartSpark 伴侣模式的记忆系统，使 AI 角色能够主动记住用户的互动。

## 前置条件

1. 已安装 HeartSpark/opencode
2. 已配置伴侣模式 (`--companion`)

## 功能列表

### 1. AI 主动记忆

当用户告诉 AI 重要信息时，AI 会主动记住并保存。

**示例**:
```
用户: 我叫小明，喜欢喝美式咖啡
AI: ……我记住了。小明，美式咖啡。我会好好记着的。
```

### 2. 手动保存记忆

使用 `/memory flush` 命令手动保存重要内容。

**命令**:
```
/memory flush 记得我喜欢科幻电影
/memory flush 我今天工作很累
```

### 3. 自动保存

在上下文压缩前，系统会自动保存重要记忆。

## 配置

### 启用伴侣模式

```bash
opencode tui --companion shorekeeper
```

### 记忆文件位置

```
persona/<persona_id>/memory/
├── MEMORY.md      # 长期记忆
├── USER.md        # 用户信息
├── SOUL.md        # 角色人格
└── daily/
    └── YYYY-MM-DD.md  # 每日记忆
```

## 故障排除

### AI 不主动记录

检查 integration_prompt.md 是否包含记忆操作指令。

### /memory 命令不生效

检查 TUI 命令是否正确注册。

### 记忆不加载

检查记忆文件是否存在，路径是否正确。
