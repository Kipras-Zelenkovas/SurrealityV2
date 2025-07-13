import { casting } from "../Utils/casting";
/**
 * Generates a SurrealDB CREATE query string for inserting records.
 *
 * @template T - The table schema interface. Enables type-safe autocomplete for all fields in the current table, while remaining flexible for advanced use cases.
 * @param {string} table - The table name to insert into.
 * @param {CreateOptionsI<T>} options - Options for the create operation (type-safe and flexible).
 * @returns {string} - The generated SurrealDB CREATE query string.
 */
export function generateCreateQuery(table, options) {
    if (options.surrealql) {
        return options.surrealql.trim();
    }
    let target = table;
    if (options.id) {
        target = `${table}:${options.id}`;
    }
    let query = `CREATE ${target} `;
    // Use CONTENT by default unless content: false is explicitly set
    if (options.content !== false) {
        let castedData = [];
        Object.keys(options.data).map((key) => {
            castedData.push(`"${key}": ${casting(options.data[key])}`);
        });
        query += `CONTENT ${castedData.join(", ")};`;
    }
    else {
        // SET syntax: flatten object to SET field1 = value1, ...
        const data = Array.isArray(options.data) ? options.data[0] : options.data;
        const setClauses = Object.entries(data)
            .map(([k, v]) => `${k} = ${typeof v === "string" ? `'${v.replace(/'/g, "''")}'` : JSON.stringify(v)}`)
            .join(", ");
        query += `SET ${setClauses};`;
    }
    return query;
}
