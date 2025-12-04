import { Surreality } from "../Surreality.js";
import Surreal from "surrealdb";

// Your GroupI interface with union types
interface UserI {
    id: string;
    name: string;
}

interface GroupI {
    id: string;
    name: string;
    grade: number;
    teacher: string | UserI;
    scholars: string[] | UserI[];
}

// Create a Surreality instance with GroupI
const surreal = new Surreal();
const groupOrm = new Surreality<GroupI>(surreal, "group");

// Test case: This should work without type errors
async function testGroupQuery() {
    // Test 1: Include teacher
    const result1 = await groupOrm.findAll({
        include: [
            {
                model: "teacher",
                fields: ["id", "name"], 
            }
        ]
    });

    // Test 2: Include scholars
    const result2 = await groupOrm.findAll({
        include: [
            {
                model: "scholars",
                fields: ["id", "name"]
            }
        ]
    });

    // Test 3: Include both teacher and scholars
    const result3 = await groupOrm.findAll({
        include: [
            {
                model: "teacher",
                fields: ["id", "name"]
            },
            {
                model: "scholars",
                fields: ["id"]
            }
        ]
    });

    console.log("All tests passed!");
}
