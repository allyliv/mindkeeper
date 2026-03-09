import { describe, expect, it, vi } from "vitest";
import { registerTrackerTools } from "../src/tools.js";

function getRegisteredTools() {
  const tools: Array<{
    name: string;
    execute: (toolCallId: string, params: Record<string, unknown>) => Promise<{
      content: Array<{ type: "text"; text: string }>;
      details?: unknown;
    }>;
  }> = [];

  registerTrackerTools(
    {
      registerTool: (tool) => {
        tools.push(tool as typeof tools[number]);
      },
    },
    { current: null as never },
  );

  return tools;
}

function parseToolPayload(result: { content: Array<{ type: "text"; text: string }> }) {
  return JSON.parse(result.content[0]?.text ?? "{}") as Record<string, unknown>;
}

describe("registerTrackerTools", () => {
  it("registers all expected tools", () => {
    const tools = getRegisteredTools();
    expect(tools.map((tool) => tool.name)).toEqual([
      "mind_history",
      "mind_diff",
      "mind_rollback",
      "mind_snapshot",
      "mind_status",
    ]);
  });

  it("returns rollback preview without executing rollback", async () => {
    const diff = vi.fn().mockResolvedValue({
      file: "SOUL.md",
      fromVersion: "12345678",
      toVersion: "HEAD",
      additions: 1,
      deletions: 2,
      unified: "@@ preview @@",
    });
    const rollback = vi.fn();
    const registered: ReturnType<typeof getRegisteredTools> = [];

    registerTrackerTools(
      {
        registerTool: (tool) => {
          registered.push(tool as typeof registered[number]);
        },
      },
      {
        current: {
          diff,
          rollback,
        } as never,
      },
    );

    const rollbackTool = registered.find((tool) => tool.name === "mind_rollback");
    const result = await rollbackTool!.execute("call-1", {
      file: "SOUL.md",
      to: "1234567890abcdef",
      preview: true,
    });

    const payload = parseToolPayload(result);
    expect(diff).toHaveBeenCalledWith({
      file: "SOUL.md",
      from: "1234567890abcdef",
      to: "HEAD",
    });
    expect(rollback).not.toHaveBeenCalled();
    expect(payload.preview).toBe(true);
    expect(payload.instruction).toContain("preview=false");
  });

  it("executes rollback when preview is false", async () => {
    const rollback = vi.fn().mockResolvedValue({
      oid: "abcdef1234567890",
      message: "[rollback] Restore SOUL.md",
    });
    const registered = getRegisteredTools();

    registerTrackerTools(
      {
        registerTool: (tool) => {
          registered.push(tool as typeof registered[number]);
        },
      },
      {
        current: {
          rollback,
        } as never,
      },
    );

    const rollbackTool = registered.findLast((tool) => tool.name === "mind_rollback");
    const result = await rollbackTool!.execute("call-2", {
      file: "SOUL.md",
      to: "abcdef1234567890",
      preview: false,
    });

    const payload = parseToolPayload(result);
    expect(rollback).toHaveBeenCalledWith({
      file: "SOUL.md",
      to: "abcdef1234567890",
    });
    expect(payload).toMatchObject({
      preview: false,
      success: true,
      note: "Tell the user to run /new to apply the changes to the current session.",
    });
    expect(payload.commit).toMatchObject({
      oid: "abcdef12",
      message: "[rollback] Restore SOUL.md",
    });
  });
});
