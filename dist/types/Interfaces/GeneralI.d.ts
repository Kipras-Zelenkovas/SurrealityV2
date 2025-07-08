export interface SurrealConfig {
    url: string;
    namespace: string;
    database: string;
    username: string;
    password: string;
}
export interface ErrorResponse {
    error: {
        status: boolean;
        message: string;
    };
}
export type DurationScope = "ns" | "us" | "ms" | "s" | "m" | "h" | "d" | "w" | "y";
