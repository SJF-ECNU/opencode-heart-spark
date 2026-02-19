# Research: Personalized Memory System for HeartSpark

**Date**: 2026-02-19
**Feature**: 001-personalized-memory

## 1. QMD 集成方式研究

### Decision: 集成 QMD CLI 作为可选后端

**Rationale**:
- QMD 提供成熟的 BM25 + 向量混合搜索能力
- 支持离线优先架构，与 OpenClaw 设计一致
- 有自动回退机制，QMD 不可用时不影响基础功能

**Alternatives considered**:
1. 纯 BM25 搜索 - 简单但缺乏语义理解能力
2. 纯向量搜索 - 需要 embedding 服务，不符合离线优先原则
3. 自实现混合搜索 - 维护成本高

### Implementation Approach

```typescript
// QMD 调用方式：通过 child_process 执行 qmd CLI
import { exec } from 'child_process';

async function qmdSearch(query: string, memoryPath: string) {
  return new Promise((resolve, reject) => {
    exec(`qmd query "${query}" -c ${memoryPath} --json`, (err, stdout) => {
      if (err) reject(err);
      else resolve(JSON.parse(stdout));
    });
  });
}
```

**配置路径**: `~/.heartspark/personas/<persona_id>/memory/qmd/`

---

## 2. 文件锁定机制研究

### Decision: 使用文件锁 + 原子写入

**Rationale**:
- 简单可靠，适合单用户场景
- 不会阻塞正常读写
- 兼容 Markdown 文件格式

**Implementation Approach**:

```typescript
import { writeFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';

// 1. 读取现有内容
// 2. 合并新内容
// 3. 原子写入 (writeFile 默认原子)
async function appendToMemory(filePath: string, content: string) {
  let existing = '';
  if (existsSync(filePath)) {
    existing = await readFile(filePath, 'utf-8');
  }
  await writeFile(filePath, existing + '\n' + content, 'utf-8');
}
```

**注意**: 多个并发写入场景需要队列机制，暂时只支持单用户顺序写入

---

## 3. 上下文压缩检测研究

### Decision: 基于 token 估算的软阈值触发

**Rationale**:
- OpenClaw 使用 token 估算来预测上下文压缩时机
- 简单可靠，易于实现

**Implementation Approach**:

```typescript
interface CompactionConfig {
  contextWindow: number;        // e.g., 128000
  reserveTokensFloor: number;  // e.g., 20000
  softThresholdTokens: number; // e.g., 4000
}

function shouldTriggerMemoryFlush(
  estimatedTokens: number,
  config: CompactionConfig
): boolean {
  const threshold =
    config.contextWindow -
    config.reserveTokensFloor -
    config.softThresholdTokens;
  return estimatedTokens > threshold;
}
```

**配置示例**:
- contextWindow: 128000 (Claude 3.5)
- reserveTokensFloor: 20000
- softThresholdTokens: 4000
- 触发阈值: 128000 - 20000 - 4000 = 104000 tokens

---

## 4. 记忆文件结构研究

### Decision: 遵循 OpenClaw 文件布局

**Rationale**:
- 已有成熟的设计验证
- 符合 Markdown 即真理原则
- 便于 QMD 索引

**文件布局**:

```
~/.heartspark/personas/<persona_id>/memory/
├── MEMORY.md                 # 长期记忆 (精选)
├── SOUL.md                   # 角色人格定义
├── USER.md                   # 用户信息
├── IDENTITY.md               # 角色身份
├── AGENTS.md                 # 角色操作指南
├── TOOLS.md                  # 工具笔记
└── memory/                   # 每日记忆目录
    ├── 2026-01-29.md
    ├── 2026-01-30.md
    └── ...
```

### MEMORY.md 结构

```markdown
# 长期记忆

## 关于用户
- **名字**：石季凡
- **职业**：大四学生

## 用户偏好
- 喜欢被叫"宝贝"
- 喜欢讨论电影

## 重要事件
- 2026-02-19: 第一次使用 HeartSpark
```

### 每日记忆结构

```markdown
# 2026-02-19

## 对话记录
- 用户分享了喜欢的电影类型
- 角色推荐了几部电影

## Retain（重要记忆）
- W @用户: 喜欢被叫宝贝
- B @角色: 开始用宝贝称呼用户
```

---

## 5. 命令设计研究

### Decision: TUI 内嵌命令 + 独立命令

**Rationale**:
- 用户在对话中可以直接触发记忆操作
- 也支持独立命令执行复杂操作

**命令设计**:

| 命令 | 触发方式 | 功能 |
|------|----------|------|
| `/memory flush` | TUI 命令 | 主动刷新记忆 |
| `/memory view` | TUI 命令 | 查看所有记忆 |
| `/memory export` | TUI 命令 | 导出记忆 |
| `/memory delete <id>` | TUI 命令 | 删除记忆 |
| `/memory search <query>` | TUI 命令 | 搜索记忆 |

---

## Summary

| Decision | Rationale |
|----------|-----------|
| QMD 作为可选后端 | 成熟方案，支持混合搜索，有回退机制 |
| 文件锁 + 原子写入 | 简单可靠，适合单用户场景 |
| Token 估算触发刷新 | 与 OpenClaw 一致，实现简单 |
| OpenClaw 文件布局 | 成熟设计验证，便于 QMD 索引 |
| TUI 内嵌命令 | 用户体验最佳 |
