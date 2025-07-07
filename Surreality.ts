import Surreal from "surrealdb";
import { ErrorResponse } from "./Interfaces/GeneralI";
import { FieldOptsI, TableOptsI } from "./Interfaces/TableI";
import { SelectOptionsI } from './Interfaces/SelectOptionsI';
import {
    additionalFields,
    generateTableQuery,
} from "./Queries_generators/table_generation";
import { DataType } from "./Utils/DataTypes";
import { generateFieldQuery } from "./Queries_generators/field_generation";

import { generateFindAllQuery } from './Queries_generators/find_all_generation';
import { generateFindOneQuery } from './Queries_generators/find_one_generation';
import { SelectOneOptionsI } from './Interfaces/SelectOneOptionsI';
import { CreateOptionsI } from './Interfaces/CreateOptionsI';
import { generateCreateQuery } from './Queries_generators/create_generation';

export class Surreality {
    private surreal: Surreal | null = null;

    private table: string | null = null;

    constructor(surreal: Surreal, table: string) {
        this.surreal = surreal;
        this.table = table;
    }

    /**
     * Defines a table in SurrealDB with the specified base type and options.
     * This method generates and executes a `DEFINE TABLE` query, along with any additional default fields (e.g., timestamps).
     *
     * @param { "SCHEMAFULL" | "SCHEMALESS" } base - The base type of the table.
     * - `"SCHEMAFULL"`: The table enforces a strict schema.
     * - `"SCHEMALESS"`: The table allows flexible schema.
     * @param { TableOptsI } [options] - Optional configuration for the table definition.
     * - Includes properties like `creationMode`, `type`, `relation`, `asExpr`, `changefeed`, `permissions`, and `timestamps`.
     * - See the `TableOptsI` interface for detailed structure.
     * @returns { Promise<any | ErrorResponse> } - A promise that resolves to:
     * - `any`: The result of the table definition query (if successful).
     * - `ErrorResponse`: An object containing error details if the operation fails.
     *
     * @throws { Error } - Throws an error if:
     * - Not connected to SurrealDB (`this.surreal` is undefined).
     * - The table name is not specified (`this.table` is undefined).
     *
     * @example
     * // Define a SCHEMAFULL table with timestamps and permissions
     * await defineTable("SCHEMAFULL", {
     *   creationMode: "IFNOTEXISTS",
     *   type: "NORMAL",
     *   permissions: { full: true },
     *   timestamps: true,
     * });
     *
     * @example
     * // Define a SCHEMALESS table with custom relation and changefeed
     * await defineTable("SCHEMALESS", {
     *   relation: { from: "user", to: "account" },
     *   changefeed: { duration: 24n, unit: "h" },
     * });
     */
    private async defineTable(
        base: "SCHEMAFULL" | "SCHEMALESS",
        options?: TableOptsI
    ): Promise<any | ErrorResponse> {
        try {
            if (!this.surreal) throw new Error("Not connected to SurrealDB");
            if (!this.table) throw new Error("Table is not written");

            const tableQuery = generateTableQuery(this.table, base, options);

            let defaultFields: string[] = additionalFields(
                this.table,
                options?.timestamps
            );

            await this.surreal.query(tableQuery);

            for (let query of defaultFields) {
                await this.surreal.query(query);
            }
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unknown error occured";
            const context = `table with name ${this.table}`;

            console.error(`Failed to define ${context}: ${message}`);
            return {
                error: {
                    status: false,
                    message: `Failed to define ${context}: ${message}`,
                },
            };
        }
    }

    private async defineField(
        name: string,
        type: DataType | DataType[],
        options?: FieldOptsI
    ): Promise<any | ErrorResponse> {
        try {
            if (!this.surreal) throw new Error("Not connected to SurrealDB");
            if (!this.table) throw new Error("Table is not written");

            const fieldQuery = generateFieldQuery(
                this.table,
                name,
                type,
                options
            );

            console.log(fieldQuery);
            // await this.surreal.query(fieldQuery);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unknown error occured";
            const context = `field with name ${name}`;

            console.error(`Failed to define ${context}: ${message}`);
            return {
                error: {
                    status: false,
                    message: `Failed to define ${context}: ${message}`,
                },
            };
        }
    }

