import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export type PrimeCliConfig = {
  token?: string;
};

export const CONFIG_PATH = join(
  homedir(),
  ".config",
  "primecli",
  "config.json",
);

export async function readConfig(): Promise<PrimeCliConfig> {
  try {
    const content = await readFile(CONFIG_PATH, "utf8");
    return JSON.parse(content) as PrimeCliConfig;
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return {};
    }

    throw error;
  }
}

export async function writeConfig(config: PrimeCliConfig): Promise<void> {
  await mkdir(dirname(CONFIG_PATH), { recursive: true });
  await writeFile(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, {
    mode: 0o600,
  });
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
