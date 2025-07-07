/**
 * Options for creating a record in SurrealDB.
 */
export interface CreateOptionsI<T extends object = object> {
    /**
     * The data to insert. Can be an object (single record) or array (multiple records).
     */
    data: T | T[];
    /**
     * Optional explicit record ID (e.g., 'user:john').
     */
    id?: string;
    /**
     * If true, use SurrealDB CONTENT syntax. If false or omitted, use SET syntax.
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