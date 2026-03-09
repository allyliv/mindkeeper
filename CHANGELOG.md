# Changelog

## [0.2.27] - 2026-03-09

### Fixed (mindkeeper-openclaw)

- **Plugin-only install now works without ClawHub skill** — The plugin mirrors its built-in `mindkeeper` skill into the workspace on startup, so new `/new` sessions can find the bootstrap instructions even when no separate `clawhub install mindkeeper` was run.
- **Bootstrap logic no longer misreports "plugin not installed"** — When `mind_status` fails, the AI now considers Gateway loading, session timing, or missing skill context before assuming the plugin is missing.
