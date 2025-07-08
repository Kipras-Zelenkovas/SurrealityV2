/**
 * Query options for selecting a single record from a table (findOne).
 *
 * @template T - The table schema interface. Enables type-safe autocomplete for all fields in the current table, while remaining flexible for advanced use cases.
 */
import { RecursiveIncludeOption } from "./IncludeOption";

export interface SelectOneOptionsI<T extends object = object> {
    fields?: Array<keyof T>;
    /**
     * Filtering conditions for the select. Autocompletes table fields (type-safe), but allows any key for advanced queries (flexible).
     * Used for WHERE clause.
     */
    where?: Partial<T> & Record<string, any>;
    raw?: boolean;
    surrealql?: string;
    include?: Array<RecursiveIncludeOption<T>>;
} 