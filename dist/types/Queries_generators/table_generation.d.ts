import { TableOptsI } from "../Interfaces/TableI";
/**
 * Generates a table definition query string for SurrealDB.
 *
 * @param {string} table - The name of the table to define.
 * @param {string} base - The base type of the table, either "SCHEMAFULL" or "SCHEMALESS".
 * @param {TableOptsI} [options] - Optional configuration for the table definition. See TableOptsI for all available options:
 *   - creationMode: "OVERWRITE" | "IFNOTEXISTS" (table creation flags)
 *   - type: "ANY" | "NORMAL" | "RELATION" (table type)
 *   - relation: { from: string, to: string } (for relation tables)
 *   - asExpr: string (AS expression for computed tables)
 *   - changefeed: { duration: bigint, unit: DurationScope } (changefeed configuration)
 *   - permissions: { none, full, selectExpr, createExpr, updateExpr, deleteExpr } (table-level permissions)
 *   - timestamps: boolean | { createdAt?: boolean; updatedAt?: boolean; deletedAt?: boolean } (auto timestamp fields)
 *
 * @returns {string} - The generated `DEFINE TABLE` query string.
 *
 * @example
 * // SCHEMAFULL table with all timestamps and full permissions
 * const query = generateTableQuery("users", "SCHEMAFULL", {
 *   creationMode: "IFNOTEXISTS",
 *   type: "NORMAL",
 *   permissions: { full: true },
 *   timestamps: true,
 * });
 *
 * @example
 * // SCHEMALESS relation table with custom relation and changefeed
 * const query = generateTableQuery("user_account", "SCHEMALESS", {
 *   type: "RELATION",
 *   relation: { from: "user", to: "account" },
 *   changefeed: { duration: 24n, unit: "h" },
 * });
 *
 * @example
 * // Table with only createdAt and updatedAt timestamps
 * const query = generateTableQuery("users", "SCHEMAFULL", {
 *   timestamps: { createdAt: true, updatedAt: true },
 * });
 *
 * @example
 * // Table with custom permissions
 * const query = generateTableQuery("users", "SCHEMAFULL", {
 *   permissions: { selectExpr: "WHERE user = $auth.id" },
 * });
 *
 * @note
 *   - The `timestamps` option controls which timestamp fields are auto-created. If true, all are included; if an object, only specified fields are included.
 *   - See TableOptsI for all available options and their types.
 *   - SurrealDB best practice: use SCHEMAFULL for strict data, SCHEMALESS for flexibility or relations.
 */
export declare const generateTableQuery: (table: string, base: string, options?: TableOptsI) => string;
/**
 * Generates additional fields for a table, such as timestamp fields (`createdAt`, `updatedAt`, `deletedAt`).
 *
 * @param {string} table - The name of the table to which the fields will be added.
 * @param {boolean | { createdAt?: boolean; updatedAt?: boolean; deletedAt?: boolean }} [timestamps] - Configuration for timestamp fields.
 *   - If `true`, all timestamp fields are included.
 *   - If an object, only the specified fields are included.
 *   - If `undefined` or `false`, no timestamp fields are included.
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
 *
 * @note
 *   - The `timestamps` option controls which timestamp fields are auto-created. If true, all are included; if an object, only specified fields are included.
 *   - This function is used by defineTable to add timestamp fields automatically.
 */
export declare const additionalFields: (table: string, timestamps?: boolean | {
    createdAt?: boolean;
    updatedAt?: boolean;
    deletedAt?: boolean;
}) => string[];
