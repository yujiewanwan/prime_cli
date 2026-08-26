import { Command } from "commander";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { createApiClient } from "../lib/api-client.js";
import { readConfig } from "../lib/config.js";

type CreateOptions = {
  prompt: string;
  referenceImage?: string;
  dryRun?: boolean;
};

const IMAGE_GENERATION_TIMEOUT_MS = 180_000;

export function registerImageGenerationsCommands(program: Command): void {
  const imageGenerations = program
    .command("image-generations")
    .description("Image generation commands");

  imageGenerations
    .command("create")
    .description("Generate an image from a prompt")
    .requiredOption("--prompt <prompt>", "Image generation prompt")
    .option("--reference-image <path>", "Reference image file path")
    .option("--dry-run", "Print request without calling the API")
    .action(async (options: CreateOptions) => {
      const body = {
        prompt: requireNonBlank(options.prompt, "Prompt"),
      };
      const path = options.referenceImage
        ? "/api/image-generations/edits"
        : "/api/image-generations";

      if (options.dryRun) {
        printDryRun("POST", path, {
          ...body,
          ...(options.referenceImage
            ? { referenceImage: options.referenceImage }
            : {}),
        });
        return;
      }

      const form = options.referenceImage
        ? await editForm(body.prompt, options.referenceImage)
        : undefined;

      const config = await readConfig();
      if (!config.token) {
        throw new Error("No saved token. Run `primecli auth login` first.");
      }

      const client = createApiClient({
        ...config,
        timeoutMs: IMAGE_GENERATION_TIMEOUT_MS,
      });
      const data = form
        ? await client.postForm(path, form)
        : await client.post(path, body);
      console.log(JSON.stringify(data, null, 2));
    });
}

async function editForm(prompt: string, referenceImagePath: string): Promise<FormData> {
  let content: Buffer;
  try {
    content = await readFile(referenceImagePath);
  } catch {
    throw new Error(`Reference image file does not exist: ${referenceImagePath}`);
  }
  if (content.length === 0) {
    throw new Error("Reference image file must not be empty.");
  }

  const form = new FormData();
  form.append("prompt", prompt);
  form.append(
    "referenceImage",
    new Blob([new Uint8Array(content)], { type: "application/octet-stream" }),
    basename(referenceImagePath),
  );
  return form;
}

function requireNonBlank(value: string, name: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${name} must not be blank.`);
  }

  return trimmed;
}

function printDryRun(method: string, path: string, body: unknown): void {
  console.log(
    JSON.stringify(
      {
        dryRun: true,
        method,
        path,
        body,
      },
      null,
      2,
    ),
  );
}
