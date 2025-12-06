/**
 * Practical example: Using dynamic return types with ClassScholar
 * 
 * This example shows real-world usage patterns for querying scholars
 * with different levels of relation inclusion.
 */

import { Surreality } from "../Surreality.js";

// Define your interfaces
interface UserI {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
}

interface ClassProgramI {
    id: string;
    name: string;
    duration: number;
    startDate: Date;
    endDate: Date;
}

interface ClassScholarI {
    id: string;
    scholar: string | UserI;
    program: string | ClassProgramI;
    medicalInformation: string | null;
    description: string | null;
}

interface Class {
    id: string;
    scholars: string[] | ClassScholarI[];
    program: string | ClassProgramI;
    startDate: Date;
}

// Initialize ORM (in real code, you'd connect to SurrealDB first)
declare const scholarOrm: Surreality<ClassScholarI>;
declare const classOrm: Surreality<Class>;

/**
 * Example 1: List view - Only need IDs
 * No includes needed, just get the basic information
 */
async function getScholarsList() {
    const scholars = await scholarOrm.findAll({
        fields: ['id', 'scholar', 'program'],
        limit: 100
    });

    if (scholars && !('error' in scholars)) {
        return scholars.map(s => ({
            id: s.id,
            scholarId: s.scholar, // Type: string (no include = primitive type)
            programId: s.program  // Type: string (no include = primitive type)
        }));
    }
    return [];
}

/**
 * Example 2: Scholar details with user info
 * Include the scholar relation to get user details
 */
async function getScholarWithUserInfo(scholarId: string) {
    const scholar = await scholarOrm.findOne({
        where: { id: scholarId },
        include: [{ 
            model: 'scholar',
            fields: ['id', 'name', 'email', 'role']
        }] as const
    });

    if (scholar && !('error' in scholar)) {
        // TypeScript knows scholar.scholar is UserI now!
        return {
            id: scholar.id,
            userName: scholar.scholar.name,        // ✓ Type-safe
            userEmail: scholar.scholar.email,      // ✓ Type-safe
            userRole: scholar.scholar.role,        // ✓ Type-safe
            medicalInfo: scholar.medicalInformation,
            programId: scholar.program // Type: string (not included)
        };
    }
    return null;
}

/**
 * Example 3: Full scholar details with both relations
 * Include both scholar and program for complete information
 */
async function getFullScholarDetails(scholarId: string) {
    const scholar = await scholarOrm.findOne({
        where: { id: scholarId },
        include: [
            { model: 'scholar', fields: ['id', 'name', 'email', 'role'] },
            { model: 'program', fields: ['id', 'name', 'duration', 'startDate', 'endDate'] }
        ] as const
    });

    if (scholar && !('error' in scholar)) {
        // Both relations are fully resolved!
        return {
            scholarInfo: {
                id: scholar.id,
                medicalInfo: scholar.medicalInformation,
                description: scholar.description
            },
            user: {
                id: scholar.scholar.id,
                name: scholar.scholar.name,          // ✓ Type-safe
                email: scholar.scholar.email,        // ✓ Type-safe
                role: scholar.scholar.role           // ✓ Type-safe
            },
            program: {
                id: scholar.program.id,
                name: scholar.program.name,          // ✓ Type-safe
                duration: scholar.program.duration,  // ✓ Type-safe
                startDate: scholar.program.startDate, // ✓ Type-safe
                endDate: scholar.program.endDate     // ✓ Type-safe
            }
        };
    }
    return null;
}

/**
 * Example 4: Filter scholars by program with user details
 * Find all scholars in a specific program, including user info
 */
async function getScholarsByProgram(programId: string) {
    const scholars = await scholarOrm.findAll({
        where: { program: programId },
        include: [{ 
            model: 'scholar',
            fields: ['id', 'name', 'email']
        }] as const,
        order: ['id']
    });

    if (scholars && !('error' in scholars)) {
        return scholars.map(s => ({
            id: s.id,
            userName: s.scholar.name,    // ✓ Type-safe
            userEmail: s.scholar.email,  // ✓ Type-safe
            programId: s.program         // Type: string (not included)
        }));
    }
    return [];
}

/**
 * Example 5: Advanced filtering with includes
 * Get scholars with medical information, including full program details
 */
async function getScholarsWithMedicalInfo() {
    const scholars = await scholarOrm.findAll({
        where: { medicalInformation: null },
        operator: '!=',
        include: [{ 
            model: 'program',
            fields: ['id', 'name', 'duration']
        }] as const,
        fields: ['id', 'scholar', 'program', 'medicalInformation']
    });

    if (scholars && !('error' in scholars)) {
        return scholars.map(s => ({
            id: s.id,
            scholarId: s.scholar,               // Type: string (not included)
            programName: s.program.name,        // ✓ Type-safe
            programDuration: s.program.duration, // ✓ Type-safe
            medicalInfo: s.medicalInformation
        }));
    }
    return [];
}

async function getUsersInfoClass() {
    const classes = await classOrm.findAll({
        include: [{
            model: 'scholars',
            include: [{ model: 'scholar' }] as const
        }] as const
    });

    if (classes && !('error' in classes)) {
        return classes.map(c => ({
            classId: c.id,
            scholarIds: c.scholars.map(s => s.scholar.id), // ✓ Type-safe! scholar is UserI
            programIds: c.scholars.map(s => s.program)  // Type: string (program not included)
        }));
    }
    return [];
}

export {
    getScholarsList,
    getScholarWithUserInfo,
    getFullScholarDetails,
    getScholarsByProgram,
    getScholarsWithMedicalInfo,
    getUsersInfoClass
};
