/**
 * Options for deleting records in SurrealDB.
 *
 * @template T - The table schema interface. Enables type-safe autocomplete for all fields in the current table, while remaining flexible for advanced use cases.
 */
export interface DeleteOptionsI<T extends object = object> {
    /**
     * Optional explicit record ID (e.g., 'user:john'). If provided, deletes a specific record.
     */
    id?: string;
    /**
     * Filtering conditions for the delete. Autocompletes table fields (type-safe), but allows any key for advanced queries (flexible).
     * Used for WHERE clause.
     */
    where?: Partial<T> & Record<string, any>;
    /**
     * If true, return the raw SurrealDB response.
     */
    raw?: boolean;
    /**
     * Provide a raw SurrealQL DELETE query (overrides other options).
     */
    surrealql?: string;
} 