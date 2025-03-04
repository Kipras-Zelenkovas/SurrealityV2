export const DataTypes = {
    ANY:        "any",
    ARRAY:      "array",
    BOOLEAN:    "bool",
    BYTES:      "bytes",
    DATATIME:   "datetime",
    DECIMAL:    "decimal",
    DURATION:   "duration",
    FLOAT:      "float",
    INTEGER:    "int",
    NONE:       "NONE",
    NUMBER:     "number",
    OBJECT:     "object",
    STRING:     "string",
    RECORD:     "record",
} as const;

export type DataType = typeof DataTypes[keyof typeof DataTypes];