import { SelectOptionsI } from '../Interfaces/SelectOptionsI.js';
import { collectIncludeFields, generateFetchClause, generateWhereClause, generateOrderByClause, generateLimitOffsetClause } from './helper.js';

/**
 * Generates a SurrealDB SELECT query string for findAll/select operations.
 *
 * @template T - The table schema interface. Enables type-safe autocomplete for all fields in the current table, while remaining flexible for advanced use cases.
 * @param {string} table - The table name to select from.
 * @param {SelectOptionsI<T>} options - Query options (fields, where, order, limit, offset, include, etc.; type-safe and flexible)
 * @returns {string} - The generated SurrealDB SELECT query string.
 */
export function generateFindAllQuery<T extends object = object>(table: string, options?: SelectOptionsI<T>): string {
    // Collect all fields for SELECT (main + includes)
    const selectFields: string[] = [];
    if (options?.fields && options.fields.length > 0) {
        selectFields.push(...(options.fields as string[]));
    }
    if (options?.include) {
        selectFields.push(...collectIncludeFields(options.include));
    }
    const fields = selectFields.length > 0 ? selectFields.join(', ') : '*';

    // FETCH clause
    const fetchClause = generateFetchClause(options?.include);
    // WHERE clause
    const whereClause = (!options?.surrealql) ? generateWhereClause(options?.where, options?.operator, options?.joinOperator) : '';
    // ORDER BY clause
    const orderClause = (!options?.surrealql) ? generateOrderByClause(options?.order as string | string[]) : '';
    // LIMIT/OFFSET clause
    const limitClause = (!options?.surrealql) ? generateLimitOffsetClause(options?.limit, options?.offset) : '';

    // Raw SurrealQL clause (overrides other options)
    let customClause = '';
    if (options?.surrealql) {
        customClause = options.surrealql.trim();
    }

    // Build query
    const query = customClause ? `${customClause} ` : `SELECT ${fields} FROM ${table} ` +
        [whereClause, orderClause, limitClause, fetchClause].filter(Boolean).join(' ') +
        ';';
    return query;
}