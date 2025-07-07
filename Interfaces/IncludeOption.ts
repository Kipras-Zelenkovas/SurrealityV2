// Utility types for recursive, type-safe includes and fields

/**
 * Extracts all keys from T whose values are objects or arrays of objects.
 * Used to determine which fields can be used for `include` in the ORM.
 *
 * Example:
 *   interface Car { id: string; brand: Brand; }
 *   type CarRelations = RelationKeys<Car>; // 'brand'
 */
export type RelationKeys<T> = {
  [K in keyof T]: T[K] extends (infer U)[]
    ? U extends object ? K : never
    : T[K] extends object ? K : never
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
  [K in keyof T]: T[K] extends object ? never : K
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
export type RecursiveIncludeOption<T> = RelationKeys<T> extends never
  ? never
  : {
      [K in RelationKeys<T>]: {
        model: K;
        fields?: Array<keyof (
          T[K] extends (infer U)[] ? U : T[K]
        )>;
        include?: Array<RecursiveIncludeOption<
          T[K] extends (infer U)[] ? U : T[K]
        >>;
      }
    }[RelationKeys<T>]; 