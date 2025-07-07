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

/**
 * Surreality ORM class for SurrealDB.
 *
 * @template TTableSchema - The TypeScript interface representing the schema of the current table.
 *
 * By providing a schema interface as the generic parameter, all data operations (e.g., create, findAll, findOne) will be type-safe and autocompleted for the fields of that table, including recursive, type-safe includes for related models.
 *
 * @example
 * // Example of nested interfaces for a relational schema
 * interface Brand {
 *   id: string;         // scalar field
 *   name: string;       // scalar field
 * }
 *
 * interface Car {
 *   id: string;         // scalar field
 *   brand: Brand;       // relation to Brand (object field)
 * }
 *
 * interface User {
 *   id: string;         // scalar field
 *   name: string;       // scalar field
 *   surname: string;    // scalar field
 *   cars: Car[];        // relation to Car[] (array of objects)
 * }
 *
 * // Create an ORM instance for the user table
 * const userOrm = new Surreality<User>(...);
 *
 * // Type-safe, recursive includes and fields
 * await userOrm.findAll({
 *   include: [
 *     {
 *       model: 'cars',
 *       fields: ['id'],
 *       include: [
 *         { model: 'brand', fields: ['id', 'name'] }
 *       ]
 *     }
 *   ],
 *   fields: ['id', 'name', 'surname', 'cars']
 * });
 * // TypeScript will error if you use a field or include not in the interface
 */
export class Surreality<TTableSchema extends object = object> {
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
     */
    public async defineField(
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
     * Allows flexible querying with type-safe, recursive includes and fields.
     *
     * @param {SelectOptionsI<TTableSchema>} [options] - Query options for selecting records.
     *   - fields: Array of field names to select from the main table (autocompleted from the interface).
     *   - where: Filtering conditions (flexible, not type-checked).
     *   - order: Field(s) to order by (type-safe).
     *   - limit: Maximum number of records to return.
     *   - offset: Number of records to skip.
     *   - raw: If true, returns raw SurrealDB response.
     *   - surrealql: Raw SurrealQL clause (overrides other options).
     *   - include: Array of nested, type-safe includes for related models. Each include allows only valid relation fields, and its own fields/include options are autocompleted from the related interface.
     *
     * @returns {Promise<any[] | ErrorResponse>} - Array of records or ErrorResponse on failure.
     *
     * @example
     * // Get all users with their cars and each car's brand (fully type-safe, recursive includes)
     * await userOrm.findAll({
     *   include: [
     *     {
     *       model: 'cars',
     *       fields: ['id'],
     *       include: [
     *         { model: 'brand', fields: ['id', 'name'] }
     *       ]
     *     }
     *   ],
     *   fields: ['id', 'name', 'surname', 'cars']
     * });
     *
     * @example
     * // Get users with only id and name fields
     * await userOrm.findAll({ fields: ['id', 'name'] });
     *
     * @example
     * // Get users with cars, but only select car ids
     * await userOrm.findAll({ include: [{ model: 'cars', fields: ['id'] }] });
     *
     * @note
     *   - The 'fields' option in includes will select those fields in the main SELECT clause (e.g., 'cars.id').
     *   - The 'include' option is fully recursive and type-safe: only valid relation fields and their valid fields/includes are allowed at each level.
     *   - The 'where' option is flexible and not type-checked.
     *   - All options are autocompleted and type-checked based on your interface structure.
     */
    public async findAll(
        options?: SelectOptionsI<TTableSchema>
    ): Promise<any[] | ErrorResponse> {
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
     * Finds a single record from the table, supporting type-safe, recursive includes and fields.
     * Returns the first record found or null if not found.
     *
     * @param {SelectOneOptionsI<TTableSchema>} [options] - Query options for selecting a single record.
     *   - fields: Array of field names to select from the main table (autocompleted from the interface).
     *   - where: Filtering conditions (flexible, not type-checked).
     *   - raw: If true, returns raw SurrealDB response.
     *   - surrealql: Raw SurrealQL clause (overrides other options).
     *   - include: Array of nested, type-safe includes for related models. Each include allows only valid relation fields, and its own fields/include options are autocompleted from the related interface.
     *
     * @returns {Promise<any | null | ErrorResponse>} - The found record, null if not found, or ErrorResponse on failure.
     *
     * @example
     * // Find a user with cars and their brands
     * await userOrm.findOne({
     *   include: [
     *     {
     *       model: 'cars',
     *       fields: ['id'],
     *       include: [
     *         { model: 'brand', fields: ['id', 'name'] }
     *       ]
     *     }
     *   ]
     * });
     *
     * @example
     * // Find a user with only id and name fields
     * await userOrm.findOne({ fields: ['id', 'name'] });
     *
     * @note
     *   - The 'fields' option in includes will select those fields in the main SELECT clause (e.g., 'cars.id').
     *   - The 'include' option is fully recursive and type-safe: only valid relation fields and their valid fields/includes are allowed at each level.
     *   - The 'where' option is flexible and not type-checked.
     *   - All options are autocompleted and type-checked based on your interface structure.
     *   - Always returns a single record (or null), never an array.
     */
    public async findOne(
        options?: SelectOneOptionsI<TTableSchema>
    ): Promise<any | null | ErrorResponse> {
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
    public async create(options: CreateOptionsI<TTableSchema>): Promise<any | ErrorResponse> {
        try {
            if (!this.surreal) throw new Error("Not connected to SurrealDB");
            if (!this.table) throw new Error("Table is not written");

            const query = generateCreateQuery<TTableSchema>(this.table, options);
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
