import { casting } from "../Utils/casting.js";
import { generateWhereClause } from "./helper.js";
/**
 * Generates a SurrealDB UPDATE query string for updating records.
 *
 * @template T - The table schema interface. Enables type-safe autocomplete for all fields in the current table, while remaining flexible for advanced use cases.
 * @param {string} table - The table name to update.
 * @param {UpdateOptionsI<T>} options - Options for the update operation (type-safe and flexible).
 * @returns {string} - The generated SurrealDB UPDATE query string.
 */
export function generateUpdateQuery(table, options) {
    if (options.surrealql) {
        return options.surrealql.trim();
    }
    let target = table;
    if (options.id) {
        target = `${options.id}`;
    }
    let query = `UPDATE ${target} `;
    // Use CONTENT by default unless content: false is explicitly set
    if (options.content !== false) {
        let castedData = [];
        Object.keys(options.data).map((key) => {
            castedData.push(`"${key}": ${casting(options.data[key])}`);
        });
        query += `CONTENT {${castedData.join(", ")}}`;
    }
    else {
        // SET syntax: flatten object to SET field1 = value1, ...
        const data = Array.isArray(options.data) ? options.data[0] : options.data;
        const setClauses = Object.entries(data)
            .map(([k, v]) => `${k} = ${typeof v === "string" ? `'${v.replace(/'/g, "''")}'` : JSON.stringify(v)}`)
            .join(", ");
        query += `SET ${setClauses}`;
    }
    // WHERE clause (only if not updating by id)
    if (!options.id && options.where) {
        const whereClause = generateWhereClause(options.where);
        if (whereClause)
            query += " " + whereClause;
    }
    query += "";
    if (options.return) {
        query += ` RETURN ${options.return};`;
    }
    else {
        query += ` RETURN AFTER;`;
    }
    return query;
}
