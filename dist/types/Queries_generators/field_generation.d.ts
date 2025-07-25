import { FieldOptsI } from "../Interfaces/TableI.js";
import { DataType } from "../Utils/DataTypes.js";
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
export declare const generateFieldQuery: (table: string, name: string, type: DataType | DataType[], options?: FieldOptsI) => string;
