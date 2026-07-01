import { readFile } from "node:fs/promises";
import { createApiClient } from "../lib/api-client.js";
import { readConfig } from "../lib/config.js";
import { requireRole } from "../lib/roles.js";
import { parseIntegerOption } from "../lib/validation.js";
const ANALYSIS_STATUSES = ["PENDING", "SUCCESS", "FAILED", "SKIPPED"];
const CONVERSATION_TYPES = ["ROOM", "SINGLE"];
export function registerWecomConversationsCommands(program) {
    const wecomConversations = program
        .command("wecom-conversations")
        .description("Agent WeCom conversation analysis commands");
    wecomConversations
        .command("pending")
        .description("List pending WeCom conversations for agent analysis")
        .option("--conversation-type <type>", "Conversation type: ROOM or SINGLE", (value) => normalizeEnumOption(value, "Conversation type", CONVERSATION_TYPES))
        .option("--limit <limit>", "Maximum conversations to return", (value) => parseIntegerOption(value, "Limit", 50, { min: 1, max: 200 }))
        .hook("preAction", requireRole("SUPER_ADMIN"))
        .action(async (options) => {
        const params = new URLSearchParams();
        if (options.conversationType) {
            params.set("conversationType", options.conversationType);
        }
        if (options.limit !== undefined) {
            params.set("limit", String(options.limit));
        }
        const query = params.toString();
        const client = await createAuthorizedClient();
        const data = await client.get(query
            ? `/api/agent/wecom-conversations/pending-analysis?${query}`
            : "/api/agent/wecom-conversations/pending-analysis");
        console.log(JSON.stringify(data, null, 2));
    });
    wecomConversations
        .command("context")
        .description("Get WeCom conversation analysis context")
        .requiredOption("--conversation-id <id>", "Conversation ID", (value) => parseIntegerOption(value, "Conversation ID", 1, { min: 1 }))
        .hook("preAction", requireRole("SUPER_ADMIN"))
        .action(async (options) => {
        const client = await createAuthorizedClient();
        const data = await client.get(`/api/agent/wecom-conversations/${options.conversationId}/analysis-context`);
        console.log(JSON.stringify(data, null, 2));
    });
    wecomConversations
        .command("result")
        .description("Update WeCom conversation analysis result")
        .requiredOption("--conversation-id <id>", "Conversation ID", (value) => parseIntegerOption(value, "Conversation ID", 1, { min: 1 }))
        .requiredOption("--last-analyzed-seq <seq>", "Last analyzed message seq", (value) => parseIntegerOption(value, "Last analyzed seq", 0, { min: 0 }))
        .option("--rolling-summary <text>", "Rolling conversation summary")
        .option("--analysis-result-json <path>", "Analysis result JSON file path")
        .option("--analysis-status <status>", "Analysis status: PENDING, SUCCESS, FAILED, or SKIPPED", (value) => normalizeEnumOption(value, "Analysis status", ANALYSIS_STATUSES))
        .hook("preAction", requireRole("SUPER_ADMIN"))
        .action(async (options) => {
        const analysisResult = options.analysisResultJson
            ? await readJsonFile(options.analysisResultJson)
            : undefined;
        const body = {
            lastAnalyzedSeq: options.lastAnalyzedSeq,
            rollingSummary: options.rollingSummary,
            analysisResult,
            analysisStatus: options.analysisStatus,
        };
        const client = await createAuthorizedClient();
        const data = await client.post(`/api/agent/wecom-conversations/${options.conversationId}/analysis-result`, body);
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
async function readJsonFile(path) {
    const raw = await readFile(path, "utf8");
    try {
        return JSON.parse(raw);
    }
    catch {
        throw new Error("Analysis result JSON file must contain valid JSON.");
    }
}
function normalizeEnumOption(value, name, allowedValues) {
    const normalized = value.trim().toUpperCase();
    if (allowedValues.includes(normalized)) {
        return normalized;
    }
    throw new Error(`${name} must be one of ${allowedValues.join(", ")}.`);
}
