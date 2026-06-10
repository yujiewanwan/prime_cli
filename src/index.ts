#!/usr/bin/env node

import { Command } from "commander";
import { registerAuthCommands } from "./commands/auth.js";

const program = new Command();

program
  .name("primecli")
  .description("CLI for Agent access to PrimeContact")
  .version("1.0.0");

registerAuthCommands(program);

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exitCode = 1;
});
