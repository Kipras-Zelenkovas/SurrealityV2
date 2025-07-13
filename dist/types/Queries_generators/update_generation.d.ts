import { UpdateOptionsI } from "../Interfaces/UpdateOptionsI";
/**
 * Generates a SurrealDB UPDATE query string for updating records.
 *
 * @template T - The table schema interface. Enables type-safe autocomplete for all fields in the current table, while remaining flexible for advanced use cases.
 * @param {string} table - The table name to update.
 * @param {UpdateOptionsI<T>} options - Options for the update operation (type-safe and flexible).
 * @returns {string} - The generated SurrealDB UPDATE query string.
 */
export declare function generateUpdateQuery<T extends object>(table: string, options: UpdateOptionsI<T>): string;
