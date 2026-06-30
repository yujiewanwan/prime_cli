import { readConfig } from "./config.js";
export function requireRole(...requiredRoles) {
    return async (_thisCommand, actionCommand) => {
        const config = await readConfig();
        if (!config.token) {
            throw new Error("No saved token. Run `primecli auth login` first.");
        }
        const currentRoles = getConfigRoles(config.role, config.roles);
        const hasRequiredRole = currentRoles.some((role) => requiredRoles.includes(role));
        if (!hasRequiredRole) {
            const currentRole = currentRoles.length > 0 ? currentRoles.join(", ") : "unknown";
            throw new Error(`Command '${actionCommand.name()}' requires role: ${requiredRoles.join(", ")}. Your current role is '${currentRole}'.`);
        }
    };
}
export function extractRoles(profile) {
    if (!isRecord(profile)) {
        return [];
    }
    return normalizeRoles(profile.role ??
        profile.roles ??
        profile.authorities ??
        profile.authority ??
        getNestedRoles(profile.user));
}
export function getPrimaryRole(roles) {
    if (roles.includes("SUPER_ADMIN")) {
        return "SUPER_ADMIN";
    }
    return roles[0];
}
function getConfigRoles(role, roles) {
    return normalizeRoles(roles ?? role);
}
function normalizeRoles(value) {
    if (typeof value === "string") {
        const role = normalizeRole(value);
        return role ? [role] : [];
    }
    if (!Array.isArray(value)) {
        return [];
    }
    const roles = value
        .map((item) => {
        if (typeof item === "string") {
            return normalizeRole(item);
        }
        const role = item.role ?? item.name ?? item.authority;
        return typeof role === "string" ? normalizeRole(role) : undefined;
    })
        .filter((item) => typeof item === "string" && item.length > 0);
    return [...new Set(roles)];
}
function normalizeRole(role) {
    const normalized = role.trim().replace(/^ROLE_/, "");
    return normalized || undefined;
}
function getNestedRoles(value) {
    if (!isRecord(value)) {
        return undefined;
    }
    return value.role ?? value.roles ?? value.authorities ?? value.authority;
}
function isRecord(value) {
    return typeof value === "object" && value !== null;
}
