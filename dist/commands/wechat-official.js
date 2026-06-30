import { createApiClient } from "../lib/api-client.js";
import { readConfig } from "../lib/config.js";
import { requireRole } from "../lib/roles.js";
import { parseUnixTimestampOption, validateDateOption, } from "../lib/validation.js";
function today() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}
export function registerWechatOfficialCommands(program) {
    const wechatOfficial = program
        .command("wechat-official")
        .description("WeChat official account commands");
    const articles = wechatOfficial
        .command("articles")
        .description("WeChat official account article commands");
    articles
        .command("fetch")
        .description("Fetch latest WeChat official account articles")
        .hook("preAction", requireRole("SUPER_ADMIN"))
        .action(async () => {
        const client = await createAuthorizedClient();
        const data = await client.post("/api/wechat-official/articles/fetch");
        console.log(JSON.stringify(data, null, 2));
    });
    articles
        .command("accounts")
        .description("List WeChat official accounts by tag")
        .option("--tag <tag>", "Account tag", "hot")
        .action(async (options) => {
        const tag = options.tag.trim();
        if (!tag) {
            throw new Error("Tag must not be blank.");
        }
        const params = new URLSearchParams({ tag });
        const client = await createAuthorizedClient();
        const data = await client.get(`/api/wechat-official/articles/accounts?${params.toString()}`);
        console.log(JSON.stringify(data, null, 2));
    });
    articles
        .command("by-fakeid")
        .description("List WeChat official account articles by fakeid")
        .requiredOption("--fakeids <fakeids>", "Comma-separated fakeid list")
        .option("--date <date>", "Date window (yyyy-MM-dd)", today())
        .option("--start-time <timestamp>", "Start Unix timestamp")
        .option("--end-time <timestamp>", "End Unix timestamp")
        .action(async (options) => {
        const fakeids = normalizeFakeids(options.fakeids);
        const window = getTimeWindow(options);
        const params = new URLSearchParams({
            fakeids,
            startTime: String(window.startTime),
            endTime: String(window.endTime),
        });
        const client = await createAuthorizedClient();
        const data = await client.get(`/api/wechat-official/articles/by-fakeid?${params.toString()}`);
        console.log(JSON.stringify(data, null, 2));
    });
    const credentials = wechatOfficial
        .command("credentials")
        .description("WeChat official account credential commands");
    credentials
        .command("update")
        .description("Update WeChat official account backend credentials")
        .requiredOption("--id <id>", "wechat_official_account.id")
        .requiredOption("--token <token>", "WeChat official account token")
        .requiredOption("--cookie <cookie>", "WeChat official account cookie")
        .option("--dry-run", "Print request without calling the API")
        .hook("preAction", requireRole("SUPER_ADMIN"))
        .action(async (options) => {
        const id = options.id.trim();
        const body = {
            token: requireNonBlank(options.token, "Token"),
            cookie: requireNonBlank(options.cookie, "Cookie"),
        };
        if (!id) {
            throw new Error("ID must not be blank.");
        }
        const path = `/api/wechat-official/accounts/${encodeURIComponent(id)}/credentials`;
        if (options.dryRun) {
            printDryRun("PUT", path, body);
            return;
        }
        const client = await createAuthorizedClient();
        const data = await client.put(path, body);
        console.log(JSON.stringify(data, null, 2));
    });
}
async function createAuthorizedClient() {
    const config = await readConfig();
    if (!config.token) {
        throw new Error("No saved token. Run `primecli auth login` first.");
    }
    return createApiClient(config);
}
function normalizeFakeids(value) {
    const fakeids = value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    if (fakeids.length === 0) {
        throw new Error("Fakeids must include at least one fakeid.");
    }
    return fakeids.join(",");
}
function getTimeWindow(options) {
    const date = validateDateOption(options.date ?? today(), "Date");
    const defaultWindow = unixDayWindow(date);
    const startTime = options.startTime
        ? parseUnixTimestampOption(options.startTime, "Start time")
        : defaultWindow.startTime;
    const endTime = options.endTime
        ? parseUnixTimestampOption(options.endTime, "End time")
        : defaultWindow.endTime;
    if (startTime > endTime) {
        throw new Error("Start time must be less than or equal to end time.");
    }
    return { startTime, endTime };
}
function unixDayWindow(date) {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59`);
    return {
        startTime: Math.floor(start.getTime() / 1000),
        endTime: Math.floor(end.getTime() / 1000),
    };
}
function requireNonBlank(value, name) {
    const trimmed = value.trim();
    if (!trimmed) {
        throw new Error(`${name} must not be blank.`);
    }
    return trimmed;
}
function printDryRun(method, path, body) {
    console.log(JSON.stringify({
        dryRun: true,
        method,
        path,
        body,
    }, null, 2));
}
