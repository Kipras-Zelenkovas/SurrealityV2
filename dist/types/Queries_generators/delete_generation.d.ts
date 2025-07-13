import { DeleteOptionsI } from '../Interfaces/DeleteOptionsI.js';
/**
 * Generates a SurrealDB DELETE query string for deleting records.
 *
 * @template T - The table schema interface. Enables type-safe autocomplete for all fields in the current table, while remaining flexible for advanced use cases.
 * @param {string} table - The table name to delete from.
 * @param {DeleteOptionsI<T>} options - Options for the delete operation (type-safe and flexible).
 * @returns {string} - The generated SurrealDB DELETE query string.
 */
export declare function generateDeleteQuery<T extends object>(table: string, options: DeleteOptionsI<T>): string;
