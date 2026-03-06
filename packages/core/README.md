# mindkeeper

**Time Machine for Your AI's Brain** — version control for agent context files (AGENTS.md, SOUL.md, MEMORY.md, and more).

Every personality tweak, every rule change, every memory — tracked, diffable, and reversible.

## Install

```bash
npm install -g mindkeeper
```

## Quick Start

```bash
# Initialize for a workspace
mindkeeper init --dir ~/.openclaw/workspace

# View history
mindkeeper history SOUL.md --dir ~/.openclaw/workspace

# Compare versions
mindkeeper diff SOUL.md abc1234 --dir ~/.openclaw/workspace

# Rollback
mindkeeper rollback SOUL.md abc1234 --dir ~/.openclaw/workspace

# Named checkpoint
mindkeeper snapshot stable-v2 --dir ~/.openclaw/workspace

# Background watcher (auto-snapshot on file changes)
mindkeeper watch --dir ~/.openclaw/workspace
```

## CLI Reference

| Command | Description |
|---------|-------------|
| `init` | Initialize mindkeeper for a directory |
| `status` | Show tracking status and pending changes |
| `history [file]` | View change history (optionally filtered by file) |
| `diff <file> <from> [to]` | Compare two versions of a file |
| `rollback <file> <to>` | Rollback a file with preview and confirmation |
| `snapshot [name]` | Create a named checkpoint |
| `watch` | Start background watcher daemon |

All commands accept `--dir <path>` to specify the workspace.

## Programmatic API

```javascript
import { Tracker, Watcher } from "mindkeeper";

const tracker = new Tracker({ workDir: "/path/to/workspace" });
await tracker.init();

// Snapshot
await tracker.snapshot({ name: "my-checkpoint" });

// History
const commits = await tracker.history({ file: "SOUL.md", limit: 10 });

// Diff
const diff = await tracker.diff({ file: "SOUL.md", from: "abc1234" });

// Rollback
await tracker.rollback({ file: "SOUL.md", to: "abc1234" });
```

## How It Works

mindkeeper maintains a shadow Git repository in `<workspace>/.mindkeeper/` using [isomorphic-git](https://isomorphic-git.org/) (pure JavaScript, no system Git required). Files stay in place; only history metadata is stored.

## Configuration

- **Workspace**: `.mindkeeper.json` in workspace root (tracked, shareable)
- **Global**: `~/.config/mindkeeper/config.json` (for API keys, never tracked)

## Links

- [GitHub](https://github.com/seekcontext/mindkeeper)
- [OpenClaw Plugin](https://www.npmjs.com/package/mindkeeper-openclaw) — AI-integrated version with `mind_*` tools

## License

MIT
