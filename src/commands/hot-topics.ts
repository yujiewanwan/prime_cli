import { Command } from "commander";
import { createApiClient } from "../lib/api-client.js";
import { readConfig } from "../lib/config.js";
import { validateDateOption } from "../lib/validation.js";

type HotTopicsByDateOptions = {
  date: string;
};

export function registerHotTopicsCommands(program: Command): void {
  const hotTopics = program
    .command("hot-topics")
    .description("Hot topics commands");

  hotTopics
    .command("by-date")
    .description("Query hot topics by date")
    .requiredOption("-d, --date <date>", "Date in yyyy-MM-dd format")
    .action(async (options: HotTopicsByDateOptions) => {
      const date = validateDateOption(options.date, "Date");
      const config = await readConfig();

      if (!config.token) {
        throw new Error("No saved token. Run `primecli auth login` first.");
      }

      const client = createApiClient(config);
      const data = await client.get(
        `/api/hot-topics/${encodeURIComponent(date)}`,
      );
      console.log(JSON.stringify(data, null, 2));
    });
}
