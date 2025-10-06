import { additionalFields, generateTableQuery } from "./Queries_generators/table_generation.js";
import { generateFieldQuery } from "./Queries_generators/field_generation.js";
import { generateFindAllQuery } from "./Queries_generators/find_all_generation.js";
import { generateFindOneQuery } from "./Queries_generators/find_one_generation.js";
import { generateCreateQuery } from "./Queries_generators/create_generation.js";
import { generateUpdateQuery } from "./Queries_generators/update_generation.js";
import { generateDeleteQuery } from "./Queries_generators/delete_generation.js";
/**
 * Surreality ORM class for SurrealDB.
 *
 * @template TTableSchema - The TypeScript interface representing the schema of the current table.
 *
 * This class provides a type-safe, autocompleted, and ergonomic interface for SurrealDB tables.
 * All data operations (create, findAll, findOne, update, delete) are type-safe and autocompleted for the fields of the table, including recursive, type-safe includes for related models.
 *
 * ---
 *
 * @example
 * // 1. Define your TypeScript interfaces for the schema (relations supported)
 * interface Brand {
 *   id: string;
 *   name: string;
 * }
 *
 * interface Car {
 *   id: string;
 *   brand: Brand;
 * }
 *
 * interface User {
 *   id: string;
 *   name: string;
 *   surname: string;
 *   cars: Car[];
 * }
 *
 * // 2. Create a SurrealDB client and Surreality ORM instance
 * import Surreal from 'surrealdb';
 * import { Surreality } from './Surreality.js';
 *
 * const surreal = new Surreal();
 * // Provide authentication options as needed
 * await surreal.connect('http://localhost:8000', { });
 *
 * const userOrm = new Surreality<User>(surreal, 'user');
 *
 * // 3. Define the table and fields (recommended for SCHEMAFULL tables)
 * await userOrm.defineTable("SCHEMAFULL", {
 *   creationMode: "IFNOTEXISTS",
 *   type: "NORMAL",
 *   permissions: { full: true },
 *   timestamps: true,
 * });
 * await userOrm.defineField('id', 'string', { optional: false, readonly: true });
 * await userOrm.defineField('name', 'string');
 * await userOrm.defineField('surname', 'string');
 * await userOrm.defineField('cars', 'array', { arrayValues: { type: 'DATATYPE', value: 'record' } });
 *
 * // 4. Create a new user
 * await userOrm.create({ data: { id: 'user:alice', name: 'Alice', surname: 'Smith', cars: [] } });
 *
 * // 5. Query users with includes, ordering, and pagination
 * const users = await userOrm.findAll({
 *   fields: ['id', 'name', 'surname', 'cars'],
 *   include: [
 *     {
 *       model: 'cars',
 *       fields: ['id'],
 *       include: [
 *         { model: 'brand', fields: ['id', 'name'] }
 *       ]
 *     }
 *   ],
 *   order: ['-name'],
 *   limit: 10,
 *   offset: 0
 * });
 *
 * // 6. Update a user
 * await userOrm.update({ id: 'user:alice', data: { surname: 'Johnson' } });
 *
 * // 7. Delete a user
 * await userOrm.delete({ id: 'user:alice' });
 *
 * ---
 *
 * - All options are type-safe and autocompleted from your schema interfaces.
 * - Includes and fields are recursively type-checked for relations.
 * - Use SCHEMAFULL for strict data, SCHEMALESS for flexibility or relations.
 * - See method docs for more advanced usage and SurrealDB best practices.
 */
