import type { Tracker } from "mindkeeper";
import { registerTrackerTools } from "./tools.js";
import { registerTrackerCli } from "./cli.js";
import { createWatcherService } from "./service.js";
import { createOpenClawLlmProvider } from "./llm-provider.js";

/**
 * OpenClaw Plugin entry point.
 * Called by OpenClaw's plugin loader with the Plugin API.
 *
 * The workspace directory is NOT available at plugin load time —
 * it is only provided in service.start(ctx). We use a lazy ref so
 * tools and CLI can be registered immediately but defer tracker
 * creation until the service starts.
 */
export default async function mindkeeperPlugin(api: OpenClawPluginApi) {
  const llmProvider = await createOpenClawLlmProvider({
    config: api.config as Record<string, unknown> | undefined,
    pluginConfig: api.pluginConfig,
    log: api.log,
  });

  // Lazy tracker ref — populated by the watcher service on start
  const trackerRef: { current: Tracker | null } = { current: null };

  registerTrackerTools(api, trackerRef);
  registerTrackerCli(api, trackerRef);

  const watcherService = createWatcherService(api, trackerRef, llmProvider ?? undefined);
  api.registerService?.(watcherService);

  api.log?.info?.("[mindkeeper] Plugin loaded.");
}

/**
 * Minimal type definition for OpenClaw Plugin API.
 * Only the methods mindkeeper uses are declared here.
 * In a real build, this would import from openclaw/plugin-sdk.
 */
interface OpenClawPluginApi {
  config?: unknown;
  pluginConfig?: Record<string, unknown>;
  getWorkspaceDir?(): string;
  registerTool?(tool: PluginTool, opts?: Record<string, unknown>): void;
  registerCli?(registrar: (program: unknown) => void): void;
  registerService?(service: PluginService): void;
  registerHook?(events: string[], handler: (...args: unknown[]) => void): void;
  log?: {
    info?(...args: unknown[]): void;
    warn?(...args: unknown[]): void;
    error?(...args: unknown[]): void;
  };
}

interface PluginTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler(args: Record<string, unknown>): Promise<unknown>;
}

interface PluginService {
  id: string;
  start(ctx?: unknown): Promise<void>;
  stop?(ctx?: unknown): Promise<void>;
}
