import { readFile } from "node:fs/promises";
import { createApiClient } from "../lib/api-client.js";
import { readConfig } from "../lib/config.js";
export function registerHotTopicsCommands(program) {
    const hotTopics = program
        .command("hot-topics")
        .description("Hot topic commands");
    hotTopics
        .command("create")
        .description("Create hot topics from a JSON payload")
        .requiredOption("--json <path>", "JSON payload file path")
        .option("--dry-run", "Print request without calling the API")
        .action(async (options) => {
        const body = await readJsonFile(options.json);
        const path = "/api/hot-topics";
        if (options.dryRun) {
            printDryRun("POST", path, body);
            return;
        }
        const config = await readConfig();
        if (!config.token) {
            throw new Error("No saved token. Run `primecli auth login` first.");
        }
        const client = createApiClient(config);
        const data = await client.post(path, body);
        console.log(JSON.stringify(data, null, 2));
    });
}
async function readJsonFile(path) {
    const raw = await readFile(path, "utf8");
    try {
        return JSON.parse(raw);
    }
    catch {
        throw new Error("JSON payload file must contain valid JSON.");
    }
}
function printDryRun(method, path, body) {
    console.log(JSON.stringify({
        dryRun: true,
        method,
        path,
        body,
    }, null, 2));
}
