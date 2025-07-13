import { SelectOneOptionsI } from '../Interfaces/SelectOneOptionsI.js';
/**
 * Generates a SurrealDB SELECT query string for findOne/select single record operations.
 *
 * @template T - The table schema interface. Enables type-safe autocomplete for all fields in the current table, while remaining flexible for advanced use cases.
 * @param {string} table - The table name to select from.
 * @param {SelectOneOptionsI<T>} options - Query options (fields, where, include, surrealql, raw, etc.; type-safe and flexible)
 * @returns {string} - The generated SurrealDB SELECT query string for a single record.
 */
export declare function generateFindOneQuery<T extends object = object>(table: string, options?: SelectOneOptionsI<T>): string;
