import Surreal, { Duration, toSurrealqlString } from "surrealdb";
import {
    RoleScope,
    SurrealScope,
    PermissionScope,
} from "./Interfaces/ManagerI";
import {
    SurrealConfig,
    ErrorResponse,
    DurationScope,
} from "./Interfaces/GeneralI";
import { casting } from "./Utils/casting";

/**
 * Manager class for interacting with SurrealDB.
 * Provides methods to connect, disconnect, and retrieve information from the database.
 */
export class Manager {
    /**
     * The SurrealDB client instance.
     * @public
     * @type {Surreal | null}
     */
    public surreal: Surreal | null = null;

    /**
     * Configuration for the SurrealDB connection.
     * @public
     * @type {SurrealConfig}
     */
    public config: SurrealConfig;

    /**
     * Creates an instance of Manager.
     * @constructor
     * @param {string} [url="http://localhost:8080"] - The URL of the SurrealDB instance.
     * @param {string} [namespace="surreality"] - The namespace to use in SurrealDB.
     * @param {string} [database="surreality"] - The database to use in SurrealDB.
     * @param {string} [username="surrealist"] - The username for authentication.
     * @param {string} [password="surrealist"] - The password for authentication.
     */
    constructor(
        url: string = "http://localhost:8080",
        namespace: string = "surreality",
        database: string = "surreality",
        username: string = "surrealist",
        password: string = "surrealist"
    ) {
        this.config = {
            url,
            namespace,
            database,
            username,
            password,
        };
    }

    /**
     * Connects to the SurrealDB instance based on the specified mode.
     * @async
     * @param {SurrealScope} [mode="default"] - The connection mode. Can be "default", "root", or "namespace".
     * @returns {Promise<void | ErrorResponse>} - Returns `void` on success or an error response on failure.
     * @example
     * // Connect with default settings
     * await manager.connect();
     *
     * // Connect as root
     * await manager.connect("root");
     *
     * // Connect to a specific namespace
     * await manager.connect("namespace");
     */
    public async connect(
        mode: SurrealScope = "DATABASE"
    ): Promise<void | ErrorResponse> {
        try {
            const db = new Surreal();
            const options: any = {};

            switch (mode) {
                case "ROOT":
                    options.auth = {
                        username: this.config.username,
                        password: this.config.password,
                    };
                    break;

                case "NAMESPACE":
                    options.namespace = this.config.namespace;
                    options.auth = {
                        username: this.config.username,
                        password: this.config.password,
                        namespace: this.config.namespace,
                    };
                    break;

                default: // 'DATABASE' default
                    options.namespace = this.config.namespace;
                    options.database = this.config.database;
                    options.auth = {
                        username: this.config.username,
                        password: this.config.password,
                        namespace: this.config.namespace,
                        database: this.config.database,
                    };
            }

            await db.connect(this.config.url, options);
            this.surreal = db;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred";
            console.error(`Connection failed (${mode}): ${message}`);
            return {
                error: {
                    status: false,
                    message: `Connection failed (${mode}): ${message}`,
                },
            };
        }
    }

    /**
     * Executes a raw SurrealQL query against the connected SurrealDB instance.
     *
     * **Important:**
     * - Requires an active connection to SurrealDB.
     * - The query must be valid SurrealQL syntax.
     * - Use parameterized queries to prevent SQL injection.
     *
     * @async
     * @param {string} query - The SurrealQL query to execute.
     * @returns {Promise<any | ErrorResponse>} - Query result or error response.
     *
     * @example
     * // Execute a simple query
     * const result = await manager.query("SELECT * FROM user WHERE age > 18;");
     *
     * @example
     * // Execute a parameterized query
     * const result = await manager.query("SELECT * FROM user WHERE id = $id;", { id: 123 });
     *
     * @example
     * // Handle query errors
     * const result = await manager.query("INVALID QUERY;");
     * if (result?.error) {
     *     console.error(result.error.message);
     * }
     */
    public async query(query: string): Promise<any | ErrorResponse> {
        try {
            if (!this.surreal) throw new Error("Not connected to SurrealDB");

            return await this.surreal.query(query);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred";

            console.error(`Failed to execute query: ${message}`);
            return {
                error: {
                    status: false,
                    message: `Failed to execute query: ${message}`,
                },
            };
        }
    }

    // async return(query: string): Promise<any | ErrorResponse> {
    //     try {
    //         if(!this.surreal) throw new Error("Not connected to SurrealDB");
            
            
    //     } catch (error) {
    //         const message =
    //             error instanceof Error
    //                 ? error.message
    //                 : "Unknown error occurred";

