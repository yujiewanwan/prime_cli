#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync } from "node:fs";
import { registerAuthCommands } from "./commands/auth.js";
import { registerCompanyCommands } from "./commands/company.js";
import { registerHermesCommands } from "./commands/hermes.js";
import { registerHotTopicsCommands } from "./commands/hot-topics.js";
import { registerInstallCommand } from "./commands/install.js";
import { registerWecomConversationsCommands } from "./commands/wecom-conversations.js";
import { registerWechatOfficialCommands } from "./commands/wechat-official.js";
import { registerWechatTouchCommands } from "./commands/wechat-touch.js";

type PackageJson = {
  version: string;
};

const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as PackageJson;

const program = new Command();

program
  .name("primecli")
  .description("CLI for Agent access to PrimeContact")
  .version(packageJson.version);

registerAuthCommands(program);
registerCompanyCommands(program);
registerHermesCommands(program);
registerHotTopicsCommands(program);
registerInstallCommand(program);
registerWecomConversationsCommands(program);
registerWechatOfficialCommands(program);
registerWechatTouchCommands(program);

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exitCode = 1;
});
