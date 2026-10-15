import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { URL } from "node:url";
import { mock, test } from "node:test";
import axios from "axios";
import { Command } from "commander";

test("existing user filters opt into the backend employee scope", async () => {
  const homeDir = await mkdtemp(join(tmpdir(), "primecli-scope-"));
  const previousHome = process.env.HOME;
  process.env.HOME = homeDir;
  let stub;
  let output;
  try {
    const { writeConfig } = await import("../dist/lib/config.js");
    const { registerWechatTouchCommands } =
      await import("../dist/commands/wechat-touch.js");
    await writeConfig({ token: "test-token", role: "SUPER_ADMIN" });
    const paths = [];
    stub = mock.method(axios, "create", () => ({
      get: async (path) => {
        paths.push(path);
        return {
          data: { code: 200, data: { wechatTouch: { total: {}, users: [] } } },
        };
      },
    }));
    output = mock.method(console, "log", () => {});

    const run = async (args) => {
      const program = new Command();
      registerWechatTouchCommands(program);
      await program.parseAsync(["wechat-touch", ...args], { from: "user" });
      return new URL(paths.pop(), "https://example.test");
    };

    for (const command of ["stats", "today-stats", "items"]) {
      const selected = await run([command, "--user-id", "42"]);
      assert.equal(selected.searchParams.get("userId"), "42");
      assert.equal(selected.searchParams.get("includeAllEmployees"), "true");
      assert.equal(
        selected.pathname,
        command === "items"
          ? "/api/wechat-touch/items"
          : "/api/wechat-touch/stats",
      );
    }
    for (const command of ["stats", "items"]) {
      const own = await run([command]);
      assert.equal(own.searchParams.has("userId"), false);
      assert.equal(own.searchParams.has("includeAllEmployees"), false);
    }
    assert.equal(
      (await run(["today-stats"])).pathname,
      "/api/dashboard/summary",
    );
    await writeConfig({ token: "test-token", role: "SALES" });
    assert.equal(
      (await run(["today-stats"])).pathname,
      "/api/wechat-touch/stats",
    );
  } finally {
    stub?.mock.restore();
    output?.mock.restore();
    if (previousHome === undefined) delete process.env.HOME;
    else process.env.HOME = previousHome;
    await rm(homeDir, { recursive: true, force: true });
  }
});
