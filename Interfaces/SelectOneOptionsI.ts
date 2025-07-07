/**
 * Query options for selecting a single record from a table (findOne).
 *
 * @template T - The table schema interface.
 * @property {Array<keyof T>} [fields] - Fields to select from the main table (type-safe, autocompleted).
 * @property {Record<string, any>} [where] - Filtering conditions (flexible, not type-checked).
 * @property {boolean} [raw] - If true, returns raw SurrealDB response.
 * @property {string} [surrealql] - Raw SurrealQL clause (overrides other options).
 * @property {Array<RecursiveIncludeOption<T>>} [include] - Nested, type-safe includes for related models.
 *
 * Example usage:
 *   userOrm.findOne({
 *     fields: ['id', 'name'],
 *     include: [{ model: 'cars', fields: ['id'], include: [{ model: 'brand', fields: ['id', 'name'] }] }]
 *   });
 */
import { RecursiveIncludeOption } from "./IncludeOption";

export interface SelectOneOptionsI<T extends object = object> {
    fields?: Array<keyof T>;
    where?: Record<string, any>; // Accepts any field, not just keyof T
    raw?: boolean;
    surrealql?: string;
    include?: Array<RecursiveIncludeOption<T>>;
} 