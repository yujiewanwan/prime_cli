import { createApiClient } from "../lib/api-client.js";
import { readConfig } from "../lib/config.js";
import { extractRoles, requireRole } from "../lib/roles.js";
import { parseIntegerOption, validateDateOption } from "../lib/validation.js";
function compactText(value) {
    return value && value.trim().length > 0 ? value.trim() : "-";
}
function todoOwnerName(item) {
    const name = compactText(item.userName ?? item.username);
    return name === "-" ? `员工 ${item.userId ?? "?"}` : name;
}
function buildDailyTodoGroupName(item) {
    const parts = [
        compactText(item.companyName),
        todoOwnerName(item),
        "美加线Prime",
    ];
    const nickname = item.wechatNickname?.trim();
    if (nickname) {
        parts.splice(1, 0, nickname);
    }
    return parts.join("#");
}
function today() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}
export function registerWechatTouchCommands(program) {
    const wechatTouch = program
        .command("wechat-touch")
        .description("Wechat touch commands");
    wechatTouch
        .command("stats")
        .description("Get wechat touch stats for current or specified user")
        .option("--user-id <userId>", "Filter by owner user ID")
        .action(async (options) => {
        const config = await readConfig();
        if (!config.token) {
            throw new Error("No saved token. Run `primecli auth login` first.");
        }
        const params = new URLSearchParams();
        if (options.userId)
            params.set("userId", options.userId);
        const client = createApiClient(config);
        const query = params.toString();
        const data = await client.get(query ? `/api/wechat-touch/stats?${query}` : "/api/wechat-touch/stats");
        console.log(JSON.stringify(data, null, 2));
    });
    wechatTouch
        .command("daily-todo-summary")
        .description("Get today's wechat touch todo summary grouped by intent level A/B/C/D")
        .option("--user-id <userId>", "Filter by owner user ID")
        .action(async (options) => {
        const config = await readConfig();
        if (!config.token) {
            throw new Error("No saved token. Run `primecli auth login` first.");
        }
        const params = new URLSearchParams();
        if (options.userId)
            params.set("userId", options.userId);
        const client = createApiClient(config);
        const query = params.toString();
        const data = await client.get(query
            ? `/api/wechat-touch/daily-todo/summary?${query}`
            : "/api/wechat-touch/daily-todo/summary");
        console.log(JSON.stringify(data, null, 2));
    });
    wechatTouch
        .command("daily-todo")
        .description("List today's wechat touch follow-up todo details")
        .option("--user-id <userId>", "Filter by owner user ID")
        .option("--intent-level <level>", "Filter by intent level (A/B/C/D)")
        .option("--page <page>", "Page number", "1")
        .option("--size <size>", "Page size", "20")
        .action(async (options) => {
        const page = parseIntegerOption(options.page, "Page", 1, { min: 1 });
        const size = parseIntegerOption(options.size, "Size", 20, { min: 1 });
        const config = await readConfig();
        if (!config.token) {
            throw new Error("No saved token. Run `primecli auth login` first.");
        }
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("size", String(size));
        if (options.userId)
            params.set("userId", options.userId);
        if (options.intentLevel) {
            const level = options.intentLevel.trim().toUpperCase();
            if (!["A", "B", "C", "D"].includes(level)) {
                throw new Error("Intent level must be one of A, B, C, D.");
            }
            params.set("intentLevel", level);
        }
        const client = createApiClient(config);
        const data = await client.get(`/api/wechat-touch/daily-todo?${params.toString()}`);
        const mapped = {
            ...data,
            content: data.content.map((item) => ({
                groupName: buildDailyTodoGroupName(item),
                companyName: compactText(item.companyName),
                wechatNickname: compactText(item.wechatNickname),
                wechatId: compactText(item.wechatId),
                phone: compactText(item.contactValue),
                intentLevel: compactText(item.intentLevel),
                followUpNote: compactText(item.followUpNote),
                ownerName: todoOwnerName(item),
            })),
        };
        console.log(JSON.stringify(mapped, null, 2));
    });
    wechatTouch
        .command("today-stats")
        .description("Get today's wechat touch follow-up stats")
        .option("--user-id <userId>", "Filter by owner user ID")
        .action(async (options) => {
        const config = await readConfig();
        if (!config.token) {
            throw new Error("No saved token. Run `primecli auth login` first.");
        }
        const client = createApiClient(config);
        const currentRoles = extractRoles({
            role: config.role,
            roles: config.roles,
        });
        const isSuperAdmin = currentRoles.includes("SUPER_ADMIN");
        if (isSuperAdmin && !options.userId) {
            const date = today();
            const params = new URLSearchParams({
                wechatStartDate: date,
                wechatEndDate: date,
            });
            const data = await client.get(`/api/dashboard/summary?${params.toString()}`);
            console.log(JSON.stringify({
                today: data.wechatTouch.total,
                users: data.wechatTouch.users,
            }, null, 2));
            return;
        }
        const params = new URLSearchParams();
        if (options.userId)
            params.set("userId", options.userId);
        const query = params.toString();
        const data = await client.get(query ? `/api/wechat-touch/stats?${query}` : "/api/wechat-touch/stats");
        console.log(JSON.stringify(data, null, 2));
    });
    wechatTouch
        .command("friend-owners")
        .description("List sales users who own wechat touch friends")
        .option("--name <name>", "Filter by name or username substring")
        .hook("preAction", requireRole("SUPER_ADMIN", "SALES_DIRECTOR"))
        .action(async (options) => {
        const config = await readConfig();
        if (!config.token) {
            throw new Error("No saved token. Run `primecli auth login` first.");
        }
        const client = createApiClient(config);
        const data = await client.get("/api/wechat-touch/friends/owners");
        const keyword = options.name?.trim().toLowerCase();
        const users = keyword
            ? data.filter((user) => user.name?.toLowerCase().includes(keyword) ||
                user.username?.toLowerCase().includes(keyword))
            : data;
        console.log(JSON.stringify(users, null, 2));
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
        .requiredOption("-c, --count <count>", "Number of contacts to distribute", (value) => parseIntegerOption(value, "Count", 1, { min: 1, max: 150 }))
        .hook("preAction", requireRole("SUPER_ADMIN"))
        .action(async (options) => {
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
        .option("--phone <phone>", "Filter by phone number")
        .option("--wechat-id <wechatId>", "Filter by WeChat ID")
        .option("--wechat-nickname <nickname>", "Filter by WeChat nickname")
        .option("--friend-accepted", "Only accepted friend requests")
        .option("--no-friend-accepted", "Only not accepted friend requests")
        .option("--wechat-exists <0|1|2>", "Filter by WeChat search status")
        .option("--group-bound", "Filter by group chat bound status")
        .option("--no-group-bound", "Filter by group chat unbound status")
        .option("--page <page>", "Page number", "1")
        .option("--size <size>", "Page size", "50")
        .action(async (options) => {
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
        if (date)
            params.set("date", date);
        if (options.userId)
            params.set("userId", options.userId);
        if (options.phone)
            params.set("phone", options.phone);
        if (options.wechatId)
            params.set("wechatId", options.wechatId);
        if (options.wechatNickname) {
            params.set("wechatNickname", options.wechatNickname);
        }
        if (options.friendAccepted !== undefined) {
            params.set("friendAccepted", String(options.friendAccepted));
        }
        if (options.wechatExists !== undefined) {
            const exists = parseIntegerOption(options.wechatExists, "WeChat exists", 0, {
                min: 0,
                max: 2,
            });
            params.set("wechatExists", String(exists));
        }
        if (options.groupBound !== undefined) {
            params.set("groupBound", String(options.groupBound));
        }
        params.set("page", String(page));
        params.set("size", String(size));
        const client = createApiClient(config);
        const data = await client.get(`/api/wechat-touch/items?${params.toString()}`);
        console.log(JSON.stringify(data, null, 2));
    });
    wechatTouch
        .command("item <id>")
        .description("Get a wechat touch item by ID")
        .action(async (id) => {
        const config = await readConfig();
        if (!config.token) {
            throw new Error("No saved token. Run `primecli auth login` first.");
        }
        const client = createApiClient(config);
        const data = await client.get(`/api/wechat-touch/items/${id}`);
        console.log(JSON.stringify(data, null, 2));
    });
    wechatTouch
        .command("chat")
        .description("Get group chat content by roomId")
        .requiredOption("--room-id <roomId>", "Room ID of the bound group chat")
        .option("--page <page>", "Page number", "1")
        .option("--size <size>", "Page size", "20")
        .hook("preAction", requireRole("SUPER_ADMIN"))
        .action(async (options) => {
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
        const data = await client.get(`/api/wechat-touch/rooms/${options.roomId}/messages?${params.toString()}`);
        console.log(JSON.stringify(data, null, 2));
    });
}
