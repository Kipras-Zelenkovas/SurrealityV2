/**
 * Type testing file to validate the WithInclude type transformation
 */

import { WithInclude } from "../Interfaces/IncludeOption.js";

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

interface Class {
    id: string;
    scholars: string[] | ClassScholarI[];
    program: string | ClassProgramI;
}

// Test type transformations
type Test1 = WithInclude<ClassScholarI, {}>;
// Should be: ClassScholarI with scholar: string, program: string (no includes = primitives only)

type Test2 = WithInclude<ClassScholarI, { include: [{ model: 'scholar' }] }>;
// Should transform scholar: string | UserI => UserI
// Should transform program: string | ClassProgramI => string (not included)

type Test3 = WithInclude<ClassScholarI, { include: [{ model: 'scholar' }, { model: 'program' }] }>;
// Should transform both scholar and program to their object types

type Test4 = WithInclude<Class, {}>;
// Should be: Class with scholars: string[], program: string

type Test5 = WithInclude<Class, { include: [{ model: 'scholars' }] }>;
// Should be: Class with scholars: ClassScholarI[], program: string

// Test with actual values to see the resolved types
const test1: Test1 = {} as any;
const test1Scholar = test1.scholar; // This should be string
const test1Program = test1.program; // This should be string

const test2: Test2 = {} as any;
const test2Scholar = test2.scholar; // This should be UserI
const test2Program = test2.program; // This should be string

const test3: Test3 = {} as any;
const test3Scholar = test3.scholar; // This should be UserI
const test3Program = test3.program; // This should be ClassProgramI

const test4: Test4 = {} as any;
const test4Scholars = test4.scholars; // This should be string[]
const test4Program = test4.program; // This should be string

const test5: Test5 = {} as any;
const test5Scholars = test5.scholars; // This should be ClassScholarI[] (with relations as strings)
const test5Program = test5.program; // This should be string

export {};
