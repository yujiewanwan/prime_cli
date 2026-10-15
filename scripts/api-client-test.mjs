import assert from "node:assert/strict";
import { mock, test } from "node:test";
import axios, { AxiosError } from "axios";
import { createApiClient } from "../dist/lib/api-client.js";

test("HTTP failures preserve business messages without dumping response bodies", async () => {
  const cases = [
    [
      410,
      { message: "自动分发已停用，请在人员管理中选择人员后分发" },
      "Gone",
      "HTTP 410: 自动分发已停用，请在人员管理中选择人员后分发",
    ],
    [
      400,
      { message: "  排除原因不能为空  ", data: "private" },
      "Bad Request",
      "HTTP 400: 排除原因不能为空",
    ],
    [
      502,
      "<html>upstream error</html>",
      "Bad Gateway",
      "HTTP 502: Bad Gateway",
    ],
    [
      500,
      { message: { detail: "private" } },
      "Internal Server Error",
      "HTTP 500: Internal Server Error",
    ],
    [
      500,
      { message: "   " },
      "Internal Server Error",
      "HTTP 500: Internal Server Error",
    ],
    [
      401,
      { message: "private" },
      "Unauthorized",
      "Authentication failed. Run `primecli auth login` again.",
    ],
    [
      403,
      { message: "private" },
      "Forbidden",
      "Permission denied. Your current account does not have access to this command.",
    ],
  ];

  for (const [status, data, statusText, message] of cases) {
    const failure = new AxiosError(
      "Request failed",
      undefined,
      undefined,
      undefined,
      {
        status,
        data,
        statusText,
        headers: {},
        config: {},
      },
    );
    const stub = mock.method(axios, "create", () => ({
      get: async () => {
        throw failure;
      },
    }));
    try {
      await assert.rejects(createApiClient().get("/api/test"), { message });
    } finally {
      stub.mock.restore();
    }
  }
});
