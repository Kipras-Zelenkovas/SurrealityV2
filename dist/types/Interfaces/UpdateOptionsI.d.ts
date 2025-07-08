/**
 * Options for updating records in SurrealDB.
 *
 * @template T - The table schema interface. Enables type-safe autocomplete for all fields in the current table, while remaining flexible for advanced use cases.
 */
export interface UpdateOptionsI<T extends object = object> {
    /**
     * The data to update. Can be a partial object (fields to update) or array of partial objects.
     * Fully type-safe and autocompleted from the table schema.
     */
    data: Partial<T> | Array<Partial<T>>;
    /**
     * Optional explicit record ID (e.g., 'user:john'). If provided, updates a specific record.
     */
    id?: string;
    /**
     * Filtering conditions for the update. Autocompletes table fields (type-safe), but allows any key for advanced queries (flexible).
     * Used for WHERE clause.
     */
    where?: Partial<T> & Record<string, any>;
    /**
     * If true or omitted, use SurrealDB CONTENT syntax. If false, use SET syntax.
     */
    content?: boolean;
    /**
     * If true, return the raw SurrealDB response.
     */
    raw?: boolean;
    /**
     * Provide a raw SurrealQL UPDATE query (overrides other options).
     */
    surrealql?: string;
}
