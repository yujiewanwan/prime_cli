import { createApiClient } from "../lib/api-client.js";
import { readConfig } from "../lib/config.js";
import { parseIntegerOption } from "../lib/validation.js";
export function registerCompanyCommands(program) {
    const company = program.command("company").description("Company commands");
    company
        .command("search")
        .description("Search companies by name")
        .requiredOption("-n, --name <name>", "Company name (fuzzy match)")
        .option("--page <page>", "Page number", "1")
        .option("--size <size>", "Page size", "10")
        .action(async (options) => {
        const page = parseIntegerOption(options.page, "Page", 1, { min: 1 });
        const size = parseIntegerOption(options.size, "Size", 10, { min: 1 });
        const config = await readConfig();
        if (!config.token) {
            throw new Error("No saved token. Run `primecli auth login` first.");
        }
        const params = new URLSearchParams({
            name: options.name,
            page: String(page),
            size: String(size),
        });
        const client = createApiClient(config);
        const data = await client.get(`/api/companies?${params.toString()}`);
        console.log(JSON.stringify(data, null, 2));
    });
}
