import { IncludeOption } from "./IncludeOption";

export interface SelectOptionsI<TField extends string = string, TModel extends string = string> {
    fields?: TField[];
    where?: Record<string, any>; // Accepts any field, not just TField
    order?: TField | TField[];
    limit?: number;
    offset?: number;
    raw?: boolean;
    surrealql?: string;
    include?: TModel | TModel[] | IncludeOption<TField, TModel> | IncludeOption<TField, TModel>[];
} 