/**
 * Options for creating a record in SurrealDB.
 *
 * @template T - The table schema interface. Enables type-safe autocomplete for all fields in the current table, while remaining flexible for advanced use cases.
 */
export interface CreateOptionsI<T extends object = object> {
    /**
     * The data to insert. Can be an object (single record) or array (multiple records).
     * Fully type-safe and autocompleted from the table schema.
     */
    data: T | T[];
    /**
     * Optional explicit record ID (e.g., 'user:john').
     */
    id?: string;
    /**
     * If true or omitted, use SurrealDB CONTENT syntax. If false, use SET syntax.
     */
    content?: boolean;
    /**
     * If true, return the raw SurrealDB response.
     */
    raw?: boolean;
    /**
     * Provide a raw SurrealQL CREATE query (overrides other options).
     */
    surrealql?: string;
} 