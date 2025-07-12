import { DataType } from "../Utils/DataTypes";
import { DurationScope } from "./GeneralI";

export interface TableOptsI {
    creationMode?: "OVERWRITE" | "IFNOTEXISTS";
    type?: "ANY" | "NORMAL" | "RELATION";
    relation?: {
        from: string;
        to: string;
    };
    asExpr?: string;
    changefeed?: {
        duration: bigint;
        unit: DurationScope;
    };
    permissions?: {
        none?: boolean;
        full?: boolean;
        selectExpr?: string;
        createExpr?: string;
        updateExpr?: string;
        deleteExpr?: string;
    };
    timestamps?:
        | boolean
        | {
              createdAt?: boolean;
              updatedAt?: boolean;
              deletedAt?: boolean;
          };
}

export interface FieldOptsI {
    optional?: boolean;
    default?: {
        expression: any;
        always?: boolean;
    };
    value?: {
        expression: any;
        future?: boolean;
    };
    arrayValues?: {
        type?: "VALUE" | "DATATYPE";
        value?: string | string[] | DataType | DataType[];
        size?: number;
    };
    recordTable?: string; // For record type, specifies the table name
    assertExpr?: string;
    readonly?: boolean;
    creationMode?: "OVERWRITE" | "IFNOTEXISTS";
    permissions?: {
        none?: boolean;
        full?: boolean;
        selectExpr?: string;
        createExpr?: string;
        updateExpr?: string;
        deleteExpr?: string;
    };
}
