export type IncludeOption = {
    model: string;
    as?: string;
    fields?: string[];
    where?: Record<string, any>;
    include?: string | string[] | IncludeOption | IncludeOption[];
}; 