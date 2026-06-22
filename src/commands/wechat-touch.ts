import { Command } from "commander";
import { createApiClient } from "../lib/api-client.js";
import { readConfig } from "../lib/config.js";
import { requireRole } from "../lib/roles.js";
import { parseIntegerOption, validateDateOption } from "../lib/validation.js";

type TeamSummaryOptions = {
  startDate?: string;
  endDate?: string;
};

type DistributeOptions = {
  userId: string;
  count: number;
};

type ItemsOptions = {
  date?: string;
  userId?: string;
  groupBound?: boolean;
  page?: string;
  size?: string;
};

type ChatOptions = {
  roomId: string;
  page?: string;
  size?: string;
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

      const client = createApiClient(config);
      const data = await client.get("/api/wechat-touch/stats");
      console.log(JSON.stringify(data, null, 2));
    });

  wechatTouch
    .command("team-summary")
    .description("Get team summary by day or time period")
    .option("--start-date <date>", "Start date (yyyy-MM-dd)", today())
    .option("--end-date <date>", "End date (yyyy-MM-dd)", today())
    .action(async (options: TeamSummaryOptions) => {
      const startDate = validateDateOption(
        options.startDate ?? today(),
        "Start date",
      );
      const endDate = validateDateOption(
        options.endDate ?? today(),
        "End date",
      );
      const config = await readConfig();

      if (!config.token) {
        throw new Error("No saved token. Run `primecli auth login` first.");
      }

      const params = new URLSearchParams({ startDate, endDate });

      const client = createApiClient(config);
      const data = await client.get(
        `/api/wechat-touch/team-summary?${params.toString()}`,
      );
      console.log(JSON.stringify(data, null, 2));
    });

  wechatTouch
    .command("distribution-users")
    .description("List users available for contact distribution")
    .hook("preAction", requireRole("SUPER_ADMIN"))
    .action(async () => {
      const config = await readConfig();

      if (!config.token) {
        throw new Error("No saved token. Run `primecli auth login` first.");
      }

      const client = createApiClient(config);
      const data = await client.get("/api/wechat-touch/distributions/users");
      console.log(JSON.stringify(data, null, 2));
    });

  wechatTouch
    .command("distribute")
    .description("Distribute contacts to a user")
    .requiredOption("-u, --user-id <userId>", "Target user ID")
    .requiredOption(
      "-c, --count <count>",
      "Number of contacts to distribute",
      (value: string) =>
        parseIntegerOption(value, "Count", 1, { min: 1, max: 150 }),
    )
    .hook("preAction", requireRole("SUPER_ADMIN"))
    .action(async (options: DistributeOptions) => {
      const config = await readConfig();

      if (!config.token) {
        throw new Error("No saved token. Run `primecli auth login` first.");
      }

      const client = createApiClient(config);
      const data = await client.post("/api/wechat-touch/distributions", {
        userId: options.userId,
        count: options.count,
      });
      console.log(JSON.stringify(data, null, 2));
    });

  wechatTouch
    .command("items")
    .description("List wechat touch follow-up items")
    .option("--date <date>", "Filter by date (yyyy-MM-dd)")
    .option("--user-id <userId>", "Filter by owner user ID")
    .option("--group-bound", "Filter by group chat bound status")
    .option("--no-group-bound", "Filter by group chat unbound status")
    .option("--page <page>", "Page number", "1")
    .option("--size <size>", "Page size", "50")
    .action(async (options: ItemsOptions) => {
      const page = parseIntegerOption(options.page, "Page", 1, { min: 1 });
      const size = parseIntegerOption(options.size, "Size", 50, { min: 1 });
      const date = options.date
        ? validateDateOption(options.date, "Date")
        : undefined;
      const config = await readConfig();

      if (!config.token) {
        throw new Error("No saved token. Run `primecli auth login` first.");
      }

      const params = new URLSearchParams();
      if (date) params.set("date", date);
      if (options.userId) params.set("userId", options.userId);
      if (options.groupBound !== undefined) {
        params.set("groupBound", String(options.groupBound));
      }
      params.set("page", String(page));
      params.set("size", String(size));

      const client = createApiClient(config);
      const data = await client.get(
        `/api/wechat-touch/items?${params.toString()}`,
      );
      console.log(JSON.stringify(data, null, 2));
    });

  wechatTouch
    .command("chat")
    .description("Get group chat content by roomId")
    .requiredOption("--room-id <roomId>", "Room ID of the bound group chat")
    .option("--page <page>", "Page number", "1")
    .option("--size <size>", "Page size", "20")
    .hook("preAction", requireRole("SUPER_ADMIN"))
    .action(async (options: ChatOptions) => {
      const page = parseIntegerOption(options.page, "Page", 1, { min: 1 });
      const size = parseIntegerOption(options.size, "Size", 20, { min: 1 });
      const config = await readConfig();

      if (!config.token) {
        throw new Error("No saved token. Run `primecli auth login` first.");
      }

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("size", String(size));

      const client = createApiClient(config);
      const data = await client.get(
        `/api/wechat-touch/rooms/${options.roomId}/messages?${params.toString()}`,
      );
      console.log(JSON.stringify(data, null, 2));
    });
}
