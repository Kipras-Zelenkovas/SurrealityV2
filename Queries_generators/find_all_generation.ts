import { SelectOptionsI } from '../Interfaces/SelectOptionsI';
import { collectIncludeFields, generateFetchClause, generateWhereClause, generateOrderByClause, generateLimitOffsetClause } from './helper';

/**
 * Generates a SurrealDB SELECT query string for findAll/select operations.
 * @param {string} table - The table name to select from.
 * @param {SelectOptionsI} options - Query options (fields, where, order, limit, offset, include, etc.)
 * @returns {string} - The generated SurrealDB SELECT query string.
 */
export function generateFindAllQuery(table: string, options?: SelectOptionsI): string {
    // Collect all fields for SELECT (main + includes)
    const selectFields: string[] = [];
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

/**
 * Generates a SurrealDB SELECT query string for findOne/select single record operations.
 * @param {string} table - The table name to select from.
 * @param {SelectOptionsI} options - Query options (fields, where, include, surrealql, raw, etc.)
 * @returns {string} - The generated SurrealDB SELECT query string for a single record.
 */
export function generateFindOneQuery(table: string, options?: SelectOptionsI): string {
    // Collect all fields for SELECT (main + includes)
    const selectFields: string[] = [];
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
    } else if (!/limit\s+\d+/i.test(options.surrealql)) {
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