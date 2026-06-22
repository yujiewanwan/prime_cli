import axios, { AxiosError } from "axios";

const DEFAULT_BASE_URL = "https://primeapi.aizee.cc";
const DEFAULT_TIMEOUT_MS = 10_000;

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

export type ApiClientOptions = {
  token?: string;
  baseUrl?: string;
};

export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  const instance = axios.create({
    baseURL:
      process.env.PRIMECLI_BASE_URL ?? options.baseUrl ?? DEFAULT_BASE_URL,
    headers: options.token
      ? { Authorization: `Bearer ${options.token}` }
      : undefined,
    timeout: DEFAULT_TIMEOUT_MS,
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
  if (error.code === "ECONNABORTED") {
    return new Error("Request timed out. Check the API base URL and network.");
  }

  if (error.response?.status === 401) {
    return new Error("Authentication failed. Run `primecli auth login` again.");
  }

  if (error.response) {
    return new Error(
      `HTTP ${error.response.status}: ${error.response.statusText}`,
    );
  }

  return new Error(`Network request failed: ${error.message}`);
}
