import { Command } from "commander";
import { createApiClient } from "../lib/api-client.js";
import { readConfig } from "../lib/config.js";

type TeamSummaryOptions = {
  startDate?: string;
  endDate?: string;
};

type DistributeOptions = {
  userId: string;
  count: string;
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

  wechatTouch
    .command("distribution-users")
    .description("List users available for contact distribution")
    .action(async () => {
      const config = await readConfig();

      if (!config.token) {
        throw new Error("No saved token. Run `primecli auth login` first.");
      }

      const client = createApiClient(config.token);
      const data = await client.get(
        "/api/wechat-touch/distributions/users",
      );
      console.log(JSON.stringify(data, null, 2));
    });

  wechatTouch
    .command("distribute")
    .description("Distribute contacts to a user")
    .requiredOption("-u, --user-id <userId>", "Target user ID")
    .requiredOption("-c, --count <count>", "Number of contacts to distribute")
    .action(async (options: DistributeOptions) => {
      const config = await readConfig();

      if (!config.token) {
        throw new Error("No saved token. Run `primecli auth login` first.");
      }

      const count = parseInt(options.count, 10);

      if (isNaN(count) || count < 1 || count > 150) {
        throw new Error("Count must be a number between 1 and 150.");
      }

      const client = createApiClient(config.token);
      const data = await client.post(
        "/api/wechat-touch/distributions",
        { userId: options.userId, count },
      );
      console.log(JSON.stringify(data, null, 2));
    });
}
