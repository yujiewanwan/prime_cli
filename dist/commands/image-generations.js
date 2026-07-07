import { createApiClient } from "../lib/api-client.js";
import { readConfig } from "../lib/config.js";
export function registerImageGenerationsCommands(program) {
    const imageGenerations = program
        .command("image-generations")
        .description("Image generation commands");
    imageGenerations
        .command("create")
        .description("Generate an image from a prompt")
        .requiredOption("--prompt <prompt>", "Image generation prompt")
        .option("--dry-run", "Print request without calling the API")
        .action(async (options) => {
        const body = {
            prompt: requireNonBlank(options.prompt, "Prompt"),
        };
        const path = "/api/image-generations";
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
