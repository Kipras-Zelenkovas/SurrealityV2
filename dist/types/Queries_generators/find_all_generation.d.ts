import { SelectOptionsI } from '../Interfaces/SelectOptionsI';
/**
 * Generates a SurrealDB SELECT query string for findAll/select operations.
 *
 * @template T - The table schema interface. Enables type-safe autocomplete for all fields in the current table, while remaining flexible for advanced use cases.
 * @param {string} table - The table name to select from.
 * @param {SelectOptionsI<T>} options - Query options (fields, where, order, limit, offset, include, etc.; type-safe and flexible)
 * @returns {string} - The generated SurrealDB SELECT query string.
 */
export declare function generateFindAllQuery<T extends object = object>(table: string, options?: SelectOptionsI<T>): string;
