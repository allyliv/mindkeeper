# mindkeeper-openclaw

**Time Machine for Your AI's Brain** — OpenClaw plugin that gives your AI version control for agent context files.

Every change to AGENTS.md, SOUL.md, MEMORY.md, skills, and more is automatically tracked. Your AI can browse history, compare versions, create checkpoints, and roll back any file.

## Install

```bash
openclaw plugins install mindkeeper-openclaw
```

Restart your Gateway once. The plugin auto-starts a background watcher and registers 5 tools.

## Talk to Your AI

Once installed, ask in natural language:

- *"What changed in SOUL.md recently?"*
- *"Compare my current AGENTS.md to last week's version"*
- *"Roll back SOUL.md to yesterday"*
- *"Save a checkpoint called 'perfect-personality' before I experiment"*

## Agent Tools

| Tool | What It Does |
|------|--------------|
| `mind_history` | Browse change history for any tracked file |
| `mind_diff` | Compare any two versions with full unified diff |
| `mind_rollback` | Two-step rollback: preview first, then execute after confirmation |
| `mind_snapshot` | Create named checkpoints before risky changes |
| `mind_status` | Show what files are tracked and what's changed |

## OpenClaw CLI

```bash
openclaw mind status              # See what's tracked and pending
openclaw mind history SOUL.md     # Browse SOUL.md change history
openclaw mind snapshot stable-v2  # Save a named checkpoint
```

## Requirements

- Node.js ≥ 22
- OpenClaw with Gateway running

## Links

- [GitHub](https://github.com/seekcontext/mindkeeper)
- [Core CLI](https://www.npmjs.com/package/mindkeeper) — Standalone version without OpenClaw

## License

MIT
