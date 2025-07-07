import { IncludeOption } from "./IncludeOption";

export interface SelectOneOptionsI {
    fields?: string[];
    where?: Record<string, any>;
    raw?: boolean;
    surrealql?: string;
    include?: string | string[] | IncludeOption | IncludeOption[];
} 