/**
 * Main casting function that converts data to type-tagged strings
 * Accepts Dayjs objects (will be serialized to ISO strings) and handles recursive structures.
 * @param opt - Casting options or raw data
 * @returns Type-tagged string or "NONE" for invalid
 */
export declare const casting: (opt: any) => string;
/**
 * Recursively traverse a value and convert SurrealDB datetime tagged values or ISO strings to Dayjs objects.
 * Accepts: strings matching ISO pattern or objects that contain datetime fields.
 */
export declare const parseDatesToDayjs: (value: any) => any;
