import axios from "axios";
const DEFAULT_BASE_URL = "https://primeapi.aizee.cc";
const DEFAULT_TIMEOUT_MS = 10_000;
export function createApiClient(options = {}) {
    const instance = axios.create({
        baseURL: process.env.PRIMECLI_BASE_URL ?? options.baseUrl ?? DEFAULT_BASE_URL,
        headers: options.token
            ? { Authorization: `Bearer ${options.token}` }
            : undefined,
        timeout: DEFAULT_TIMEOUT_MS,
    });
    return {
        get: async (path) => unwrap(instance.get(path)),
        post: async (path, body) => unwrap(instance.post(path, body)),
        put: async (path, body) => unwrap(instance.put(path, body)),
    };
}
async function unwrap(request) {
    try {
        const response = await request;
        const payload = response.data;
        if (payload.code < 200 || payload.code >= 300) {
            throw new Error(payload.message || `API returned code ${payload.code}`);
        }
        return payload.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw mapAxiosError(error);
        }
        throw error;
    }
}
function mapAxiosError(error) {
    if (error.code === "ECONNABORTED") {
        return new Error("Request timed out. Check the API base URL and network.");
    }
    if (error.response?.status === 401) {
        return new Error("Authentication failed. Run `primecli auth login` again.");
    }
    if (error.response?.status === 403) {
        return new Error("Permission denied. Your current account does not have access to this command.");
    }
    if (error.response) {
        return new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
    }
    return new Error(`Network request failed: ${error.message}`);
}
