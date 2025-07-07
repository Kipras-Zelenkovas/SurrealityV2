import { TableOptsI } from "../Interfaces/TableI";

/**
 * Generates a permissions query string based on the provided permissions configuration.
 * This is used to define permissions for a table in SurrealDB.
 *
 * @param {TableOptsI["permissions"]} permissions - The permissions configuration object.
 * @returns {string} - The generated permissions query string.
 *
 * @example
 * const permissions = {
 *   none: true, // No permissions
 *   full: false, // Full permissions
 *   selectExpr: "WHERE user = $auth.id", // Custom select expression
 * };
 * const query = generatePermissionsQuery(permissions);
 * // Returns: " PERMISSIONS NONE"
 */
const generatePermissionsQuery = (
    permissions: TableOptsI["permissions"]
): string => {
    if (!permissions) return "";

    let query = " PERMISSIONS ";
    if (permissions.none) {
        query += "NONE";
    } else if (permissions.full) {
        query += "FULL";
    } else {
        if (permissions.selectExpr)
            query += ` FOR select ${permissions.selectExpr}`;
        if (permissions.createExpr)
            query += ` FOR create ${permissions.createExpr}`;
        if (permissions.updateExpr)
            query += ` FOR update ${permissions.updateExpr}`;
        if (permissions.deleteExpr)
            query += ` FOR delete ${permissions.deleteExpr}`;
    }
    return query;
};

/**
 * Generates a table definition query string for SurrealDB.
 * This function constructs a `DEFINE TABLE` query based on the provided table name, base type, and options.
 *
 * @param {string} table - The name of the table to define.
 * @param {string} base - The base type of the table, either "SCHEMAFULL" or "SCHEMALESS".
 * @param {TableOptsI} [options] - Optional configuration for the table definition.
 * @returns {string} - The generated `DEFINE TABLE` query string.
 *
 * @example
 * const query = generateTableQuery("users", "SCHEMAFULL", {
 *   creationMode: "IFNOTEXISTS",
 *   type: "NORMAL",
 *   relation: { from: "user", to: "account" },
 *   permissions: { full: true },
 * });
 * // Returns: "DEFINE TABLE IF NOT EXISTS users SCHEMAFULL TYPE NORMAL FROM user TO account PERMISSIONS FULL"
 */
export const generateTableQuery = (
    table: string,
    base: string,
    options?: TableOptsI
): string => {
    let query = `DEFINE TABLE `;
    if (options?.creationMode) {
        query +=
            options.creationMode == "OVERWRITE"
                ? `OVERWRITE `
                : options.creationMode == "IFNOTEXISTS"
                ? `IF NOT EXISTS `
                : "";
    }
    query += `${table} ${base}`;
    if (options?.type) query += ` TYPE ${options.type}`;
    if (options?.relation)
        query += ` FROM ${options.relation.from} TO ${options.relation.to}`;
    if (options?.asExpr) query += ` AS ${options.asExpr}`;
    if (options?.changefeed)
        query += ` CHANGEFEED ${options.changefeed.duration}${options.changefeed.unit}`;
    if (options?.permissions)
        query += generatePermissionsQuery(options.permissions);
    return query.trim();
};

/**
 * Generates additional fields for a table, such as timestamp fields (`createdAt`, `updatedAt`, `deletedAt`).
 * This function allows for flexible configuration of which timestamp fields to include.
 *
 * @param {string} table - The name of the table to which the fields will be added.
 * @param {boolean | { createdAt?: boolean; updatedAt?: boolean; deletedAt?: boolean }} [timestamps] - Configuration for timestamp fields.
 * - If `true`, all timestamp fields are included.
 * - If an object, only the specified fields are included.
 * - If `undefined` or `false`, no timestamp fields are included.
 * @returns {string[]} - An array of `DEFINE FIELD` query strings for the specified timestamp fields.
 *
 * @example
 * // Include all timestamp fields
 * const fields = additionalFields("users", true);
 * // Returns: [
 * //   "DEFINE FIELD timestamps.createdAt ON TABLE users TYPE datetime VALUE time::now() READONLY;",
 * //   "DEFINE FIELD timestamps.updatedAt ON TABLE users TYPE datetime VALUE time::now();",
 * //   "DEFINE FIELD timestamps.deletedAt ON TABLE users TYPE option<datetime>;",
 * // ]
 *
 * @example
 * // Include only `createdAt` and `updatedAt`
 * const fields = additionalFields("users", { createdAt: true, updatedAt: true });
 * // Returns: [
 * //   "DEFINE FIELD timestamps.createdAt ON TABLE users TYPE datetime VALUE time::now() READONLY;",
 * //   "DEFINE FIELD timestamps.updatedAt ON TABLE users TYPE datetime VALUE time::now();",
 * // ]
 */
export const additionalFields = (
    table: string,
    timestamps?:
        | boolean
        | { createdAt?: boolean; updatedAt?: boolean; deletedAt?: boolean }
): string[] => {
    if (timestamps === undefined || timestamps === true) {
        return [
            `DEFINE FIELD timestamps.createdAt ON TABLE ${table} TYPE datetime VALUE time::now() READONLY;`,
            `DEFINE FIELD timestamps.updatedAt ON TABLE ${table} TYPE datetime VALUE time::now();`,
            `DEFINE FIELD timestamps.deletedAt ON TABLE ${table} TYPE option<datetime>;`,
        ];
    } else if (typeof timestamps == "object") {
        let tempFields: string[] = [];

        if (timestamps.createdAt === true) {
            tempFields.push(
                `DEFINE FIELD timestamps.createdAt ON TABLE ${table} TYPE datetime VALUE time::now() READONLY;`
            );
        }

        if (timestamps.updatedAt === true) {
            tempFields.push(
                `DEFINE FIELD timestamps.updatedAt ON TABLE ${table} TYPE datetime VALUE time::now();`
            );
        }

        if (timestamps.updatedAt === true) {
            tempFields.push(
                `DEFINE FIELD timestamps.deletedAt ON TABLE ${table} TYPE option<datetime>;`
            );
        }

        return tempFields;
    } else {
        return [];
    }
};
