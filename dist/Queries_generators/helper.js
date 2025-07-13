// Helper functions for SurrealDB query clause generation
import { casting } from '../Utils/casting.js';
/**
 * Flattens recursive, type-safe include options into SurrealDB FETCH clause paths.
 * @template T - The table schema interface.
 * @param {Array<RecursiveIncludeOption<T>>} include - Type-safe include tree.
 * @param {string} [parentPath] - Used for recursion.
 * @returns {string[]} - Array of SurrealDB FETCH paths.
 */
export function flattenIncludes(include, parentPath = '') {
    return include.flatMap((inc) => {
        const path = parentPath ? `${parentPath}.${inc.as || inc.model}` : (inc.as || inc.model);
        let paths = [path];
        if (inc.include && Array.isArray(inc.include)) {
            paths = [
                path,
                ...flattenIncludes(inc.include, path)
            ];
        }
        return paths;
    });
}
/**
 * Collects all fields for SELECT clause from recursive, type-safe includes.
 * @template T - The table schema interface.
 * @param {Array<RecursiveIncludeOption<T>>} include - Type-safe include tree.
 * @param {string} [parentPath] - Used for recursion.
 * @returns {string[]} - Array of field paths for SELECT clause.
 */
export function collectIncludeFields(include, parentPath = '') {
    return include.flatMap((inc) => {
        const path = parentPath ? `${parentPath}.${inc.as || inc.model}` : (inc.as || inc.model);
        let fields = [];
        if (inc.fields && inc.fields.length > 0) {
            fields = inc.fields.map(f => `${path}.${f}`);
        }
        if (inc.include && Array.isArray(inc.include)) {
            fields = [
                ...fields,
                ...collectIncludeFields(inc.include, path)
            ];
        }
        return fields;
    });
}
/**
 * Generates a SurrealDB WHERE clause from a where object.
 *
 * @template T - The table schema interface. Enables type-safe autocomplete for all fields in the current table, while remaining flexible for advanced use cases.
 * @param {Partial<T> & Record<string, any>} where - Filtering conditions (type-safe and flexible).
 * @returns {string} - The generated WHERE clause, or an empty string if no conditions.
 */
export function generateWhereClause(where) {
    if (!where)
        return '';
    const conditions = Object.entries(where).map(([key, value]) => {
        if (typeof value === "string") {
            return `${key} = ${casting(value.replace(/'/g, "''"))}`;
        }
        else if (typeof value === "boolean" || typeof value === "number") {
            return `${key} = ${casting(value)}`;
        }
        else {
            return `${key} = ${casting(value)}`;
        }
    });
    return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
}
/**
 * Generates a SurrealDB ORDER BY clause from order option(s).
 */
export function generateOrderByClause(order) {
    if (!order)
        return '';
    const orders = Array.isArray(order) ? order : [order];
    const orderStrings = orders.map((o) => {
        if (o.startsWith('-')) {
            return `${o.slice(1)} DESC`;
        }
        else {
            return `${o} ASC`;
        }
    });
    return orderStrings.length > 0 ? `ORDER BY ${orderStrings.join(', ')}` : '';
}
/**
 * Generates SurrealDB LIMIT and START (offset) clauses.
 */
export function generateLimitOffsetClause(limit, offset) {
    let clause = '';
    if (typeof offset === 'number') {
        clause += `START ${offset} `;
    }
    if (typeof limit === 'number') {
        clause += `LIMIT ${limit}`;
    }
    return clause.trim();
}
/**
 * Generates a SurrealDB FETCH clause from recursive, type-safe includes.
 * @template T - The table schema interface.
 * @param {Array<RecursiveIncludeOption<T>>} [include] - Type-safe include tree.
 * @returns {string} - SurrealDB FETCH clause.
 */
export function generateFetchClause(include) {
    if (!include || include.length === 0)
        return '';
    const fetchPaths = flattenIncludes(include);
    return fetchPaths.length > 0 ? `FETCH ${fetchPaths.join(', ')}` : '';
}
