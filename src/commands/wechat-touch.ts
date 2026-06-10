import { Command } from "commander";
import { createApiClient } from "../lib/api-client.js";
import { readConfig } from "../lib/config.js";

type TeamSummaryOptions = {
  startDate?: string;
  endDate?: string;
};

function today(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function registerWechatTouchCommands(program: Command): void {
  const wechatTouch = program
    .command("wechat-touch")
    .description("Wechat touch commands");

  wechatTouch
    .command("stats")
    .description("Get wechat touch stats (all users)")
    .action(async () => {
      const config = await readConfig();

      if (!config.token) {
        throw new Error("No saved token. Run `primecli auth login` first.");
      }

      const client = createApiClient(config.token);
      const data = await client.get("/api/wechat-touch/stats");
      console.log(JSON.stringify(data, null, 2));
    });

  wechatTouch
    .command("team-summary")
    .description("Get team summary by day or time period")
    .option("--start-date <date>", "Start date (yyyy-MM-dd)", today())
    .option("--end-date <date>", "End date (yyyy-MM-dd)", today())
    .action(async (options: TeamSummaryOptions) => {
      const config = await readConfig();

      if (!config.token) {
        throw new Error("No saved token. Run `primecli auth login` first.");
      }

      const startDate = options.startDate ?? today();
      const endDate = options.endDate ?? today();
      const params = new URLSearchParams({ startDate, endDate });

      const client = createApiClient(config.token);
      const data = await client.get(
        `/api/wechat-touch/team-summary?${params.toString()}`,
      );
      console.log(JSON.stringify(data, null, 2));
    });
}
