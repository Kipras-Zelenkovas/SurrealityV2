/**
 * Mapping of type names to their type tags
 */
const TYPES = {
    ARRAY: "<array>",
    BOOLEAN: "<bool>",
    BYTES: "<bytes>",
    DATETIME: "<datetime>",
    DECIMAL: "<decimal>",
    DURATION: "<duration>",
    FLOAT: "<float>",
    INT: "<int>",
    NUMBER: "<number>",
    RECORD: "<record>",
    STRING: "<string>",
    UUID: "<uuid>",
};
/**
 * Checks if a string is a parameter (starts with $ and has no other $)
 * @param str - Input string to check
 * @returns True if valid parameter format
 */
const isParameter = (str) => str.startsWith("$") && str.split("$").length === 2;
/**
 * Validates ISO 8601 datetime format (YYYY-MM-DDTHH:MM:SSZ)
 * @param str - Date string to validate
 * @returns True if valid datetime format
 */
const isDateTime = (str) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(str);
/**
 * Validates record format (namespace:identifier with allowed characters)
 * @param str - String to validate
 * @returns True if valid record format
 */
const isRecord = (str) => /^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/.test(str);
/**
 * Converts various data types to boolean
 * @param data - Input data to convert
 * @returns Conversion result
 */
const convertToBoolean = (data) => {
    if (data === 0 || data === "0" || data === false || data === "false")
        return false;
    if (data === 1 || data === "1" || data === true || data === "true")
        return true;
    if (typeof data === "string")
        return data.trim() !== "";
    if (Array.isArray(data))
        return data.length > 0;
    if (typeof data === "object" && data !== null)
        return true;
    return Boolean(data);
};
/**
 * Converts input to integer with NaN protection
 * @param data - Input data to convert
 * @returns Integer value
 */
const convertToInt = (data) => {
    const num = typeof data === "string" ? parseFloat(data) : Number(data);
    return Number.isNaN(num) ? 0 : Math.floor(num);
};
/**
 * Handles array conversion with optional type casting
 * @param data - Array to process
 * @param dataAs - Optional type for array elements
 * @returns Formatted array string
 */
const handleArray = (data, dataAs) => {
    return `[${data
        .map((item) => casting(dataAs ? { data: item, as: dataAs } : item))
        .join(", ")}]`;
};
/**
 * Handles object conversion with recursive casting
 * @param obj - Object to process
 * @returns Formatted object string
 */
const handleObject = (obj) => {
    return `{${Object.entries(obj)
        .map(([key, value]) => `${key}: ${value.as
        ? casting({ data: value.data, as: value.as })
        : casting(value)}`)
        .join(", ")}}`;
};
import dayjs from "dayjs";
dayjs.extend(customParseFormat);
/**
 * Checks whether a value is a Dayjs object (duck-typed)
 */
const isDayjs = (v) => v && typeof v === 'object' && typeof v.toDate === 'function' && typeof v.format === 'function';
/**
 * Main casting function that converts data to type-tagged strings
 * Accepts Dayjs objects (will be serialized to ISO strings) and handles recursive structures.
 * @param opt - Casting options or raw data
 * @returns Type-tagged string or "NONE" for invalid
 */
