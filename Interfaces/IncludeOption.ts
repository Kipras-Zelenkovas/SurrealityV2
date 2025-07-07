export type IncludeOption<TField extends string = string, TModel extends string = string> = {
    model: TModel;
    as?: string;
    fields?: TField[];
    where?: Record<string, any>;
    include?: string | string[] | IncludeOption<TField, TModel> | IncludeOption<TField, TModel>[];
}; 