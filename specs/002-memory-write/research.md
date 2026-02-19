# Research: 恋爱模拟记忆功能增强

**Date**: 2026-02-19
**Feature**: 002-memory-write

## 1. 伴侣模式工具限制研究

### Decision: 有条件开放 Write 工具

**Rationale**:
- 当前伴侣模式下明确禁止了 Write、Edit、Glob 工具
- 禁止是为了保持沉浸感，防止 AI 修改系统文件
- 记忆功能需要 Write 工具来写入内存文件

**Implementation Approach**:

1. **方案 A：路径白名单**
   - 只允许写入 `persona/<persona_id>/memory/` 目录
   - 在工具调用前验证路径

2. **方案 B：特殊命令模式**
   - 不直接开放 Write 工具
   - 通过特殊的内部命令机制触发写入
   - 用户无感知

**推荐方案 A**，原因：
- 实现简单，不增加复杂性
- 路径验证可靠
- AI 可以主动写入，不需要额外接口

### 当前禁止的工具

```typescript
// prompt.ts 第 670-691 行
禁止使用以下工具：
- Bash: 执行命令
- Edit: 编辑文件
- Write: 写入文件
- Glob: 查看文件列表
- Task: 启动子任务
- Session: 会话管理
- 任何文件操作工具
```

需要修改为：
- **允许 Write**：只限于 `persona/<persona_id>/memory/` 目录
- **允许 Read**：所有 persona 文件

---

## 2. TUI 命令注册机制研究

### Decision: 命令解析 + 内部调用

**Rationale**:
- 用户输入 `/memory flush xxx` 需要被解析
- 命令需要被路由到 memory-commands.ts
- 需要确保命令可以被正确识别和执行

**Implementation Approach**:

1. **用户输入 `/memory flush [内容]`**
2. **TUI 解析命令** → 识别为 memory 命令
3. **执行 memory-commands.ts 中的 cmdFlushMemory**
4. **返回结果给用户**

---

## 3. 上下文压缩集成研究

### Decision: 订阅 SessionCompaction 事件

**Rationale**:
- 已有 `SessionCompaction.Event.Compacted` 事件
- auto-flush.ts 已经订阅了这个事件
- 需要确保在压缩前触发保存

**Implementation**:

```typescript
// auto-flush.ts
Bus.subscribe(SessionCompaction.Event.Compacted, async (event) => {
  // 在会话压缩后保存记忆
  await flushMemory(memoryStore, { auto: true });
});
```

**注意**: 当前是在压缩后保存，可能需要改为压缩前

---

## 4. 记忆操作提示词研究

### Decision: 在 integration_prompt.md 中添加详细指令

**需要告知 AI**:
1. 什么时候应该读取记忆
2. 什么时候应该写入记忆
3. 如何格式化和写入记忆

**提示词示例**:

```markdown
## 记忆系统

### 读取记忆
- 当用户问起之前聊过的话题时，主动读取 MEMORY.md
- 当用户提到过去的事情时，搜索相关记忆

### 写入记忆
- 当用户告诉你关于他们的事情（名字、偏好等），写入 USER.md
- 当发生重要对话时，写入 daily/YYYY-MM-DD.md
- 使用 Write 工具，写入 persona/shorekeeper/memory/ 目录

### 写入格式
- 在 USER.md 中更新"你告诉过我的重要事情"部分
- 在 daily/YYYY-MM-DD.md 的 Retain 部分添加:
  - W @漂泊者: [用户说的重要内容]
  - B @守岸人: [你的反应]
```

---

## Summary

| Decision | Rationale |
|---------|-----------|
| 有条件开放 Write 工具 | 路径白名单确保安全 |
| 命令解析 + 内部调用 | 复用现有命令系统 |
| 订阅 compaction 事件 | 利用现有事件机制 |
| 详细提示词指导 | 确保 AI 正确使用记忆 |