export class Surreality {
    surreal = null;
    table = null;
    constructor(surreal, table) {
        this.surreal = surreal;
        this.table = table;
    }
    /**
     * Defines a table in SurrealDB with the specified base type and options.
     * This method generates and executes a `DEFINE TABLE` query, along with any additional default fields (e.g., timestamps).
     *
     * @param {"SCHEMAFULL" | "SCHEMALESS"} base - The base type of the table.
     *   - "SCHEMAFULL": The table enforces a strict schema.
     *   - "SCHEMALESS": The table allows flexible schema.
     * @param {TableOptsI} [options] - Optional configuration for the table definition. See TableOptsI for all available options:
     *   - creationMode: "OVERWRITE" | "IFNOTEXISTS" (table creation flags)
     *   - type: "ANY" | "NORMAL" | "RELATION" (table type)
     *   - relation: { from: string, to: string } (for relation tables)
     *   - asExpr: string (AS expression for computed tables)
     *   - changefeed: { duration: bigint, unit: DurationScope } (changefeed configuration)
     *   - permissions: { none, full, selectExpr, createExpr, updateExpr, deleteExpr } (table-level permissions)
     *   - timestamps: boolean | { createdAt?: boolean; updatedAt?: boolean; deletedAt?: boolean } (auto timestamp fields)
     *
     * @returns {Promise<any | ErrorResponse>} - The result of the table definition query or an error response.
     *
     * @throws {Error} - Throws if not connected to SurrealDB or table name is not specified.
     *
     * @example
     * // Define a SCHEMAFULL table with all timestamps and full permissions
     * await orm.defineTable("SCHEMAFULL", {
     *   creationMode: "IFNOTEXISTS",
     *   type: "NORMAL",
     *   permissions: { full: true },
     *   timestamps: true,
     * });
     *
     * @example
     * // Define a SCHEMALESS relation table with custom relation and changefeed
     * await orm.defineTable("SCHEMALESS", {
     *   type: "RELATION",
     *   relation: { from: "user", to: "account" },
     *   changefeed: { duration: 24n, unit: "h" },
     * });
     *
     * @example
     * // Define a table with only createdAt and updatedAt timestamps
     * await orm.defineTable("SCHEMAFULL", {
     *   timestamps: { createdAt: true, updatedAt: true },
     * });
     *
     * @example
     * // Define a table with custom permissions
     * await orm.defineTable("SCHEMAFULL", {
     *   permissions: { selectExpr: "WHERE user = $auth.id" },
     * });
     *
     * @note
     *   - The `timestamps` option controls which timestamp fields are auto-created. If true, all are included; if an object, only specified fields are included.
     *   - See TableOptsI for all available options and their types.
     *   - SurrealDB best practice: use SCHEMAFULL for strict data, SCHEMALESS for flexibility or relations.
     */
    async defineTable(base, options) {
        try {
            if (!this.surreal)
                throw new Error("Not connected to SurrealDB");
            if (!this.table)
                throw new Error("Table is not written");
            const tableQuery = generateTableQuery(this.table, base, options);
            let defaultFields = additionalFields(this.table, options?.timestamps);
            await this.surreal.query(tableQuery);
            for (let query of defaultFields) {
                await this.surreal.query(query);
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error occured";
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
    /**
     * Defines a field (column) on the current table in SurrealDB.
     * Generates and executes a `DEFINE FIELD` query with the specified type and options.
     *
     * @param {string} name - The name of the field to define.
     * @param {DataType | DataType[]} type - The SurrealDB data type(s) for the field (e.g., DataTypes.STRING, DataTypes.INT, etc.).
     * @param {FieldOptsI} [options] - Additional options for the field:
     *   - optional: If true, field is not required (nullable).
     *   - default: Default value expression for the field.
     *   - value: Value expression for the field.
     *   - arrayValues: Array type/value configuration.
     *   - assertExpr: Assertion expression for validation.
     *   - readonly: If true, field is read-only.
     *   - creationMode: "OVERWRITE" | "IFNOTEXISTS" (creation flags).
     *   - permissions: Field-level permissions.
     * @returns {Promise<any | ErrorResponse>} - The result of the query or an error response.
     *
     * @example
     * // Define a required integer field
     * await orm.defineField("age", DataTypes.INTEGER);
     *
     * @example
     * // Define an optional string field, only if it does not exist
     * await orm.defineField("nickname", DataTypes.STRING, { optional: true, creationMode: "IFNOTEXISTS" });
     *
     * @example
     * // Define a boolean field with a default value
     * await orm.defineField("isActive", DataTypes.BOOLEAN, { default: { expression: true } });
     *
     * @example
     * // Define an array of strings
     * await orm.defineField("tags", DataTypes.ARRAY, { arrayValues: { type: "DATATYPE", value: DataTypes.STRING } });
     *
     * @example
     * // Define a record field pointing to a specific table
     * await orm.defineField("profile", DataTypes.RECORD, { recordTable: "profile" });
     *
     * @example
     * // Define an array of records with size limit
     * await orm.defineField("posts", DataTypes.ARRAY, {
     *   arrayValues: { type: "DATATYPE", value: DataTypes.RECORD, size: 10 },
     *   recordTable: "post"
     * });
     */
    async defineField(name, type, options) {
        try {
            if (!this.surreal)
                throw new Error("Not connected to SurrealDB");
            if (!this.table)
                throw new Error("Table is not written");
            const fieldQuery = generateFieldQuery(this.table, name, type, options);
            await this.surreal.query(fieldQuery);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error occured";
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
    async findAll(options) {
        try {
            if (!this.surreal)
                throw new Error("Not connected to SurrealDB");
            if (!this.table)
                throw new Error("Table is not written");
            // Generate query string using generator
            const query = generateFindAllQuery(this.table, options);
            const result = await this.surreal.query(query);
            if (options?.raw)
                return result;
            // SurrealDB returns an array of results
            if (Array.isArray(result) && Array.isArray(result[0])) {
                return result[0] ?? null;
            }
            // If result does not match expected shape, return null in typed mode
            return null;
        }
        catch (error) {
            let message;
            if (error instanceof Error && typeof error.message === "string") {
                message = error.message;
            }
            else {
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
    async findOne(options) {
        try {
            if (!this.surreal)
                throw new Error("Not connected to SurrealDB");
            if (!this.table)
                throw new Error("Table is not written");
            // Generate query string using generator
            const query = generateFindOneQuery(this.table, options);
            const result = await this.surreal.query(query);
            if (options?.raw)
                return result;
            // SurrealDB returns an object
            if (Array.isArray(result) && Array.isArray(result[0])) {
                return result[0][0] ?? null;
            }
            return null;
        }
        catch (error) {
            let message;
            if (error instanceof Error && typeof error.message === "string") {
                message = error.message;
            }
            else {
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
     * @template TTableSchema - The schema type for the table (for type-safe field suggestions).
     * @param {CreateOptionsI<TTableSchema>} options - Options for the create operation.
     * @returns {Promise<any | ErrorResponse>} - The created record(s) or ErrorResponse on failure.
     *
     * @example
     * // Define a schema for the user table
     * interface UserTable { name: string; age: number; email?: string; }
     * const userOrm = new Surreality<UserTable>(...);
     * // Type-safe create with autocomplete for UserTable fields
     * await userOrm.create({ data: { name: 'Alice', age: 30 } });
     */
    async create(options) {
        try {
            if (!this.surreal)
                throw new Error("Not connected to SurrealDB");
            if (!this.table)
                throw new Error("Table is not written");
            const query = generateCreateQuery(this.table, options);
            const result = await this.surreal.query(query);
            if (options.raw)
                return result;
            if (Array.isArray(result)) {
                return result[0];
            }
            return result;
        }
        catch (error) {
            let message;
            if (error instanceof Error && typeof error.message === "string") {
                message = error.message;
            }
            else {
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
    /**
     * Updates records in the table.
     * Supports SurrealDB CONTENT and SET syntax, updating by record ID or WHERE clause, and custom SurrealQL.
     *
     * @template TTableSchema - The schema type for the table (for type-safe field suggestions).
     * @param {UpdateOptionsI<TTableSchema>} options - Options for the update operation.
     * @returns {Promise<any | ErrorResponse>} - The updated record(s) or ErrorResponse on failure.
     *
     * @example
     * // Update a user by ID
     * await userOrm.update({ id: 'user:alice', data: { age: 31 } });
     *
     * @example
     * // Update users matching a WHERE clause
     * await userOrm.update({ where: { age: 30 }, data: { active: false } });
     *
     * @example
     * // Use SET syntax instead of CONTENT
     * await userOrm.update({ id: 'user:alice', data: { age: 32 }, content: false });
     *
     * @example
     * // Use a raw SurrealQL query
     * await userOrm.update({ surrealql: 'UPDATE user SET active = true WHERE age > 18' });
     */
    async update(options) {
        try {
            if (!this.surreal)
                throw new Error("Not connected to SurrealDB");
            if (!this.table)
                throw new Error("Table is not written");
            const query = generateUpdateQuery(this.table, options);
            const result = await this.surreal.query(query);
            if (options.raw)
                return result;
            if (Array.isArray(result)) {
                return result[0];
            }
            return result;
        }
        catch (error) {
            let message;
            if (error instanceof Error && typeof error.message === "string") {
                message = error.message;
            }
            else {
                message = "Unknown error occured";
            }
            const context = `update on table ${this.table}`;
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
     * Deletes records from the table.
     * Supports deleting by record ID or WHERE clause, and custom SurrealQL.
     *
     * @template TTableSchema - The schema type for the table (for type-safe field suggestions).
     * @param {DeleteOptionsI<TTableSchema>} options - Options for the delete operation.
     * @returns {Promise<any | ErrorResponse>} - The deleted record(s) or ErrorResponse on failure.
     *
     * @example
     * // Delete a user by ID
     * await userOrm.delete({ id: 'user:alice' });
     *
     * @example
     * // Delete users matching a WHERE clause
     * await userOrm.delete({ where: { age: 30 } });
     *
     * @example
     * // Use a raw SurrealQL query
     * await userOrm.delete({ surrealql: 'DELETE user WHERE age < 18' });
     */
    async delete(options) {
        try {
            if (!this.surreal)
                throw new Error("Not connected to SurrealDB");
            if (!this.table)
                throw new Error("Table is not written");
            const query = generateDeleteQuery(this.table, options);
            const result = await this.surreal.query(query);
            if (options.raw)
                return result;
            if (Array.isArray(result)) {
                return result[0];
            }
            return result;
        }
        catch (error) {
            let message;
            if (error instanceof Error && typeof error.message === "string") {
                message = error.message;
            }
            else {
                message = "Unknown error occured";
            }
            const context = `delete on table ${this.table}`;
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
export { Manager } from "./Manager.js";
export { DataTypes } from "./Utils/DataTypes.js";
