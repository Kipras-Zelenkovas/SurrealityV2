// import { toSurrealqlString } from "surrealdb";
import { Manager } from "../dist/Manager.js"
import { Surreality } from "../dist/Surreality.js"
import { DataTypes } from "../dist/Utils/DataTypes.js"
// import { casting } from "../Utils/casting.js";

//Initializing SurrealDB manager
const surreal = new Manager("http://localhost:8080", "test", "test", "test", "test")

await surreal.connect()

const User = new Surreality(surreal, "user")

await User.defineTable("SCHEMALESS", {
    type: "NORMAL",
    permissions: { full: true },
    timestamps: true,
    creationMode: "IFNOTEXISTS",
})

User.update({
    data: {
        name: "Pijus",
        surname: "Kamarauskas",
        email: "pijuskinas@gmail.com",
    },
    id: "user:kldbfd0cpsrmk6gkxl80",
})

// await User.defineField("name", DataTypes.STRING, {
//     assertExpr: "string::len($value) > 0",
//     creationMode: "IFNOTEXISTS",
// })
// await User.defineField("surname", DataTypes.STRING, {
//     assertExpr: "string::len($value) > 0",
//     creationMode: "IFNOTEXISTS",
// })
// await User.defineField("email", DataTypes.STRING, {
//     assertExpr: "string::is::email($value)",
//     creationMode: "IFNOTEXISTS",
// })
// await User.defineField("password", DataTypes.STRING, {
//     creationMode: "IFNOTEXISTS",
// })

// surreal.query(`DEFINE INDEX IF NOT EXISTS userEmailIndex ON TABLE user COLUMNS email UNIQUE;`)

// Test.defineTable("SCHEMAFULL", {
//     type: "ANY",
// });

// await surreal.defineDatabase("Testas")

// await surreal.defineParam(
//     "KazkasKito",
//     ["2025-02-07T12:54:54.761Z", { test: 53.2, "wet": 634643.412 }, 11111, "4324"],
//     {
//         overwrite: true,
//     }
// );

// console.log(
//     casting([
//         314,
//         "fafas",
//         { test: "test" },
//         23.42,
//         "2024_06-06T12:00:00Z",
//     ])
// );

// Test cases for casting function
// const testCases = [
//     // Null/undefined/empty cases
//     { input: null, expected: "NONE" },
//     { input: undefined, expected: "NONE" },
//     { input: "", expected: "NONE" },
//     { input: "NULL", expected: "NONE" },
//     { input: { data: null, as: "NONE" }, expected: "NONE" },

//     // Boolean cases
//     { input: true, expected: "<bool>true" },
//     { input: false, expected: "<bool>false" },
//     { input: { data: "true", as: "bool" }, expected: "<bool>true" },
//     { input: { data: "false", as: "bool" }, expected: "<bool>true" }, // Non-empty string is true
//     { input: { data: 0, as: "bool" }, expected: "<bool>false" },
//     { input: { data: 1, as: "bool" }, expected: "<bool>true" },
//     { input: { data: [], as: "bool" }, expected: "<bool>false" },
//     { input: { data: [1, 2], as: "bool" }, expected: "<bool>true" },

//     // Integer cases
//     { input: 42, expected: "<int>42" },
//     { input: { data: "42", as: "int" }, expected: "<int>42" },
//     { input: { data: "42.5", as: "int" }, expected: "<int>42" },
//     { input: { data: "abc", as: "int" }, expected: "<int>0" }, // Invalid number defaults to 0
//     { input: { data: true, as: "int" }, expected: "<int>1" },

//     // Float cases
//     { input: 42.5, expected: "<float>42.5" },
//     { input: { data: "42.5", as: "float" }, expected: "<float>42.5" },
//     { input: { data: "abc", as: "float" }, expected: "<float>0" }, // Invalid number defaults to 0

//     // Number cases
//     { input: { data: "42", as: "number" }, expected: "<number>42" },
//     { input: { data: "42.5", as: "number" }, expected: "<number>42.5" },
//     { input: { data: "abc", as: "number" }, expected: "<number>0" }, // Invalid number defaults to 0

//     // String cases
//     { input: "hello", expected: "<string>hello" },
//     { input: { data: "hello", as: "string" }, expected: "<string>hello" },
//     { input: { data: 42, as: "string" }, expected: "<string>42" },

//     // Parameter cases
//     { input: "$param", expected: "$param" },
//     { input: { data: "$param", as: "string" }, expected: "$param" },

