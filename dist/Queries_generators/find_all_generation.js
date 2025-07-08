import { collectIncludeFields, generateFetchClause, generateWhereClause, generateOrderByClause, generateLimitOffsetClause } from './helper';
/**
 * Generates a SurrealDB SELECT query string for findAll/select operations.
 *
 * @template T - The table schema interface. Enables type-safe autocomplete for all fields in the current table, while remaining flexible for advanced use cases.
 * @param {string} table - The table name to select from.
 * @param {SelectOptionsI<T>} options - Query options (fields, where, order, limit, offset, include, etc.; type-safe and flexible)
 * @returns {string} - The generated SurrealDB SELECT query string.
 */
export function generateFindAllQuery(table, options) {
    // Collect all fields for SELECT (main + includes)
    const selectFields = [];
    if (options?.fields && options.fields.length > 0) {
        selectFields.push(...options.fields);
    }
    if (options?.include) {
        selectFields.push(...collectIncludeFields(options.include));
    }
    const fields = selectFields.length > 0 ? selectFields.join(', ') : '*';
    // FETCH clause
    const fetchClause = generateFetchClause(options?.include);
    // WHERE clause
    const whereClause = (!options?.surrealql) ? generateWhereClause(options?.where) : '';
    // ORDER BY clause
    const orderClause = (!options?.surrealql) ? generateOrderByClause(options?.order) : '';
    // LIMIT/OFFSET clause
    const limitClause = (!options?.surrealql) ? generateLimitOffsetClause(options?.limit, options?.offset) : '';
    // Raw SurrealQL clause (overrides other options)
    let customClause = '';
    if (options?.surrealql) {
        customClause = options.surrealql.trim();
    }
    // Build query
    const query = `SELECT ${fields} FROM ${table} ` +
        (customClause || [whereClause, orderClause, limitClause, fetchClause].filter(Boolean).join(' ')) +
        ';';
    return query;
}
