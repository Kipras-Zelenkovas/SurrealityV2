import { generateWhereClause } from './helper';
/**
 * Generates a SurrealDB DELETE query string for deleting records.
 *
 * @template T - The table schema interface. Enables type-safe autocomplete for all fields in the current table, while remaining flexible for advanced use cases.
 * @param {string} table - The table name to delete from.
 * @param {DeleteOptionsI<T>} options - Options for the delete operation (type-safe and flexible).
 * @returns {string} - The generated SurrealDB DELETE query string.
 */
export function generateDeleteQuery(table, options) {
    if (options.surrealql) {
        return options.surrealql.trim();
    }
    let target = table;
    if (options.id) {
        target = `${table}:${options.id}`;
    }
    let query = `DELETE ${target}`;
    // WHERE clause (only if not deleting by id)
    if (!options.id && options.where) {
        const whereClause = generateWhereClause(options.where);
        if (whereClause)
            query += ' ' + whereClause;
    }
    query += ';';
    return query;
}
