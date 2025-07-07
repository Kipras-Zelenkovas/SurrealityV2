/**
 * Query options for selecting multiple records from a table (findAll).
 *
 * @template T - The table schema interface.
 * @property {Array<keyof T>} [fields] - Fields to select from the main table (type-safe, autocompleted).
 * @property {Record<string, any>} [where] - Filtering conditions (flexible, not type-checked).
 * @property {keyof T | Array<keyof T>} [order] - Fields to order by (type-safe).
 * @property {number} [limit] - Maximum number of records to return.
 * @property {number} [offset] - Number of records to skip.
 * @property {boolean} [raw] - If true, returns raw SurrealDB response.
 * @property {string} [surrealql] - Raw SurrealQL clause (overrides other options).
 * @property {Array<RecursiveIncludeOption<T>>} [include] - Nested, type-safe includes for related models.
 *
 * Example usage:
 *   userOrm.findAll({
 *     fields: ['id', 'name'],
 *     include: [{ model: 'cars', fields: ['id'], include: [{ model: 'brand', fields: ['id', 'name'] }] }]
 *   });
 */
import { RecursiveIncludeOption } from "./IncludeOption";

export interface SelectOptionsI<T extends object = object> {
    fields?: Array<keyof T>;
    where?: Record<string, any>; // Accepts any field, not just keyof T
    order?: keyof T | Array<keyof T>;
    limit?: number;
    offset?: number;
    raw?: boolean;
    surrealql?: string;
    include?: Array<RecursiveIncludeOption<T>>;
} 