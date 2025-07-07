import { CreateOptionsI } from '../Interfaces/CreateOptionsI';

/**
 * Generates a SurrealDB CREATE query string for inserting records.
 * @param {string} table - The table name to insert into.
 * @param {CreateOptionsI} options - Options for the create operation.
 * @returns {string} - The generated SurrealDB CREATE query string.
 */
export function generateCreateQuery<T extends object>(table: string, options: CreateOptionsI<T>): string {
    if (options.surrealql) {
        return options.surrealql.trim();
    }
    let target = table;
    if (options.id) {
        target = `${table}:${options.id}`;
    }
    let query = `CREATE ${target} `;
    if (options.content) {
        query += `CONTENT ${JSON.stringify(options.data)};`;
    } else {
        // SET syntax: flatten object to SET field1 = value1, ...
        const data = Array.isArray(options.data) ? options.data[0] : options.data;
        const setClauses = Object.entries(data)
            .map(([k, v]) => `${k} = ${typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : JSON.stringify(v)}`)
            .join(', ');
        query += `SET ${setClauses};`;
    }
    return query;
} 