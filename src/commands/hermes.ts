import { Command } from "commander";
import { createApiClient } from "../lib/api-client.js";
import { readConfig } from "../lib/config.js";

export function registerHermesCommands(program: Command): void {
  const hermes = program
    .command("hermes")
    .description("Hermes agent commands");

  hermes
    .command("prompt <code>")
    .description("Get HermesAgent prompt by code")
    .action(async (code: string) => {
      const normalizedCode = code?.trim();
      if (!normalizedCode) {
        throw new Error("Prompt code is required.");
      }

      const config = await readConfig();
      const client = createApiClient(config);
      const data = await client.get(
        `/api/hermes/prompts/${encodeURIComponent(normalizedCode)}`,
      );
      console.log(JSON.stringify(data, null, 2));
    });
}
