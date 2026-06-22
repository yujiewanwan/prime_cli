import axios, { AxiosError } from "axios";

const DEFAULT_BASE_URL = "https://primeapi.aizee.cc";

export type BaseResponse<T> = {
  code: number;
  message: string;
  data: T;
  timestamp: string;
};

export type ApiClient = {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
};

export function createApiClient(token?: string): ApiClient {
  const instance = axios.create({
    baseURL: process.env.PRIMECLI_BASE_URL ?? DEFAULT_BASE_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return {
    get: async <T>(path: string) => unwrap<T>(instance.get(path)),
    post: async <T>(path: string, body: unknown) =>
      unwrap<T>(instance.post(path, body)),
  };
}

async function unwrap<T>(
  request: Promise<{ data: BaseResponse<T> }>,
): Promise<T> {
  try {
    const response = await request;
    const payload = response.data;

    if (payload.code < 200 || payload.code >= 300) {
      throw new Error(payload.message || `API returned code ${payload.code}`);
    }

    return payload.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw mapAxiosError(error);
    }

    throw error;
  }
}

function mapAxiosError(error: AxiosError): Error {
  if (error.response?.status === 401) {
    return new Error("Authentication failed. Run `primecli auth login` again.");
  }

  if (error.response?.status === 403) {
    return new Error(
      "Permission denied. Your current account does not have access to this command.",
    );
  }

  if (error.response) {
    return new Error(
      `HTTP ${error.response.status}: ${error.response.statusText}`,
    );
  }

  return new Error(error.message);
}
