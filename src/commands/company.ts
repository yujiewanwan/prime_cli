import { Command } from "commander";
import { createApiClient } from "../lib/api-client.js";
import { readConfig } from "../lib/config.js";

type CompanySearchOptions = {
  name: string;
  page?: string;
  size?: string;
};

export function registerCompanyCommands(program: Command): void {
  const company = program.command("company").description("Company commands");

  company
    .command("search")
    .description("Search companies by name")
    .requiredOption("-n, --name <name>", "Company name (fuzzy match)")
    .option("--page <page>", "Page number", "1")
    .option("--size <size>", "Page size", "10")
    .action(async (options: CompanySearchOptions) => {
      const config = await readConfig();

      if (!config.token) {
        throw new Error("No saved token. Run `primecli auth login` first.");
      }

      const params = new URLSearchParams({
        name: options.name,
        page: options.page ?? "1",
        size: options.size ?? "10",
      });

      const client = createApiClient(config.token);
      const data = await client.get(`/api/companies?${params.toString()}`);
      console.log(JSON.stringify(data, null, 2));
    });
}