    /**
     * Performs a SELECT query on the current table, similar to Sequelize's findAll.
     * Allows flexible querying with fields, filtering, ordering, limits, eager loading (include), and more.
     *
     * @param {Object} [options] - Query options for selecting records.
     * @param {string[]} [options.fields] - Array of field names to select. Defaults to all fields ('*').
     * @param {Object} [options.where] - Key-value pairs for WHERE clause. Supports basic equality and SurrealQL expressions.
     * @param {string | string[]} [options.order] - Field(s) to order by. Prefix with '-' for DESC (e.g., '-createdAt').
     * @param {number} [options.limit] - Maximum number of records to return.
     * @param {number} [options.offset] - Number of records to skip (SurrealDB: 'START').
     * @param {boolean} [options.raw] - If true, returns raw SurrealDB response.
     * @param {string} [options.surrealql] - Provide a raw SurrealQL WHERE/ORDER/LIMIT clause (overrides other options).
     * @param {string | string[] | IncludeOption | IncludeOption[]} [options.include] - Related fields/tables to eager load (supports nested includes like Sequelize, uses SurrealDB FETCH clause). Each include can specify fields (attributes) and where (filter, only post-processed).
     * @returns {Promise<any[] | ErrorResponse>} - Array of records or ErrorResponse on failure.
     *
     * @example
     * // Get all users with their posts
     * await surreality.findAll({ include: 'posts' });
     *
     * @example
     * // Get users with profile and nested avatar, selecting only id and bio from profile
     * await surreality.findAll({ include: [{ model: 'profile', fields: ['id', 'bio'], include: [{ model: 'avatar', fields: ['url'] }] }] });
     *
     * @example
     * // Get users with posts and comments on posts, filtering posts by published
     * await surreality.findAll({ include: [{ model: 'posts', where: { published: true }, include: ['comments'] }] });
     *
     * @note
     *   - The 'fields' option in includes will select those fields in the main SELECT clause (e.g., 'profile.id').
     *   - The 'where' option in includes is NOT natively supported by SurrealDB FETCH and will NOT filter included records in the query. You may post-process results in JS if needed.
     */
    private async findAll(options?: SelectOptionsI): Promise<any[] | ErrorResponse> {
        try {
            if (!this.surreal) throw new Error("Not connected to SurrealDB");
            if (!this.table) throw new Error("Table is not written");

            // Generate query string using generator
            const query = generateFindAllQuery(this.table, options);

            const result = await this.surreal.query(query);
            if (options?.raw) return result;
            // SurrealDB returns an array of results, each with a 'result' property
            if (
                Array.isArray(result) &&
                result.length > 0 &&
                typeof result[0] === 'object' &&
                result[0] !== null &&
                'result' in result[0]
            ) {
                return (result[0] as { result: any }).result;
            }
            return result;
        } catch (error: unknown) {
            let message: string;
            if (error instanceof Error && typeof error.message === 'string') {
                message = error.message;
            } else {
                message = "Unknown error occured";
            }
            const context = `findAll on table ${this.table}`;

            console.error(`Failed to execute ${context}: ${message}`);
            return {
                error: {
                    status: false,
                    message: `Failed to execute ${context}: ${message}`,
                },
            };
        }
    }