export const casting = (opt) => {
    try {
        // Handle empty/null cases
        if (opt === null ||
            opt === undefined ||
            opt === "" ||
            opt === "NULL" ||
            (typeof opt === "object" &&
                opt !== null &&
                "data" in opt &&
                opt.data === null &&
                opt.as === "NONE")) {
            return "NONE";
        }
        let asName;
        let dataInput;
        let dataAsInput;
        if (typeof opt === "object" && opt !== null && "as" in opt) {
            asName = opt.as;
            dataInput = opt.data;
            dataAsInput = opt.dataAs;
        }
        else {
            asName = undefined;
            dataInput = opt;
            dataAsInput = undefined;
        }
        if (dataInput === undefined) {
            return "NONE";
        }
        if (asName) {
            const normalizedAs = asName.toLowerCase();
            switch (normalizedAs) {
                case "array":
                    if (!Array.isArray(dataInput)) {
                        return "NONE";
                    }
                    return handleArray(dataInput, dataAsInput);
                case "object":
                    if (typeof dataInput !== "object" || dataInput === null) {
                        return "NONE";
                    }
                    return handleObject(dataInput);
                case "bool":
                    const convertedValue = convertToBoolean(dataInput);
                    return `${TYPES.BOOLEAN}${convertedValue}`;
                default: {
                    const typeKey = normalizedAs.toUpperCase();
                    if (TYPES[typeKey]) {
                        let convertedValue = dataInput;
                        switch (normalizedAs) {
                            case "int":
                                convertedValue = convertToInt(dataInput);
                                break;
                            case "float":
                                convertedValue = parseFloat(dataInput) || 0;
                                break;
                            case "number":
                                convertedValue = Number(dataInput) || 0;
                                break;
                        }
                        return `${TYPES[typeKey]}"${convertedValue}"`;
                    }
                    return "NONE";
                }
            }
        }
        if (isDayjs(dataInput)) {
            // Serialize Dayjs to ISO with milliseconds and Z
            return `${TYPES.DATETIME}\"${dataInput.toISOString()}\"`;
        }
        if (Array.isArray(dataInput)) {
            return handleArray(dataInput, dataAsInput);
        }
        if (isRecord(dataInput)) {
            return `${TYPES.RECORD}${dataInput}`;
        }
        switch (typeof dataInput) {
            case "boolean":
                return `${TYPES.BOOLEAN}${dataInput}`;
            case "string":
                if (isParameter(dataInput))
                    return dataInput;
                if (isDateTime(dataInput))
                    return `${TYPES.DATETIME}"${dataInput}"`;
                if (isRecord(dataInput))
                    return `${TYPES.RECORD}${dataInput}`;
                return `${TYPES.STRING}"${dataInput}"`;
            case "number":
                return Number.isInteger(dataInput) ? `${TYPES.INT}${dataInput}` : `${TYPES.FLOAT}${dataInput}`;
            case "object":
                return handleObject(dataInput);
            default:
                return "NONE";
        }
    }
    catch (err) {
        console.error("Failed to cast:", err);
        return "NONE";
    }
};
/**
 * Recursively traverse a value and convert SurrealDB datetime tagged values or ISO strings to Dayjs objects.
 * Accepts: strings matching ISO pattern or objects that contain datetime fields.
 */
import customParseFormat from 'dayjs/plugin/customParseFormat';
/**
 * Checks if a value is a valid date/time string (not a plain number)
 */
const isDateTimeString = (value) => {
    if (typeof value !== 'string' || value.trim() === '') {
        return false;
    }
    // Reject strings that are purely numeric (to avoid treating numbers as timestamps)
    if (/^\d+$/.test(value.trim())) {
        return false;
    }
    // Common date/time formats to check
    const formats = [
        'YYYY-MM-DD',
        'YYYY-MM-DDTHH:mm:ss',
        'YYYY-MM-DDTHH:mm:ss.SSS',
        'YYYY-MM-DDTHH:mm:ss.SSSZ',
        'YYYY-MM-DD HH:mm:ss',
        'MM/DD/YYYY',
        'DD/MM/YYYY',
    ];
    // Check with strict parsing
    if (dayjs(value, formats, true).isValid()) {
        return true;
    }
    // Check if it's a valid ISO string (with timezone)
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    if (isoRegex.test(value)) {
        return dayjs(value).isValid();
    }
    return false;
};
export const parseDatesToDayjs = (value) => {
    if (value === null || value === undefined) {
        return value;
    }
    if (dayjs.isDayjs(value)) {
        return value;
    }
    // Only convert strings that look like dates
    if (typeof value === 'string' && isDateTimeString(value)) {
        return dayjs(value);
    }
    if (Array.isArray(value)) {
        return value.map(v => parseDatesToDayjs(v));
    }
    if (typeof value === 'object' && !(value instanceof Date)) {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            out[k] = parseDatesToDayjs(v);
        }
        return out;
    }
    return value;
};
export const idConvertionToString = (value) => {
    if (value === null || value === undefined) {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map(v => idConvertionToString(v));
    }
    if (typeof value === "object" && 'tb' in value && 'id' in value) {
        return value.tb + ':' + value.id;
    }
    else if (typeof value === "object") {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            out[k] = idConvertionToString(v);
        }
        return out;
    }
    return value;
};
