# Mindkeeper Skill

Time Machine for Your AI's Brain — version control for agent context files. This skill teaches your AI to use mindkeeper tools for history, diff, rollback, and snapshots.

**Drop-in setup:** Add this skill alone — the AI will automatically install the mindkeeper-openclaw plugin and restart the Gateway when you first ask for mindkeeper capability. No manual steps required.

## What It Does

- **Browse history** — See what changed in SOUL.md, AGENTS.md, or any tracked file
- **Compare versions** — Full unified diff between any two commits
- **Rollback** — Restore any file to a previous version (with preview + confirmation)
- **Named snapshots** — Create checkpoints before risky changes

## Requirements

- Node.js ≥ 22
- OpenClaw with Gateway running

The mindkeeper-openclaw plugin is installed automatically by the AI when you first use mindkeeper (see Bootstrap in SKILL.md).

## How to Use

1. Install this skill: `clawhub install mindkeeper`
2. Ask your AI in natural language (plugin install + restart happen automatically on first use):
   - "What changed in SOUL.md recently?"
   - "Compare my current AGENTS.md to last week's version"
   - "Roll back SOUL.md to yesterday"
   - "Save a checkpoint called 'perfect-personality' before I experiment"

## Examples

| User says | AI action |
|-----------|------------|
| "What changed in SOUL.md?" | `mind_history` with file filter |
| "Show me the diff from last week" | `mind_history` → find commit → `mind_diff` |
| "Undo that change" | `mind_rollback` (preview first, then execute) |
| "Save a checkpoint before I experiment" | `mind_snapshot` with descriptive name |

## Troubleshooting

- **History is empty** — Call `mind_status` to check if mindkeeper is initialized. Make a small edit to a tracked file to trigger the first snapshot.
- **Tools not found** — Ensure the mindkeeper-openclaw plugin is installed and Gateway has been restarted.
- **Rollback not applying** — After rollback, tell the user to run `/new` to reload the session with the restored file.

## Links

- [mindkeeper on GitHub](https://github.com/seekcontext/mindkeeper)
- [mindkeeper-openclaw on npm](https://www.npmjs.com/package/mindkeeper-openclaw)
