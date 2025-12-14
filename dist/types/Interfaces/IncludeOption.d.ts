/**
 * Helper to extract the object type from a union (filtering out primitives)
 */
type ExtractObjectType<T> = T extends string | number | boolean | symbol | bigint | null | undefined ? never : T extends object ? T : never;
/**
 * Helper to extract object type from array union (e.g., string[] | UserI[] => UserI)
 */
type ExtractArrayObjectType<T> = T extends (infer U)[] ? ExtractObjectType<U> : never;
/**
 * Extracts all keys from T whose values are objects or arrays of objects.
 * Used to determine which fields can be used for `include` in the ORM.
 *
 * Example:
 *   interface Car { id: string; brand: Brand; }
 *   type CarRelations = RelationKeys<Car>; // 'brand'
 */
export type RelationKeys<T> = {
    [K in keyof T]: NonNullable<T[K]> extends (infer U)[] ? ExtractArrayObjectType<NonNullable<T[K]>> extends never ? never : K : ExtractObjectType<NonNullable<T[K]>> extends never ? never : K;
}[keyof T];
/**
 * Extracts all keys from T whose values are NOT objects (i.e., scalar fields).
 * Useful for stricter typing of `fields` if you only want to allow scalar fields.
 *
 * Example:
 *   interface Car { id: string; brand: Brand; year: number; }
 *   type CarScalars = ScalarKeys<Car>; // 'id' | 'year'
 */
export type ScalarKeys<T> = {
    [K in keyof T]: T[K] extends object ? never : K;
}[keyof T];
/**
 * Recursively describes valid include options for a given interface T.
 * Each include can specify:
 *   - model: the relation key (object/array field)
 *   - fields: valid fields for the related model (all keys, or use ScalarKeys for stricter typing)
 *   - include: further nested includes, recursively
 *
 * Example:
 *   interface User { cars: Car[]; }
 *   RecursiveIncludeOption<User> allows { model: 'cars', fields: [...], include: [...] }
 */
export type RecursiveIncludeOption<T> = RelationKeys<T> extends never ? never : RelationKeys<T> extends infer K ? K extends RelationKeys<T> ? {
    model: K;
    fields?: Array<keyof (NonNullable<T[K & keyof T]> extends (infer U)[] ? ExtractArrayObjectType<NonNullable<T[K & keyof T]>> : ExtractObjectType<NonNullable<T[K & keyof T]>>)>;
    include?: Array<RecursiveIncludeOption<NonNullable<T[K & keyof T]> extends (infer U)[] ? ExtractArrayObjectType<NonNullable<T[K & keyof T]>> : ExtractObjectType<NonNullable<T[K & keyof T]>>>>;
} : never : never;
/**
 * Helper to resolve the object type from a union like `string | UserI` or `string | UserI[]`
 * Returns the non-primitive type (the interface/object type)
 *
 * For unions like `string | UserI`, extracts `UserI`
 * For unions like `string | UserI[]`, extracts `UserI[]`
 */
type ResolveRelationType<T> = T extends (infer U)[] ? U extends string | number | boolean | symbol | bigint | null | undefined ? T : Exclude<U, string | number | boolean | symbol | bigint | null | undefined>[] : Exclude<T, string | number | boolean | symbol | bigint | null | undefined>;
/**
 * Helper to extract the primitive type from a union like `string | UserI`
 * Returns just the primitive type (e.g., `string`)
 *
 * For unions like `string | UserI`, extracts `string`
 * For unions like `string[] | UserI[]`, extracts `string[]`
 */
type ResolvePrimitiveType<T> = T extends (infer U)[] ? Extract<U, string | number | boolean | symbol | bigint | null | undefined> extends never ? T : Extract<U, string | number | boolean | symbol | bigint | null | undefined>[] : Extract<T, string | number | boolean | symbol | bigint | null | undefined>;
/**
 * Helper to extract the model names from an include array
 */
type ExtractIncludedModels<TInclude> = TInclude extends Array<infer I> ? I extends {
    model: infer M;
} ? M : never : never;
/**
 * Helper to get nested include for a specific model
 */
type GetNestedInclude<TInclude, TModel> = TInclude extends Array<infer I> ? I extends {
    model: TModel;
    include: infer NestedInclude;
} ? NestedInclude : never : never;
/**
 * Recursively transforms an interface based on included relations.
 * - If a relation IS included: resolves from `string | Interface` to `Interface`
 * - If a relation is NOT included: resolves from `string | Interface` to `string`
 * Also recursively transforms nested includes.
 */
type TransformWithInclude<T, TInclude, TAllRelations = RelationKeys<T>> = {
    [K in keyof T]: K extends ExtractIncludedModels<TInclude> ? GetNestedInclude<TInclude, K> extends never ? ResolveRelationType<T[K]> : T[K] extends (infer U)[] ? ResolveRelationType<U>[] extends (infer V)[] ? TransformWithInclude<V, GetNestedInclude<TInclude, K>, RelationKeys<V>>[] : never : ResolveRelationType<T[K]> extends infer R ? TransformWithInclude<R, GetNestedInclude<TInclude, K>, RelationKeys<R>> : never : K extends TAllRelations ? ResolvePrimitiveType<T[K]> : T[K];
};
/**
 * Determines the return type for findAll/findOne based on whether include is specified.
 * - If include is provided: transforms relations based on what's included
 * - If no include: resolves all relations to their primitive types (string)
 */
export type WithInclude<T, TOptions> = TOptions extends {
    include: infer TInclude;
} ? TransformWithInclude<T, TInclude> : TransformWithInclude<T, never>;
export {};
