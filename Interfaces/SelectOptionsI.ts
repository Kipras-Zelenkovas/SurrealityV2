import { IncludeOption } from "./IncludeOption";

export interface SelectOptionsI {
    fields?: string[];
    where?: Record<string, any>;
    order?: string | string[];
    limit?: number;
    offset?: number;
    raw?: boolean;
    surrealql?: string;
    include?: string | string[] | IncludeOption | IncludeOption[];
} 