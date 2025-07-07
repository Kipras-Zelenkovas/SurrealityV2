import { FieldOptsI } from "../Interfaces/TableI";
import { DataType } from "../Utils/DataTypes";

export const generateFieldQuery = (
    table: string,
    name: string,
    type: DataType | DataType[],
    options?: FieldOptsI
): string => {
    let query = `DEFINE FIELD`;
    if (options?.creationMode) {
        query +=
            options.creationMode == "OVERWRITE"
                ? ` OVERWRITE`
                : options.creationMode == "IFNOTEXISTS"
                ? ` IF NOT EXISTS`
                : "";
    }
    query += ` ${name} ON TABLE ${table} `;

    query += type == "object" ? "FLEXIBLE TYPE " : "TYPE ";

    if (options?.optional) {
        query += `option<`;
    }

    if (typeof type == "string") {
        if (Array.isArray(type)) {
            let arrayTypes = Array.isArray(options?.arrayValues?.type)
                ? options?.arrayValues?.type.join("|")
                : options?.arrayValues?.type;

            let arrayValues = Array.isArray(options?.arrayValues?.value)
                ? options?.arrayValues?.value.join("|")
                : options?.arrayValues?.value;

            query += `array<${arrayTypes}`;
        } else {
            query += type;
        }
    } else if (Array.isArray(type)) {
    }

    if (options?.optional) {
        query += `> `;
    }

    return query;
};
