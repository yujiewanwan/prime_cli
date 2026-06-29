import { Command } from "commander";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { createApiClient } from "../lib/api-client.js";
import { readConfig, writeConfig } from "../lib/config.js";
import { extractRoles, getPrimaryRole } from "../lib/roles.js";

type LoginOptions = {
  username?: string;
  password?: string;
};

type LoginData = {
  token?: string;
  accessToken?: string;
  access_token?: string;
  jwt?: string;
  user?: unknown;
};

export function registerAuthCommands(program: Command): void {
  const auth = program.command("auth").description("Authentication commands");

  auth
    .command("login")
    .description("Login to PrimeContact and save the JWT token")
    .option("--username <username>", "PrimeContact username")
    .option("--password <password>", "PrimeContact password")
    .action(async (options: LoginOptions) => {
      const config = await readConfig();
      const username = options.username ?? (await promptVisible("Username: "));
      const password = options.password ?? (await promptHidden("Password: "));

      if (!username.trim()) {
        throw new Error("Username is required.");
      }
      if (!password) {
        throw new Error("Password is required.");
      }

      const client = createApiClient(config);
      const data = await client.post<LoginData>("/api/auth/login", {
        username,
        password,
      });
      const token = extractToken(data);

      if (!token) {
        throw new Error("Login succeeded but no token was found in response.");
      }

      const profileClient = createApiClient({ ...config, token });
      const profile = await profileClient.get<unknown>("/api/auth/profile");
      const roles = [
        ...new Set([...extractRoles(data), ...extractRoles(profile)]),
      ];
      const role = getPrimaryRole(roles);
      const configWithoutRoles = { ...config };
      delete configWithoutRoles.role;
      delete configWithoutRoles.roles;
      await writeConfig({
        ...configWithoutRoles,
        token,
        ...(role ? { role } : {}),
        ...(roles.length > 1 ? { roles } : {}),
      });
      console.log("Login succeeded.");
    });

  auth
    .command("profile")
    .description("Show the current PrimeContact profile")
    .action(async () => {
      const config = await readConfig();

      if (!config.token) {
        throw new Error("No saved token. Run `primecli auth login` first.");
      }

      const client = createApiClient(config);
      const profile = await client.get<unknown>("/api/auth/profile");
      console.log(JSON.stringify(profile, null, 2));
    });
}

function extractToken(data: LoginData | string): string | undefined {
  if (typeof data === "string") {
    return data;
  }

  return data.token ?? data.accessToken ?? data.access_token ?? data.jwt;
}

function promptVisible(query: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function promptHidden(query: string): Promise<string> {
  return new Promise((resolve) => {
    const output = new MutedStdout();
    const rl = createInterface({
      input: process.stdin,
      output,
      terminal: true,
    });

    process.stdout.write(query);
    output.muted = true;
    rl.question("", (answer) => {
      output.muted = false;
      process.stdout.write("\n");
      rl.close();
      resolve(answer);
    });
  });
}

class MutedStdout extends Writable {
  muted = false;

  override _write(
    chunk: Buffer,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    if (!this.muted) {
      process.stdout.write(chunk, encoding);
    }
    callback();
  }
}
