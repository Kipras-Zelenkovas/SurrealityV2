/**
 * Query options for selecting multiple records from a table (findAll).
 *
 * @template T - The table schema interface. Enables type-safe autocomplete for all fields in the current table, while remaining flexible for advanced use cases.
 */
import { RecursiveIncludeOption } from "./IncludeOption.js";

export interface SelectOptionsI<T extends object = object> {
    fields?: Array<keyof T>;
    /**
     * Filtering conditions for the select. Autocompletes table fields (type-safe), but allows any key for advanced queries (flexible).
     * Used for WHERE clause.
     */
    where?: Partial<T> & Record<string, any>;
    order?: keyof T | Array<keyof T>;
    limit?: number;
    offset?: number;
    raw?: boolean;
    surrealql?: string;
    include?: Array<RecursiveIncludeOption<T>>;
    operator?: "=" | "!=" | "<" | "<=" | ">" | ">=" | "CONTAINS" | "CONTAINSNOT";
    joinOperator?: "AND" | "OR";
} 