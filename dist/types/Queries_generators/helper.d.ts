import { RecursiveIncludeOption } from '../Interfaces/IncludeOption.js';
/**
 * Flattens recursive, type-safe include options into SurrealDB FETCH clause paths.
 * @template T - The table schema interface.
 * @param {Array<RecursiveIncludeOption<T>>} include - Type-safe include tree.
 * @param {string} [parentPath] - Used for recursion.
 * @returns {string[]} - Array of SurrealDB FETCH paths.
 */
export declare function flattenIncludes<T>(include: Array<RecursiveIncludeOption<T>>, parentPath?: string): string[];
/**
 * Collects all fields for SELECT clause from recursive, type-safe includes.
 * @template T - The table schema interface.
 * @param {Array<RecursiveIncludeOption<T>>} include - Type-safe include tree.
 * @param {string} [parentPath] - Used for recursion.
 * @returns {string[]} - Array of field paths for SELECT clause.
 */
export declare function collectIncludeFields<T>(include: Array<RecursiveIncludeOption<T>>, parentPath?: string): string[];
/**
 * Generates a SurrealDB WHERE clause from a where object.
 *
 * @template T - The table schema interface. Enables type-safe autocomplete for all fields in the current table, while remaining flexible for advanced use cases.
 * @param {Partial<T> & Record<string, any>} where - Filtering conditions (type-safe and flexible).
 * @returns {string} - The generated WHERE clause, or an empty string if no conditions.
 */
export declare function generateWhereClause<T = any>(where?: Partial<T> & Record<string, any>): string;
/**
 * Generates a SurrealDB ORDER BY clause from order option(s).
 */
export declare function generateOrderByClause(order?: string | string[]): string;
/**
 * Generates SurrealDB LIMIT and START (offset) clauses.
 */
export declare function generateLimitOffsetClause(limit?: number, offset?: number): string;
/**
 * Generates a SurrealDB FETCH clause from recursive, type-safe includes.
 * @template T - The table schema interface.
 * @param {Array<RecursiveIncludeOption<T>>} [include] - Type-safe include tree.
 * @returns {string} - SurrealDB FETCH clause.
 */
export declare function generateFetchClause<T>(include?: Array<RecursiveIncludeOption<T>>): string;
