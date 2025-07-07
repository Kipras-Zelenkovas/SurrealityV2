// Helper functions for SurrealDB query clause generation

import { IncludeOption } from '../Interfaces/IncludeOption';

/**
 * Flattens Sequelize-style include options into SurrealDB FETCH clause paths.
 */
export function flattenIncludes(
    include: string | string[] | IncludeOption | IncludeOption[],
    parentPath = ''
): string[] {
    if (typeof include === 'string') {
        return [parentPath ? `${parentPath}.${include}` : include];
    }
    if (Array.isArray(include)) {
        return include.flatMap((inc) => flattenIncludes(inc, parentPath));
    }
    // IncludeOption object
    const path = parentPath ? `${parentPath}.${include.as || include.model}` : (include.as || include.model);
    let paths = [path];
    if (include.include) {
        paths = [
            path,
            ...flattenIncludes(include.include, path)
        ];
    }
    return paths;
}

/**
 * Collects all fields for SELECT clause from includes.
 */
export function collectIncludeFields(
    include: string | string[] | IncludeOption | IncludeOption[],
    parentPath = ''
): string[] {
    if (typeof include === 'string') {
        return [];
    }
    if (Array.isArray(include)) {
        return include.flatMap((inc) => collectIncludeFields(inc, parentPath));
    }
    // IncludeOption object
    const path = parentPath ? `${parentPath}.${include.as || include.model}` : (include.as || include.model);
    let fields: string[] = [];
    if (include.fields && include.fields.length > 0) {
        fields = include.fields.map(f => `${path}.${f}`);
    }
    if (include.include) {
        fields = [
            ...fields,
            ...collectIncludeFields(include.include, path)
        ];
    }
    return fields;
}

/**
 * Generates a SurrealDB WHERE clause from a where object.
 */
export function generateWhereClause(where?: Record<string, any>): string {
    if (!where) return '';
    const conditions = Object.entries(where).map(([key, value]) => {
        if (typeof value === 'string') {
            return `${key} = '${value.replace(/'/g, "''")}'`;
        } else if (typeof value === 'boolean' || typeof value === 'number') {
            return `${key} = ${value}`;
        } else {
            return `${key} = ${value}`;
        }
    });
    return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
}

/**
 * Generates a SurrealDB ORDER BY clause from order option(s).
 */
export function generateOrderByClause(order?: string | string[]): string {
    if (!order) return '';
    const orders = Array.isArray(order) ? order : [order];
    const orderStrings = orders.map((o) => {
        if (o.startsWith('-')) {
            return `${o.slice(1)} DESC`;
        } else {
            return `${o} ASC`;
        }
    });
    return orderStrings.length > 0 ? `ORDER BY ${orderStrings.join(', ')}` : '';
}

/**
 * Generates SurrealDB LIMIT and START (offset) clauses.
 */
export function generateLimitOffsetClause(limit?: number, offset?: number): string {
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
 * Generates a SurrealDB FETCH clause from includes.
 */
export function generateFetchClause(include?: string | string[] | IncludeOption | IncludeOption[]): string {
    if (!include) return '';
    const fetchPaths = flattenIncludes(include);
    return fetchPaths.length > 0 ? `FETCH ${fetchPaths.join(', ')}` : '';
} 