    //         console.error(`Failed to return: ${message}`);
    //         return {
    //             error: {
    //                 status: false,
    //                 message: `Failed to return: ${message}`,
    //             },
    //         };
    //     }
    // }

    /**
     * Retrieves information from the SurrealDB instance based on the specified scope or user on that scope.
     *
     * @async
     * @param {SurrealScope} scope - The scope of the information to retrieve. Can be "ROOT", "namespace", or "DATABASE".
     * @param {string} [user] - The username for user-specific information. If not provided, general scope information is retrieved.
     * @returns {Promise<any | ErrorResponse | string>} - Returns the query result, an error response, or a string message if no user is provided.
     * @example
     * // Get root information
     * const rootInfo = await manager.getInfo("ROOT");
     *
     * // Get user information in the namespace
     * const userInfo = await manager.getInfo("namespace", "john_doe");
     */
    public async getInfo(
        scope: SurrealScope,
        user?: string
    ): Promise<any | ErrorResponse | string> {
        try {
            if (!this.surreal) throw new Error("Not connected to SurrealDB");

            const query = user
                ? `INFO FOR USER ${user} ON ${scope};`
                : `INFO FOR ${scope};`;

            return await this.surreal.query(query);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred";
            const context = user ? `${scope} user info` : `${scope} info`;

            console.error(`Failed to get ${context}: ${message}`);
            return {
                error: {
                    status: false,
                    message: `Failed to get ${context}: ${message}`,
                },
            };
        }
    }

    /**
     * Changes the current namespace/database scope in SurrealDB.
     * Can update either/both values while maintaining existing context.
     *
     * ** Important: ** use function is only viable for namespace users
     * ( can change databases ) and root users ( can change namespaces and databases )
     *
     * @async
     * @param {Object} params - Scope configuration
     * @param {string} [params.namespace] - New namespace (optional)
     * @param {string} [params.database] - New database (optional)
     * @returns {Promise<void | ErrorResponse>} - Void on success, error object on failure
     *
     * @example
     * // Change only namespace (root users)
     * await manager.use({ namespace: "new_ns" });
     *
     * // Change only database (namespace users)
     * await manager.use({ database: "new_db" });
     *
     * // Change both
     * await manager.use({ namespace: "prod", database: "analytics" });
     */
    public async use(params: {
        namespace?: string;
        database?: string;
    }): Promise<void | ErrorResponse> {
        try {
            if (!this.surreal) throw new Error("Not connected to SurrealDB");

            // Merge with new values
            const targetNs = params.namespace ?? this.config.namespace;
            const targetDb = params.database ?? this.config.database;

            if (!targetNs || !targetDb) {
                throw new Error("namespace and database must be defined");
            }

            // Update SurrealDB scope
            await this.surreal.use({
                namespace: targetNs,
                database: targetDb,
            });

            // Store new values
            this.config.namespace = targetNs;
            this.config.database = targetDb;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred";

            const changes = [
                ...(params.namespace ? [`namespace: ${params.namespace}`] : []),
                ...(params.database ? [`database: ${params.database}`] : []),
            ].join(" and ");

            console.error(`Scope update failed (${changes}): ${message}`);
            return {
                error: {
                    status: false,
                    message: `Scope update failed: ${message}`,
                },
            };
        }
    }

