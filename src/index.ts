#!/usr/bin/env node

import { Command } from "commander";
import { registerAuthCommands } from "./commands/auth.js";
import { registerCompanyCommands } from "./commands/company.js";
import { registerHotTopicsCommands } from "./commands/hot-topics.js";
import { registerWechatTouchCommands } from "./commands/wechat-touch.js";

const program = new Command();

program
  .name("primecli")
  .description("CLI for Agent access to PrimeContact")
  .version("1.0.0");

registerAuthCommands(program);
registerCompanyCommands(program);
registerHotTopicsCommands(program);
registerWechatTouchCommands(program);

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exitCode = 1;
});
