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
export {};