    /**
     * Defines a new user in SurrealDB with specified permissions and optional session/token duration settings.
     *
     * **Important Notes:**
     * - For `namespace` users: Requires prior `use({ namespace: "your_ns" })`.
     * - For `DATABASE` users: Requires prior `use({ namespace: "your_ns", database: "your_db" })`.
     * - For `ROOT` users: Requires root-level connection (`connect("root")`).
     * - If neither `session` nor `token` durations are provided, SurrealDB defaults to a token duration of **1 hour** and no session expiration.
     *
     * @async
     * @param {SurrealScope} scope - The scope for user creation (`ROOT`, `namespace`, or `DATABASE`).
     * @param {RoleScope} role - The role to assign (e.g., `OWNER`, `EDITOR`, `VIEWER`).
     * @param {string} username - Unique username (alphanumeric + `_-` only).
     * @param {string} password - User password (will be automatically hashed).
     * @param {Object} [session] - Optional session duration settings.
     * @param {number} session.time - Duration value for the session.
     * @param {DurationScope} session.unit - Duration unit for the session (e.g., "h" for hours, "d" for days).
     * @param {Object} [token] - Optional token duration settings.
     * @param {number} token.time - Duration value for the token.
     * @param {DurationScope} token.unit - Duration unit for the token (e.g., "h" for hours, "d" for days).
     * @returns {Promise<any | ErrorResponse>} - Query result or error response.
     *
     * @example
     * // Create root-level user
     * await manager.connect("root");
     * await manager.defineUser("ROOT", "OWNER", "root_user", "securepass");
     *
     * @example
     * // Create namespace-level user with a session duration
     * await manager.use({ namespace: "my_ns" });
     * await manager.defineUser("namespace", "EDITOR", "editor_user", "strongpass", { time: 2, unit: "h" });
     *
     * @example
     * // Create database-level user with token and session durations
     * await manager.use({ namespace: "my_ns", database: "my_db" });
     * await manager.defineUser("DATABASE", "VIEWER", "viewer_user", "secret123", { time: 1, unit: "d" }, { time: 30, unit: "m" });
     *
     * @example
     * // Create a user with default token duration (1 hour) and no session expiration
     * await manager.use({ namespace: "my_ns", database: "my_db" });
     * await manager.defineUser("DATABASE", "VIEWER", "viewer_user", "secret123");
     *
     * @example
     * // Handle errors
     * const result = await manager.defineUser("DATABASE", "ADMIN", "bad name", "pass");
     * if (result?.error) {
     *     console.error(result.error.message);
     * }
     */
    public async defineUser(
        scope: SurrealScope,
        role: RoleScope,
        username: string,
        password: string,
        session?: {
            time: bigint;
            unit: DurationScope;
        },
        token?: {
            time: bigint;
            unit: DurationScope;
        }
    ): Promise<any | ErrorResponse> {
        try {
            if (!this.surreal) throw new Error("Not connected to SurrealDB");

            if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
                throw new Error("Invalid username format");
            }

            const query = `DEFINE USER ${username} ON ${scope} PASSWORD '${password}' ROLES ${role}${
                session && !token
                    ? ` DURATION FOR SESSION ${session.time}${session.unit}`
                    : !session && token
                    ? ` DURATION FOR TOKEN ${token.time}${token.unit}`
                    : session && token
                    ? ` DURATION FOR SESSION ${session.time}${session.unit}, FOR TOKEN ${token.time}${token.unit}`
                    : ""
            };`;

            return await this.surreal.query(query);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unknown error occured";
            const context = `${username} with ${role} role on ${scope} scope`;

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
     * Defines a parameter in SurrealDB with optional creation flags and permissions.
     *
     * **Critical Requirements:**
     * - Namespace **MUST** be explicitly selected first using `use()` method.
     * - Database will be automatically used from Manager constructor if not explicitly selected.
     *
     * @async
     * @param {string} name - The name of the parameter to define.
     * @param {any} value - The value to assign to the parameter.
     * @param {Object} [opts] - Optional parameters for parameter creation.
     * @param {boolean} [opts.overwrite] - Overwrite existing parameter if it exists.
     * @param {boolean} [opts.ifNotExists] - Only create parameter if it doesn't exist.
     * @param {PermissionScope} [permissions] - Optional permissions for the parameter. Can be:
     *   - `NONE`: No permissions.
     *   - `FULL`: Full permissions.
     *   - Custom permissions string (e.g., `WHERE $auth.role = "admin"`).
     * @returns {Promise<any | ErrorResponse>} - Query result or error response.
     *
     * @example
     * // Define parameter in pre-selected namespace + default database
     * await manager.use({ namespace: "my_ns" });
     * await manager.defineParam("timeout", 30000);
     *
     * @example
     * // Overwrite existing parameter with custom permissions
     * await manager.use({ namespace: "prod", database: "metrics" });
     * await manager.defineParam("retries", 5, { overwrite: true }, "WHERE $auth.role = "admin"");
     *
     * @example
     * // Safe create if not exists with full permissions
     * await manager.defineParam("max_connections", 100, { ifNotExists: true }, "FULL");
     *
     * @example
     * // Handle errors
     * const result = await manager.defineParam("invalid param", "value");
     * if (result?.error) {
     *     console.error(result.error.message);
     * }
     */
    public async defineParam(
        name: string,
        value: any,
        opts?: {
            overwrite?: boolean;
            ifNotExists?: boolean;
        },
        permissions?: PermissionScope
    ): Promise<any | ErrorResponse> {
        try {
            if (!this.surreal) throw new Error("Not connected to SurrealDB");

            const query = `DEFINE PARAM ${
                opts && opts.overwrite ? `OVERWRITE ` : ""
            }${
                opts && opts.ifNotExists ? `IF NOT EXISTS ` : ""
            }$${name} VALUE ${casting(value)}${
                permissions && permissions == "NONE"
                    ? ` PERMISSIONS NONE`
                    : permissions && permissions == "FULL"
                    ? ` PERMISSIONS FULL`
                    : permissions && typeof permissions === "string"
                    ? ` PERMISSIONS ${permissions}`
                    : ""
            };`;

            return await this.surreal.query(query);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unknown error occured";
            const context = `parameter with name of ${name} and value of ${value}`;

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
     * Defines a new namespace in SurrealDB with optional creation flags
     *
     * **Critical Requirements:**
     * - Must be connected as **root user** (`connect("ROOT")`)
     * - Requires active root-level connection
     *
     * @async
     * @param {string} name - Name of the namespace to create
     * @param {Object} [opts] - Optional namespace creation flags
     * @param {boolean} [opts.overwrite] - Overwrite existing namespace if it exists
     * @param {boolean} [opts.ifNotExists] - Only create namespace if it doesn't exist
     * @returns {Promise<any | ErrorResponse>} - Query result or error response
     *
     * @example
     * // Define namespace as root user
     * await manager.connect("ROOT");
     * await manager.defineNamespace("production");
     *
     * @example
     * // Safely create namespace if missing
     * await manager.defineNamespace("staging", { ifNotExists: true });
     *
     * @example
     * // Force overwrite existing namespace
     * await manager.defineNamespace("dev", { overwrite: true });
     *
     * @example
     * // Handle permission errors
     * const result = await manager.defineNamespace("admin");
     * if (result?.error) {
     *     console.error(result.error.message);
     * }
     */
    public async defineNamespace(
        name: string,
        opts?: {
            overwrite?: boolean;
            ifNotExists?: boolean;
        }
    ): Promise<any | ErrorResponse> {
        try {
            if (!this.surreal) throw new Error("Not connected to SurrealDB");

            const query = `DEFINE NAMESPACE ${
                opts && opts.overwrite ? `OVERWRITE ` : ""
            }${opts && opts.ifNotExists ? `IF NOT EXISTS ` : ""}${name}`;

            return await this.surreal.query(query);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unknown error occured";
            const context = `namespace with name of ${name}`;

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
     * Defines a new database in SurrealDB with optional creation flags.
     *
     * * **Important:**
     * - For creation: Requires prior `use({ namespace: "your_ns" })` or `connect("NAMESPACE")` to be in needed namespace
     *
     * **Critical Requirements:**
     * - Must be connected as **root user** (`connect("ROOT")`) or **namespace user** (`connect("NAMESPACE")`).
     * - Requires active connection with proper permissions.
     *
     * @async
     * @param {string} name - Name of the database to create.
     * @param {Object} [opts] - Optional database creation flags.
     * @param {boolean} [opts.overwrite] - Overwrite existing database if it exists.
     * @param {boolean} [opts.ifNotExists] - Only create database if it doesn't exist.
     * @returns {Promise<any | ErrorResponse>} - Query result or error response.
     *
     * @example
     * // Define database as root user
     * await manager.connect("ROOT");
     * await manager.defineDatabase("production_db");
     *
     * @example
     * // Safely create database if missing
     * await manager.defineDatabase("staging_db", { ifNotExists: true });
     *
     * @example
     * // Force overwrite existing database
     * await manager.defineDatabase("dev_db", { overwrite: true });
     *
     * @example
     * // Handle permission errors
     * const result = await manager.defineDatabase("admin_db");
     * if (result?.error) {
     *     console.error(result.error.message);
     * }
     */
    public async defineDatabase(
        name: string,
        opts?: {
            overwrite?: boolean;
            ifNotExists?: boolean;
        }
    ): Promise<any | ErrorResponse> {
        try {
            if (!this.surreal) throw new Error("Not connected to SurrealDB");

            const query = `DEFINE DATABASE ${
                opts && opts.overwrite ? `OVERWRITE ` : ""
            }${opts && opts.ifNotExists ? `IF NOT EXISTS ` : ""}${name}`;

            return await this.surreal.query(query);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unknown error occured";
            const context = `database with name of ${name}`;

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
     * Disconnects from the SurrealDB instance.
     * @async
     * @returns {Promise<void>} - Resolves when the connection is closed.
     * @example
     * await manager.disconnect();
     */
    public async disconnect(): Promise<void> {
        if (this.surreal) {
            await this.surreal.close();
            this.surreal = null;
        }
    }

    public async getSurreal(): Promise<Surreal | null> {
        return this.surreal;
    }
}
