import { casting } from "../Utils/casting";
/**
 * Generates a SurrealDB DEFINE FIELD query string for a table field.
 *
 * @param {string} table - The name of the table to define the field on.
 * @param {string} name - The name of the field to define.
 * @param {DataType | DataType[]} type - The SurrealDB data type(s) for the field. Use 'object' for flexible types, or an array for array types.
 * @param {FieldOptsI} [options] - Optional configuration for the field definition. See FieldOptsI for all available options:
 *   - optional: boolean (if true, field is not required/nullable)
 *   - default: { expression: any, always?: boolean } (default value expression)
 *   - value: { expression: any, future?: boolean } (value expression)
 *   - arrayValues: { type?: "VALUE" | "DATATYPE", value?: string | string[] | DataType | DataType[], size?: number } (array type/value config)
 *   - recordTable: string (REQUIRED for record type, specifies the table name)
 *   - assertExpr: string (assertion expression for validation)
 *   - readonly: boolean (if true, field is read-only)
 *   - creationMode: "OVERWRITE" | "IFNOTEXISTS" (field creation flags)
 *   - permissions: { none, full, selectExpr, createExpr, updateExpr, deleteExpr } (field-level permissions)
 *
 * @returns {string} - The generated DEFINE FIELD query string.
 *
 * @example
 * // Required integer field
 * const query = generateFieldQuery("users", "age", "int");
 *
 * @example
 * // Optional string field, only if it does not exist
 * const query = generateFieldQuery("users", "nickname", "string", { optional: true, creationMode: "IFNOTEXISTS" });
 *
 * @example
 * // Boolean field with a default value
 * const query = generateFieldQuery("users", "isActive", "bool", { default: { expression: true } });
 *
 * @example
 * // Array of strings
 * const query = generateFieldQuery("users", "tags", "array", { arrayValues: { type: "DATATYPE", value: "string" } });
 *
 * @example
 * // Field with assertion and read-only
 * const query = generateFieldQuery("users", "score", "int", { assertExpr: "$value > 0", readonly: true });
 *
 * @example
 * // Record field pointing to specific table
 * const query = generateFieldQuery("users", "profile", "record", { recordTable: "profile" });
 *
 * @example
 * // Array of records with size limit
 * const query = generateFieldQuery("users", "posts", "array", {
 *   arrayValues: { type: "DATATYPE", value: "record", size: 10 },
 *   recordTable: "post"
 * });
 *
 * @note
 *   - Use 'object' type for flexible fields, or array types for lists.
 *   - Record types MUST specify a table using the recordTable option.
 *   - Array size is specified with square brackets: array<string>[5].
 *   - See FieldOptsI for all available options and their types.
 *   - SurrealDB best practice: use optional and readonly for stricter data modeling.
 */
export const generateFieldQuery = (table, name, type, options) => {
    let query = `DEFINE FIELD`;
    // Handle creation mode
    if (options?.creationMode) {
        query +=
            options.creationMode === "OVERWRITE"
                ? ` OVERWRITE`
                : options.creationMode === "IFNOTEXISTS"
                    ? ` IF NOT EXISTS`
                    : "";
    }
    query += ` ${name} ON TABLE ${table}`;
    // Handle flexible type for object
    if (type === "object") {
        query += ` FLEXIBLE TYPE`;
    }
    else {
        query += ` TYPE`;
        // Handle optional wrapper
        if (options?.optional) {
            query += ` option<`;
        }
        // Handle type definition
        if (typeof type === "string") {
            if (type === "array") {
                // Handle array type with arrayValues configuration
                if (options?.arrayValues) {
                    const arrayConfig = options.arrayValues;
                    if (arrayConfig.type === "DATATYPE" && arrayConfig.value) {
                        if (Array.isArray(arrayConfig.value)) {
                            query += ` array<${arrayConfig.value.join("|")}>`;
                        }
                        else {
                            // Handle record type within arrays
                            if (arrayConfig.value === "record") {
                                if (options?.recordTable) {
                                    query += ` array<record<${options.recordTable}>>`;
                                }
                                else {
                                    throw new Error(`Array field '${name}' with record type must specify a table using the recordTable option. Example: { recordTable: "table_name" }`);
                                }
                            }
                            else {
                                query += ` array<${arrayConfig.value}>`;
                            }
                        }
                    }
                    else if (arrayConfig.type === "VALUE" && arrayConfig.value) {
                        if (Array.isArray(arrayConfig.value)) {
                            query += ` array<${arrayConfig.value.map(v => casting(v)).join("|")}>`;
                        }
                        else {
                            query += ` array<${casting(arrayConfig.value)}>`;
                        }
                    }
                    else {
                        query += ` array<any>`;
                    }
                    // Handle array size if specified
                    if (arrayConfig.size !== undefined) {
                        query += `[${arrayConfig.size}]`;
                    }
                }
                else {
                    query += ` array<any>`;
                }
            }
            else if (type === "record") {
                // Handle record type - requires table specification
                if (options?.recordTable) {
                    query += ` record<${options.recordTable}>`;
                }
                else {
                    throw new Error(`Record field '${name}' must specify a table using the recordTable option. Example: { recordTable: "table_name" }`);
                }
            }
            else {
                query += ` ${type}`;
            }
        }
        else if (Array.isArray(type)) {
            // Handle union types
            query += type.join("|");
        }
        // Close optional wrapper
        if (options?.optional) {
            query += `>`;
        }
    }
    // Handle default value
    if (options?.default) {
        query += ` DEFAULT ${casting(options.default.expression)}`;
        if (options.default.always) {
            query += ` ALWAYS`;
        }
    }
    // Handle value expression
    if (options?.value) {
        query += ` VALUE ${casting(options.value.expression)}`;
        if (options.value.future) {
            query += ` FUTURE`;
        }
    }
    // Handle assertion
    if (options?.assertExpr) {
        query += ` ASSERT ${options.assertExpr}`;
    }
    // Handle readonly
    if (options?.readonly) {
        query += ` READONLY`;
    }
    // Handle permissions
    if (options?.permissions) {
        const perms = options.permissions;
        if (perms.none) {
            query += ` PERMISSIONS NONE`;
        }
        else if (perms.full) {
            query += ` PERMISSIONS FULL`;
        }
        else {
            const permissionParts = [];
            if (perms.selectExpr)
                permissionParts.push(`FOR SELECT ${perms.selectExpr}`);
            if (perms.createExpr)
                permissionParts.push(`FOR CREATE ${perms.createExpr}`);
            if (perms.updateExpr)
                permissionParts.push(`FOR UPDATE ${perms.updateExpr}`);
            if (perms.deleteExpr)
                permissionParts.push(`FOR DELETE ${perms.deleteExpr}`);
            if (permissionParts.length > 0) {
                query += ` PERMISSIONS ${permissionParts.join(" ")}`;
            }
        }
    }
    query += `;`;
    return query;
};
