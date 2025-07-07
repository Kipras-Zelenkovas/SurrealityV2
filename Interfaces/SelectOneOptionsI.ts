import { IncludeOption } from "./IncludeOption";

export interface SelectOneOptionsI<TField extends string = string, TModel extends string = string> {
    fields?: TField[];
    where?: Record<string, any>; // Accepts any field, not just TField
    raw?: boolean;
    surrealql?: string;
    include?: TModel | TModel[] | IncludeOption<TField, TModel> | IncludeOption<TField, TModel>[];
} 