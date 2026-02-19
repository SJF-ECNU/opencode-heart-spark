# Quickstart: Personalized Memory System

## 快速开始

### 1. 启用记忆系统

首次使用 companion mode 时，系统会自动为该角色创建记忆目录：

```bash
opencode tui --companion shorekeeper
```

系统会自动创建:
```
~/.heartspark/personas/shorekeeper/memory/
├── MEMORY.md           # 长期记忆
├── SOUL.md            # 角色人格
├── USER.md            # 用户信息
└── memory/            # 每日记忆
    └── YYYY-MM-DD.md  # 当日记忆
```

### 2. 使用记忆命令

在 TUI 中使用以下命令：

| 命令 | 说明 |
|------|------|
| `/memory flush` | 刷新当前会话的重要记忆到持久存储 |
| `/memory view` | 查看所有记忆 |
| `/memory search <query>` | 搜索记忆 |
| `/memory delete <id>` | 删除指定记忆 |
| `/memory export` | 导出记忆备份 |

### 3. 自动记忆

系统会自动：
- 在会话开始时加载历史记忆
- 在对话后自动保存重要内容到每日记忆
- 在上下文压缩前触发记忆刷新提醒

## 配置

### QMD 搜索 (可选)

如果需要语义搜索能力，可以安装 QMD：

```bash
# 安装 QMD
cargo install qmd

# 初始化 QMD 索引
qmd init ~/.heartspark/personas/shorekeeper/memory
```

### 记忆目录位置

默认记忆目录: `~/.heartspark/personas/<persona_id>/memory/`

可以在环境变量中自定义:

```bash
export HEARTSPARK_MEMORY_PATH=/custom/path
```

## 文件格式

### 长期记忆 (MEMORY.md)

```markdown
# 长期记忆

## 关于用户
- **名字**：石季凡
- **职业**：大四学生

## 用户偏好
- 喜欢被叫"宝贝"
- 喜欢讨论电影
```

### 每日记忆 (memory/YYYY-MM-DD.md)

```markdown
# 2026-02-19

## 对话记录
- 14:30 用户: 我今天工作了很长时间
- 14:31 角色: 辛苦啦！要注意休息哦~

## Retain（重要记忆）
- W @用户: 喜欢被叫宝贝
- B @角色: 开始用宝贝称呼用户
```

## 故障排除

### QMD 搜索失败

如果 QMD 不可用，系统会自动回退到内置搜索。

### 记忆文件损坏

检查记忆文件格式是否正确，确保是有效的 Markdown 格式。
