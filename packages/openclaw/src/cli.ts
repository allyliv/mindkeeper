import type { Tracker } from "mindkeeper";

export function registerTrackerCli(
  api: { registerCli?(registrar: (program: unknown) => void): void },
  tracker: Tracker,
): void {
  if (!api.registerCli) return;

  api.registerCli((program: unknown) => {
    const cmd = program as {
      command(name: string): CommandBuilder;
    };

    const mindCmd = cmd.command("mind");
    addSubcommand(mindCmd, "status", "Show tracking status", async () => {
      const status = await tracker.status();
      console.log(`Workspace: ${status.workDir}`);
      console.log(`Pending changes: ${status.pendingChanges.length}`);
      console.log(`Named snapshots: ${status.snapshots.length}`);
    });

    addSubcommand(mindCmd, "history [file]", "View change history", async (...args: unknown[]) => {
      const file = args[0] as string | undefined;
      const commits = await tracker.history({ file, limit: 20 });
      if (commits.length === 0) {
        console.log("No history found.");
        return;
      }
      for (const c of commits) {
        const date = c.date.toISOString().replace("T", " ").slice(0, 19);
        console.log(`${c.oid.slice(0, 8)}  ${date}  ${c.message}`);
      }
    });

    addSubcommand(
      mindCmd,
      "snapshot [name]",
      "Create a named snapshot",
      async (...args: unknown[]) => {
        const name = args[0] as string | undefined;
        const commit = await tracker.snapshot({ name });
        console.log(`Snapshot created: ${commit.oid.slice(0, 8)} ${commit.message}`);
        if (name) console.log(`Tagged as: ${name}`);
      },
    );
  });
}

interface CommandBuilder {
  command(name: string): CommandBuilder;
  description(desc: string): CommandBuilder;
  action(fn: (...args: unknown[]) => Promise<void>): CommandBuilder;
}

function addSubcommand(
  parent: CommandBuilder,
  name: string,
  description: string,
  handler: (...args: unknown[]) => Promise<void>,
): void {
  parent.command(name).description(description).action(handler);
}
