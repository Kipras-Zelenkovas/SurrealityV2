/**
 * Example demonstrating dynamic return types based on include option
 */

// Example interfaces
interface UserI {
    id: string;
    name: string;
    email: string;
}

interface ClassProgramI {
    id: string;
    name: string;
    duration: number;
}

interface ClassScholarI {
    id: string;
    scholar: string | UserI;
    program: string | ClassProgramI;
    medicalInformation: string | null;
    description: string | null;
}

// Example usage (for demonstration - these won't run without SurrealDB connection)
import { Surreality } from "../Surreality.js";

async function exampleUsage() {
    const scholarOrm = {} as Surreality<ClassScholarI>;

    // Example 1: Without include - relations resolve to strings
    const scholars1 = await scholarOrm.findAll({
        fields: ['id', 'scholar', 'program']
    });
    // Type: ClassScholarI[] | null | ErrorResponse
    // scholar: string (no include = primitive type)
    // program: string (no include = primitive type)
    if (scholars1 && !('error' in scholars1)) {
        scholars1.forEach(s => {
            const scholarId = s.scholar; // Type: string
            const programId = s.program; // Type: string
        });
    }

    // Example 2: With include for 'scholar' - scholar becomes UserI
    const scholars2 = await scholarOrm.findAll({
        include: [{ model: 'scholar' }] as const
    });
    // Type: (ClassScholarI with scholar: UserI)[] | null | ErrorResponse
    // scholar: UserI (resolved!)
    // program: string (not included, resolves to primitive)
    if (scholars2 && !('error' in scholars2)) {
        scholars2.forEach(s => {
            // s.scholar is now UserI
            const userName = s.scholar.name; // ✓ Type-safe!
            // s.program is string (not included)
            const programId = s.program; // Type: string
        });
    }

    // Example 3: With include for both relations - both become resolved
    const scholars3 = await scholarOrm.findAll({
        include: [
            { model: 'scholar', fields: ['id', 'name', 'email'] },
            { model: 'program', fields: ['id', 'name'] }
        ] as const
    });
    // Type: (ClassScholarI with scholar: UserI, program: ClassProgramI)[] | null | ErrorResponse
    // scholar: UserI (resolved!)
    // program: ClassProgramI (resolved!)
    if (scholars3 && !('error' in scholars3)) {
        scholars3.forEach(s => {
            // Both relations are now fully resolved
            const userName = s.scholar.name; // ✓ Type-safe!
            const programName = s.program.name; // ✓ Type-safe!
        });
    }

    // Example 4: findOne with include
    const scholar = await scholarOrm.findOne({
        where: { id: 'scholar:1' },
        include: [{ model: 'scholar' }] as const
    });
    // Type: (ClassScholarI with scholar: UserI) | null | ErrorResponse
    if (scholar && !('error' in scholar)) {
        // scholar.scholar is UserI
        const userName = scholar.scholar.name; // ✓ Type-safe!
    }

    // Example 5: Nested includes (if UserI had relations)
    // const scholars4 = await scholarOrm.findAll({
    //     include: [
    //         {
    //             model: 'scholar',
    //             include: [
    //                 { model: 'address' } // If UserI had an address relation
    //             ]
    //         }
    //     ]
    // });
}

export { exampleUsage };