//     // DateTime cases
//     { input: "2023-10-01T12:34:56Z", expected: "<datetime>2023-10-01T12:34:56Z" },
//     { input: { data: "2023-10-01T12:34:56Z", as: "datetime" }, expected: "<datetime>2023-10-01T12:34:56Z" },
//     { input: { data: "invalid-date", as: "datetime" }, expected: "<string>invalid-date" }, // Invalid datetime falls back to string

//     // Record cases
//     { input: "namespace:identifier", expected: "<record>namespace:identifier" },
//     { input: { data: "namespace:identifier", as: "record" }, expected: "<record>namespace:identifier" },
//     { input: { data: "invalid-record", as: "record" }, expected: "<string>invalid-record" }, // Invalid record falls back to string

//     // Array cases
//     { input: [1, 2, 3], expected: "[<int>1, <int>2, <int>3]" },
//     { input: { data: [1, 2, 3], as: "array" }, expected: "[<int>1, <int>2, <int>3]" },
//     { input: { data: ["a", "b", "c"], as: "array" }, expected: "[<string>a, <string>b, <string>c]" },
//     { input: { data: [1, "two", true], as: "array" }, expected: "[<int>1, <string>two, <bool>true]" },
//     { input: { data: [1, 2, 3], as: "array", dataAs: "float" }, expected: "[<float>1, <float>2, <float>3]" },

//     // Object cases
//     { input: { key: "value" }, expected: "{key: <string>value}" },
//     { input: { data: { key: "value" }, as: "object" }, expected: "{key: <string>value}" },
//     { input: { data: { key: { data: 42, as: "int" } }, as: "object" }, expected: "{key: <int>42}" },
//     { input: { data: { key1: "value1", key2: { data: 42, as: "float" } }, as: "object" }, expected: "{key1: <string>value1, key2: <float>42}" },

//     // Edge cases
//     { input: { data: "invalid", as: "unknown-type" }, expected: "NONE" }, // Unknown type
//     { input: { data: "invalid", as: "nonexistent" }, expected: "NONE" }, // Nonexistent type
//     { input: { data: "invalid", as: "" }, expected: "NONE" }, // Empty type
//     { input: { data: "invalid", as: null }, expected: "NONE" }, // Null type
//     { input: { data: "invalid", as: undefined }, expected: "NONE" }, // Undefined type
// ];

// // Run tests
// testCases.forEach(({ input, expected }, index) => {
//     const result = casting(input);
//     console.log(`Test ${index + 1}:`, result === expected ? "PASS" : "FAIL", {
//         input,
//         expected,
//         result,
//     });
// });

// console.log(
//     casting({
//         test: [412, "test", "2025-02-07T12:54:54.761Z"],
//         "Kazkas": 42.12
//     })
// );
// await surreal.use({namespace: "surreality"});

// console.log(await surreal.getInfo("NAMESPACE"))

// await surreal.use({ namespace: "surrealityV2" });

// console.log(await surreal.getInfo("NAMESPACE"));

// await surreal.use({database: "surrealityV2.1"});

// console.log(await surreal.getInfo("DATABASE"))

// await surreal.use({ database: "surrealityV2.2" });

// console.log(await surreal.getInfo("DATABASE"));

// await surreal.use("surrealityV2", "surrealityV2.1")

// await surreal.defineUser("DATABASE", "OWNER", "Kazkas", "Kazkas")

// await surreal.use("surreality", "surreality");

// await surreal.defineUser("DATABASE", "OWNER", "Kazkas", "Kazkas", {time: 12, unit: "m"});

// console.log(casting(35));

// auth: {
//     username: this.config.username,
//     password: this.config.password,
//     namespace: this.config.nameSpace,
//     database: this.config.database,
// }

//Connection check
// test("Check default connection to database", () => {
//     expect(surrealD.connect()).resolves.toBe(undefined);
// });

// test("Check only Surreal connection", () => {
//     expect(surrealS.connectSurreal()).resolves.toBe(undefined);
// });

// test("Check only Namespace connection", () => {
//     expect(surrealNS.connectNS()).resolves.toBe(undefined);
// });

// test("Check only Database connection", () => {
//     expect(surrealDB.connectSurreal()).resolves.toBe(undefined);
// });

// await surrealD.connect();

// test("Retrieve information of Root", () => {
//     expect(surrealD.infoRoot()).resolves.toBe(undefined);
// });

// test("Retrieve information for Namespace", () => {
//     expect(surrealD.infoNS()).resolves.toBe(undefined);
// });

// test("Retrieve information for Database", () => {
//     expect(surrealDB.infoDB()).resolves.toBe(undefined);
// });
// await surrealNS.connectNS();
// await surrealDB.connectDB();

// surrealD.infoDB();

// "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
