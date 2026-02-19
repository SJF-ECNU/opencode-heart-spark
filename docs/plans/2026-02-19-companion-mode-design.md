# 虚拟伴侣模式设计方案

## 概述

在 OpenCode 中新增"伴侣模式"，利用现有的 CLI UI 和 Agent 能力，实现虚拟伴侣聊天功能。保留原有代码编辑功能，用户可通过启动参数选择进入伴侣模式或代码编辑模式。

## 核心设计

### 1. 启动方式

新增 `--companion` 或 `-c` 启动参数：

```bash
opencode --companion          # 进入伴侣模式，启动时选择角色
opencode                     # 正常代码编辑模式（保持不变）
```

进入伴侣模式时：
- 显示角色选择菜单（内置角色 + 自定义角色）
- 加载选中的角色设定
- 进入纯聊天界面（不打开工作目录）

### 2. 角色文件夹结构

角色存放在项目目录的 `persona/` 文件夹下：

```
persona/
├── default/                    # 内置默认角色
│   ├── 00_metadata/
│   │   ├── version.md
│   │   └── design_principles.md
│   ├── 01_identity/
│   │   ├── basic_profile.md
│   │   ├── appearance.md
│   │   ├── temperament_tags.md
│   │   └── public_image.md
│   ├── 02_psychological_core/
│   │   ├── attachment_style.md
│   │   ├── core_beliefs.md
│   │   ├── values.md
│   │   ├── fears.md
│   │   ├── insecurities.md
│   │   └── self_concept.md
│   ├── 03_cognitive_model/
│   │   ├── decision_logic.md
│   │   ├── moral_framework.md
│   │   ├── conflict_evaluation.md
│   │   └── jealousy_logic.md
│   ├── 04_emotional_system/
│   │   ├── baseline_emotion.md
│   │   ├── positive_triggers.md
│   │   ├── negative_triggers.md
│   │   ├── shame_triggers.md
│   │   ├── anger_pattern.md
│   │   └── affection_expression.md
│   ├── 05_behavior_system/
│   │   ├── speech_style/
│   │   │   ├── tone.md
│   │   │   ├── texting_pattern.md
│   │   │   ├── humor_style.md
│   │   │   └── flirting_style.md
│   │   ├── conflict_behavior.md
│   │   ├── intimacy_behavior.md
│   │   └── withdrawal_behavior.md
│   ├── 06_relationship_framework/
│   │   ├── ideal_partner.md
│   │   ├── boundaries.md
│   │   ├── attachment_dynamics.md
│   │   ├── commitment_logic.md
│   │   ├── breakup_conditions.md
│   │   └── reconciliation_logic.md
│   └── system/
│       ├── integration_prompt.md
│       └── consistency_rules.md
│
└── custom/                    # 用户自定义角色目录
    └── ...                    # 复制 default 结构并修改
```

### 3. 角色加载机制

Agent 启动时自动读取角色文件夹下的所有 `.md` 文件，按以下顺序拼接为系统提示词：

1. `system/integration_prompt.md` - 整合提示词（主 prompt）
2. `system/consistency_rules.md` - 一致性规则
3. `01_identity/` - 身份信息
4. `02_psychological_core/` - 心理核心
5. `03_cognitive_model/` - 认知模型
6. `04_emotional_system/` - 情绪系统
7. `05_behavior_system/` - 行为系统
8. `06_relationship_framework/` - 关系框架
9. `00_metadata/` - 元数据（可选）

### 4. 对话历史管理

- 使用 OpenCode 原生对话历史记录系统
- 伴侣模式下的会话自动标记，可在历史记录中区分
- 不需要额外实现，复用现有 Session 管理

### 5. 权限系统

- 伴侣模式默认使用更宽松的权限配置
- 用户可通过权限命令调整（如 `/permission allow all`）
- 保持原有权限框架，仅修改默认行为

## 实现计划

### Phase 1: 基础设施

1. 创建 `persona/default/` 内置角色目录和文件
2. 新增角色加载工具函数（读取 md 文件并拼接）
3. 新增 `--companion` 参数解析

### Phase 2: 核心功能

4. 新增伴侣模式启动逻辑
5. 实现角色选择界面（TUI）
6. Agent 集成角色提示词

### Phase 3: 完善

7. 添加角色管理命令（可选）
8. 支持自定义角色目录
9. 优化角色加载性能

## 文件变更预估

- 新增：`persona/default/` （约 25 个 md 文件）
- 修改：`packages/opencode/src/cli/cmd/run.ts` （添加参数）
- 修改：`packages/opencode/src/agent/` （集成角色加载）
- 新增：`packages/opencode/src/persona/` （角色加载工具）

## 兼容性

- 不影响现有代码编辑功能
- 原有启动方式完全兼容
- 对话历史格式兼容
