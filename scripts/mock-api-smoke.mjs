import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";

const home = mkdtempSync(join(tmpdir(), "primecli-home-"));
let authHeader = "";

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.method === "POST" && req.url === "/api/auth/login") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      const parsed = JSON.parse(body);
      const ok = parsed.username === "agent" && parsed.password === "secret";
      res.end(
        JSON.stringify({
          code: ok ? 200 : 400,
          message: ok ? "ok" : "bad credentials",
          data: ok ? { token: "mock-token" } : null,
          timestamp: new Date().toISOString(),
        }),
      );
    });
    return;
  }

  if (req.method === "GET" && req.url === "/api/auth/profile") {
    authHeader = req.headers.authorization ?? "";
    res.end(
      JSON.stringify({
        code: 200,
        message: "ok",
        data: { username: "agent" },
        timestamp: new Date().toISOString(),
      }),
    );
    return;
  }

  res.statusCode = 404;
  res.end(
    JSON.stringify({
      code: 404,
      message: "not found",
      data: null,
      timestamp: new Date().toISOString(),
    }),
  );
});

server.listen(0, "127.0.0.1", async () => {
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Mock server did not bind to a TCP port.");
  }

  const env = {
    ...process.env,
    HOME: home,
    PRIMECLI_BASE_URL: `http://127.0.0.1:${address.port}`,
  };

  const login = await run(
    process.execPath,
    [
      "dist/index.js",
      "auth",
      "login",
      "--username",
      "agent",
      "--password",
      "secret",
    ],
    { cwd: process.cwd(), env },
  );

  const profile = await run(
    process.execPath,
    ["dist/index.js", "auth", "profile"],
    {
      cwd: process.cwd(),
      env,
    },
  );

  const config = JSON.parse(
    readFileSync(join(home, ".config", "primecli", "config.json"), "utf8"),
  );

  console.log(
    JSON.stringify(
      {
        loginStatus: login.status,
        loginStdout: login.stdout.trim(),
        loginStderr: login.stderr.trim(),
        savedToken: config.token,
        profileStatus: profile.status,
        profileStdout: profile.stdout.trim(),
        profileStderr: profile.stderr.trim(),
        authHeader,
      },
      null,
      2,
    ),
  );

  server.close(() => {
    rmSync(home, { recursive: true, force: true });
  });
});

function run(command, args, options) {
  return new Promise((resolve) => {
    const child = spawn(command, args, options);
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("close", (status) => {
      resolve({ status, stdout, stderr });
    });
  });
}
