import { Tracker, Watcher } from "mindkeeper";

interface PluginService {
  id: string;
  start(ctx?: unknown): Promise<void>;
  stop?(ctx?: unknown): Promise<void>;
}

interface PluginApi {
  log?: {
    info?(...args: unknown[]): void;
    warn?(...args: unknown[]): void;
    error?(...args: unknown[]): void;
  };
}

export function createWatcherService(tracker: Tracker, api: PluginApi): PluginService {
  let watcher: Watcher | null = null;

  return {
    id: "mindkeeper-watcher",

    async start() {
      await tracker.init();

      watcher = new Watcher({
        tracker,
        onSnapshot: (commit) => {
          api.log?.info?.(
            `[mindkeeper] Auto-snapshot ${commit.oid.slice(0, 8)}: ${commit.message}`,
          );
        },
        onError: (err) => {
          api.log?.error?.(`[mindkeeper] Watcher error: ${err.message}`);
        },
      });

      await watcher.start();
      api.log?.info?.(
        `[mindkeeper] Watching ${tracker.workDir} (debounce: ${tracker.getConfig().snapshot.debounceMs}ms)`,
      );
    },

    async stop() {
      if (watcher) {
        await watcher.stop();
        watcher = null;
        api.log?.info?.("[mindkeeper] Watcher stopped.");
      }
    },
  };
}
