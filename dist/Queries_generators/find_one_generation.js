import { collectIncludeFields, generateFetchClause, generateWhereClause } from './helper.js';
/**
 * Generates a SurrealDB SELECT query string for findOne/select single record operations.
 *
 * @template T - The table schema interface. Enables type-safe autocomplete for all fields in the current table, while remaining flexible for advanced use cases.
 * @param {string} table - The table name to select from.
 * @param {SelectOneOptionsI<T>} options - Query options (fields, where, include, surrealql, raw, etc.; type-safe and flexible)
 * @returns {string} - The generated SurrealDB SELECT query string for a single record.
 */
export function generateFindOneQuery(table, options) {
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
    // LIMIT 1 (unless surrealql already has a limit)
    let limitClause = '';
    if (!options?.surrealql) {
        limitClause = 'LIMIT 1';
    }
    else if (!/limit\s+\d+/i.test(options.surrealql)) {
        // If surrealql is provided but doesn't have a LIMIT, add it
        limitClause = 'LIMIT 1';
    }
    // Raw SurrealQL clause (overrides other options)
    let customClause = '';
    if (options?.surrealql) {
        customClause = options.surrealql.trim();
    }
    // Build query
    const query = `SELECT ${fields} FROM ${table} ` +
        (customClause || [whereClause, limitClause, fetchClause].filter(Boolean).join(' ')) +
        ';';
    return query;
}
