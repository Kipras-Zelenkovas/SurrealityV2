import { CreateOptionsI } from '../Interfaces/CreateOptionsI';
/**
 * Generates a SurrealDB CREATE query string for inserting records.
 *
 * @template T - The table schema interface. Enables type-safe autocomplete for all fields in the current table, while remaining flexible for advanced use cases.
 * @param {string} table - The table name to insert into.
 * @param {CreateOptionsI<T>} options - Options for the create operation (type-safe and flexible).
 * @returns {string} - The generated SurrealDB CREATE query string.
 */
export declare function generateCreateQuery<T extends object>(table: string, options: CreateOptionsI<T>): string;
