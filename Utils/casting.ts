/**
 * Mapping of type names to their type tags
 */
const TYPES: Record<string, string> = {
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
} as const;

/**
 * Checks if a string is a parameter (starts with $ and has no other $)
 * @param str - Input string to check
 * @returns True if valid parameter format
 */
const isParameter = (str: string): boolean =>
    str.startsWith("$") && str.split("$").length === 2;

/**
 * Validates ISO 8601 datetime format (YYYY-MM-DDTHH:MM:SSZ)
 * @param str - Date string to validate
 * @returns True if valid datetime format
 */
const isDateTime = (str: string): boolean =>
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(str);

/**
 * Validates record format (namespace:identifier with allowed characters)
 * @param str - String to validate
 * @returns True if valid record format
 */
const isRecord = (str: string): boolean =>
    /^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/.test(str);

/**
 * Converts various data types to boolean
 * @param data - Input data to convert
 * @returns Conversion result
 */
const convertToBoolean = (data: any): boolean => {
    if (data === 0 || data === "0" || data === false || data === "false")
        return false;
    if (data === 1 || data === "1" || data === true || data === "true")
        return true;
    if (typeof data === "string") return data.trim() !== "";
    if (Array.isArray(data)) return data.length > 0;
    if (typeof data === "object" && data !== null) return true;
    return Boolean(data);
};

/**
 * Converts input to integer with NaN protection
 * @param data - Input data to convert
 * @returns Integer value
 */
const convertToInt = (data: any): number => {
    const num = typeof data === "string" ? parseFloat(data) : Number(data);
    return Number.isNaN(num) ? 0 : Math.floor(num);
};

/**
 * Handles array conversion with optional type casting
 * @param data - Array to process
 * @param dataAs - Optional type for array elements
 * @returns Formatted array string
 */
const handleArray = (data: any[], dataAs?: string): string => {
    return `[${data
        .map((item) => casting(dataAs ? { data: item, as: dataAs } : item))
        .join(", ")}]`;
};

/**
 * Handles object conversion with recursive casting
 * @param obj - Object to process
 * @returns Formatted object string
 */
const handleObject = (obj: Record<string, any>): string => {
    return `{${Object.entries(obj)
        .map(
            ([key, value]) =>
                `${key}: ${
                    value.as
                        ? casting({ data: value.data, as: value.as })
                        : casting(value)
                }`
        )
        .join(", ")}}`;
};

/**
 * Main casting function that converts data to type-tagged strings
 * @param opt - Casting options or raw data
 * @returns Type-tagged string or "NONE" for invalid
 */
export const casting = (opt: any): string => {
    try {
        // Handle empty/null cases
        if (
            opt === null ||
            opt === undefined ||
            opt === "" ||
            opt === "NULL" ||
            (typeof opt === "object" &&
                opt !== null &&
                "data" in opt &&
                opt.data === null &&
                opt.as === "NONE")
        ) {
            return "NONE";
        }

        let asName: any;
        let dataInput: any;
        let dataAsInput: any;

        if (typeof opt === "object" && opt !== null && "as" in opt) {
            asName = opt.as;
            dataInput = opt.data;
            dataAsInput = opt.dataAs;
        } else {
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
                        let convertedValue: any = dataInput;

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

                        return `${TYPES[typeKey]}${convertedValue}`;
                    }
                    return "NONE";
                }
            }
        }

        if (Array.isArray(dataInput)) {
            return handleArray(dataInput, dataAsInput);
        }

        switch (typeof dataInput) {
            case "boolean":
                return `${TYPES.BOOLEAN}${dataInput}`;

            case "string":
                if (isParameter(dataInput)) return dataInput;
                if (isDateTime(dataInput))
                    return `${TYPES.DATETIME}${dataInput}`;
                if (isRecord(dataInput)) return `${TYPES.RECORD}${dataInput}`;
                return `${TYPES.STRING}${dataInput}`;

            case "number":
                return Number.isInteger(dataInput)
                    ? `${TYPES.INT}${dataInput}`
                    : `${TYPES.FLOAT}${dataInput}`;

            case "object":
                return handleObject(dataInput);

            default:
                return "NONE";
        }
    } catch (err) {
        console.error("Failed to cast:", err);
        return "NONE";
    }
};