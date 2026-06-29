import { Command } from "commander";
import { spawn } from "node:child_process";

type InstallOptions = {
  dryRun?: boolean;
};

type InstallStep = {
  command: string;
  args: string[];
};

const INSTALL_STEPS: InstallStep[] = [
  {
    command: "npm",
    args: ["install", "-g", "yujiewanwan/prime_cli"],
  },
  {
    command: "npx",
    args: ["skills", "add", "yujiewanwan/prime_cli", "-y", "-g"],
  },
];

export function registerInstallCommand(program: Command): void {
  program
    .command("install")
    .description("Install primecli globally and register bundled agent skills")
    .option("--dry-run", "Print install commands without running them")
    .action(async (options: InstallOptions) => {
      if (options.dryRun) {
        for (const step of INSTALL_STEPS) {
          console.log(formatCommand(step));
        }
        return;
      }

      for (const step of INSTALL_STEPS) {
        console.log(`Running: ${formatCommand(step)}`);
        await runStep(step);
      }

      console.log("primecli install completed.");
    });
}

function runStep(step: InstallStep): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(resolveExecutable(step.command), step.args, {
      stdio: "inherit",
    });

    child.on("error", (error) => {
      reject(buildStepError(step, error.message));
    });

    child.on("close", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      const detail =
        signal !== null
          ? `terminated by signal ${signal}`
          : `exited with code ${code}`;
      reject(buildStepError(step, detail));
    });
  });
}

function resolveExecutable(command: string): string {
  if (process.platform !== "win32") {
    return command;
  }

  return `${command}.cmd`;
}

function buildStepError(step: InstallStep, detail: string): Error {
  return new Error(
    [
      `Install step failed: ${formatCommand(step)} (${detail}).`,
      "If global npm install failed, check npm global directory permissions.",
      "Fallback:",
      "  npm install -g yujiewanwan/prime_cli",
      "  npx skills add yujiewanwan/prime_cli -y -g",
    ].join("\n"),
  );
}

function formatCommand(step: InstallStep): string {
  return [step.command, ...step.args].join(" ");
}
