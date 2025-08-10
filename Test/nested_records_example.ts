import Surreal from "surrealdb"
import { Surreality, DataTypes, Manager } from "../Surreality.js"

// Example interfaces
interface Profile {
    id?: string
    bio: string
    avatar?: string
}

interface Car {
    id?: string
    model: string
    year: number
    brand?: string
}

interface User {
    id?: string
    name: string
    email: string
    profile?: Profile
    cars?: Car[]
}

async function demonstrateNestedRecords() {
    // Connect to SurrealDB
    const surreal = new Manager("http://localhost:8080", "test", "test", "test", "test")

    await surreal.connect()

    const surreall = surreal.getSurreal()

    if (!surreall) {
        return
    }

    // Create ORM instances
    const userOrm = new Surreality<User>(surreall, "user")
    const profileOrm = new Surreality<Profile>(surreall, "profile")
    const carOrm = new Surreality<Car>(surreall, "car")

    try {
        // Define tables
        // await userOrm.defineTable("SCHEMAFULL", {
        //     creationMode: "IFNOTEXISTS",
        //     type: "NORMAL",
        //     permissions: { full: true },
        //     timestamps: true,
        // })

        // await profileOrm.defineTable("SCHEMAFULL", {
        //     creationMode: "IFNOTEXISTS",
        //     type: "NORMAL",
        //     permissions: { full: true },
        //     timestamps: true,
        // })

        // await carOrm.defineTable("SCHEMAFULL", {
        //     creationMode: "IFNOTEXISTS",
        //     type: "NORMAL",
        //     permissions: { full: true },
        //     timestamps: true,
        // })

        // // Define fields
        // await userOrm.defineField("id", "string", { optional: false, readonly: true })
        // await userOrm.defineField("name", "string")
        // await userOrm.defineField("email", "string")
        // await userOrm.defineField("profile", "record", { recordTable: "profile", optional: true })
        // await userOrm.defineField("cars", "array", {
        //     arrayValues: { type: "DATATYPE", value: "record" },
        //     recordTable: "car"
        // })

        // await profileOrm.defineField("id", "string", { optional: false, readonly: true })
        // await profileOrm.defineField("bio", "string")
        // await profileOrm.defineField("avatar", "string", { optional: true })

        // await carOrm.defineField("id", "string", { optional: false, readonly: true })
        // await carOrm.defineField("model", "string")
        // await carOrm.defineField("year", "int")
        // await carOrm.defineField("brand", "string", { optional: true })

        // // Set up record field mappings for nested creation
        // userOrm.setRecordFields({
        //     'profile': 'profile',
        //     'cars': 'car'
        // })

        // console.log("Creating user with nested records...")

        // // Create a user with nested objects - they'll be automatically created as records
        // const result = await userOrm.create({
        //     data: {
        //         name: "Alice Johnson",
        //         email: "alice@example.com",
        //         profile: {
        //             bio: "Full-stack developer passionate about TypeScript and SurrealDB",
        //             avatar: "https://example.com/avatar.jpg"
        //         },
        //         cars: [
        //             {
        //                 model: "Tesla Model 3",
        //                 year: 2023,
        //                 brand: "Tesla"
        //             },
        //             {
        //                 model: "BMW X5",
        //                 year: 2021,
        //                 brand: "BMW"
        //             }
        //         ]
        //     }
        // })

        // console.log("Created user with nested records:", result)

        // Query the created user to see the nested records
        const users = await userOrm.findAll({
            fields: ['id', 'name', 'email', 'profile', 'cars'],
            include: [
                {
                    model: "cars"
                }
            ]
            
        })

        console.log("Retrieved user with nested records:", JSON.stringify(users))

        // // Example: Create another user with mixed nested objects and existing IDs
        // const existingCarId = users ? users[0].cars[0].id : ""
        // const existingCar = users ? users[0].cars[2] : ""

        // const result2 = await userOrm.create({
        //     data: {
        //         name: "Bob Smith",
        //         email: "bob@example.com",
        //         profile: {
        //             id: users ? users[0].profile.id : "", // This will use the existing ID
        //             bio: "DevOps engineer",
        //             avatar: "https://example.com/bob.jpg",
        //         },
        //         cars: [
        //             {
        //                 model: "Audi A4",
        //                 year: 2022,
        //                 brand: "Audi",
        //             },
        //             existingCar,
        //             existingCarId as any, // This will use the string ID directly
        //         ],
        //     },
        // })

        // console.log("Created second user with mixed nested records:", result2)

    } catch (error) {
        console.error("Error:", error)
    }
    // Note: SurrealDB client doesn't have a disconnect method
    // The connection will be closed when the process ends
}

// Run the demonstration
demonstrateNestedRecords().catch(console.error) 