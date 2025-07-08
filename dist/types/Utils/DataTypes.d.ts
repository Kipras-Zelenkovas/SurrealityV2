export declare const DataTypes: {
    readonly ANY: "any";
    readonly ARRAY: "array";
    readonly BOOLEAN: "bool";
    readonly BYTES: "bytes";
    readonly DATATIME: "datetime";
    readonly DECIMAL: "decimal";
    readonly DURATION: "duration";
    readonly FLOAT: "float";
    readonly INTEGER: "int";
    readonly NONE: "NONE";
    readonly NUMBER: "number";
    readonly OBJECT: "object";
    readonly STRING: "string";
    readonly RECORD: "record";
};
export type DataType = typeof DataTypes[keyof typeof DataTypes];
