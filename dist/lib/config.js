import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
export const CONFIG_PATH = join(homedir(), ".config", "primecli", "config.json");
export async function readConfig() {
    try {
        const content = await readFile(CONFIG_PATH, "utf8");
        return JSON.parse(content);
    }
    catch (error) {
        if (isNodeError(error) && error.code === "ENOENT") {
            return {};
        }
        throw error;
    }
}
export async function writeConfig(config) {
    await mkdir(dirname(CONFIG_PATH), { recursive: true });
    await writeFile(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, {
        mode: 0o600,
    });
}
function isNodeError(error) {
    return error instanceof Error && "code" in error;
}