    /**
     * Finds a single record from the table, supporting fields, where, include, raw, and surrealql options.
     * Returns the first record found or null if not found.
     *
     * @param {SelectOneOptionsI} [options] - Query options for selecting a single record.
     * @param {string[]} [options.fields] - Array of field names to select. Defaults to all fields ('*').
     * @param {Object} [options.where] - Key-value pairs for WHERE clause. Supports basic equality and SurrealQL expressions.
     * @param {boolean} [options.raw] - If true, returns raw SurrealDB response.
     * @param {string} [options.surrealql] - Provide a raw SurrealQL WHERE/ORDER/LIMIT clause (overrides other options).
     * @param {string | string[] | IncludeOption | IncludeOption[]} [options.include] - Related fields/tables to eager load (supports nested includes like Sequelize, uses SurrealDB FETCH clause). Each include can specify fields (attributes) and where (filter, only post-processed).
     * @returns {Promise<any | null | ErrorResponse>} - The found record, null if not found, or ErrorResponse on failure.
     *
     * @example
     * // Find a user by id
     * await surreality.findOne({ where: { id: 'user:abc123' } });
     *
     * @example
     * // Find a user with profile, selecting only id and name
     * await surreality.findOne({ fields: ['id', 'name'], include: [{ model: 'profile', fields: ['bio'] }] });
     *
     * @example
     * // Find a user with a custom SurrealQL clause
     * await surreality.findOne({ surrealql: 'WHERE age > 18' });
     *
     * @note
     *   - The 'fields' option in includes will select those fields in the main SELECT clause (e.g., 'profile.id').
     *   - The 'where' option in includes is NOT natively supported by SurrealDB FETCH and will NOT filter included records in the query. You may post-process results in JS if needed.
     *   - Always returns a single record (or null), never an array.
     */
    private async findOne(options?: SelectOneOptionsI): Promise<any | null | ErrorResponse> {
        try {
            if (!this.surreal) throw new Error("Not connected to SurrealDB");
            if (!this.table) throw new Error("Table is not written");

            // Generate query string using generator
            const query = generateFindOneQuery(this.table, options);

            const result = await this.surreal.query(query);
            if (options?.raw) return result;
            // SurrealDB returns an array of results, each with a 'result' property
            if (
                Array.isArray(result) &&
                result.length > 0 &&
                typeof result[0] === 'object' &&
                result[0] !== null &&
                'result' in result[0] &&
                Array.isArray((result[0] as { result: any[] }).result)
            ) {
                const records = (result[0] as { result: any[] }).result;
                return records.length > 0 ? records[0] : null;
            }
            return null;
        } catch (error: unknown) {
            let message: string;
            if (error instanceof Error && typeof error.message === 'string') {
                message = error.message;
            } else {
                message = "Unknown error occured";
            }
            const context = `findOne on table ${this.table}`;

            console.error(`Failed to execute ${context}: ${message}`);
            return {
                error: {
                    status: false,
                    message: `Failed to execute ${context}: ${message}`,
                },
            };
        }
    }

    /**
     * Creates a new record in the table.
     * Supports SurrealDB SET and CONTENT syntax, explicit record IDs, and custom SurrealQL.
     *
     * @param {CreateOptionsI} options - Options for the create operation.
     * @param {object|object[]} options.data - The data to insert (object for single record, array for multiple records).
     * @param {string} [options.id] - Optional explicit record ID (e.g., 'user:john').
     * @param {boolean} [options.content] - If true, use CONTENT syntax. If false or omitted, use SET syntax.
     * @param {boolean} [options.raw] - If true, return the raw SurrealDB response.
     * @param {string} [options.surrealql] - Provide a raw SurrealQL CREATE query (overrides other options).
     * @returns {Promise<any | ErrorResponse>} - The created record(s) or ErrorResponse on failure.
     *
     * @example
     * // Create a user with SET syntax
     * await surreality.create({ data: { name: 'Alice', age: 30 } });
     *
     * @example
     * // Create a user with explicit ID and CONTENT syntax
     * await surreality.create({ id: 'john', data: { name: 'John' }, content: true });
     *
     * @example
     * // Create multiple users
     * await surreality.create({ data: [{ name: 'A' }, { name: 'B' }], content: true });
     *
     * @example
     * // Use a raw SurrealQL CREATE query
     * await surreality.create({ surrealql: "CREATE user SET name = 'Bob';" });
     */
    private async create(options: CreateOptionsI): Promise<any | ErrorResponse> {
        try {
            if (!this.surreal) throw new Error("Not connected to SurrealDB");
            if (!this.table) throw new Error("Table is not written");

            const query = generateCreateQuery(this.table, options);
            const result = await this.surreal.query(query);
            if (options.raw) return result;
            if (
                Array.isArray(result) &&
                result.length > 0 &&
                typeof result[0] === 'object' &&
                result[0] !== null &&
                'result' in result[0]
            ) {
                return (result[0] as { result: any }).result;
            }
            return result;
        } catch (error: unknown) {
            let message: string;
            if (error instanceof Error && typeof error.message === 'string') {
                message = error.message;
            } else {
                message = "Unknown error occured";
            }
            const context = `create on table ${this.table}`;

            console.error(`Failed to execute ${context}: ${message}`);
            return {
                error: {
                    status: false,
                    message: `Failed to execute ${context}: ${message}`,
                },
            };
        }
    }
}
