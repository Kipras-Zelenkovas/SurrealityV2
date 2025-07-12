# Surreality

**Type-safe, ergonomic ORM for [SurrealDB](https://surrealdb.com/) with full TypeScript support, autocompletion, and advanced query generation.**

[![npm version](https://img.shields.io/npm/v/surreality.svg)](https://www.npmjs.com/package/surreality)
[![license](https://img.shields.io/github/license/yourusername/surreality)](./LICENSE)

---

## Features

- **Type-safe CRUD**: All operations are autocompleted and checked against your TypeScript interfaces.
- **Recursive includes**: Query related models with full type safety.
- **Flexible query options**: Powerful `where`, `order`, `limit`, `offset`, and raw SurrealQL support.
- **Schema management**: Define tables and fields programmatically, including permissions and timestamps.
- **SurrealDB best practices**: Supports SCHEMAFULL/SCHEMALESS, relations, and SurrealDB-specific features.

---

## Installation

```bash
npm install surreality surrealdb
```

---

## Quick Start

### 1. Define Your Schema

```ts
interface Brand {
  id: string;
  name: string;
}

interface Car {
  id: string;
  brand: Brand;
}

interface User {
  id: string;
  name: string;
  surname: string;
  cars: Car[];
}
```

### 2. Connect and Initialize ORM

You can initialize the ORM using either a direct SurrealDB connection or via the `Manager` class.

**Option 1: Using Surreal directly**

```ts
import Surreal from 'surrealdb';
import { Surreality } from 'surreality';

const surreal = new Surreal();
// Provide authentication options as needed
await surreal.connect('http://localhost:8000', { });

const userOrm = new Surreality<User>(surreal, 'user');
```

**Option 2: Using Manager**

```ts
import { Manager } from './Manager';
import { Surreality } from 'surreality';

const manager = new Manager(
  "http://localhost:8000", // SurrealDB URL
  "my_namespace",          // Namespace
  "my_database",           // Database
  "username",              // Username
  "password"               // Password
);

await manager.connect();
const surreal = manager.getSurreal(); // Access the SurrealDB instance

const userOrm = new Surreality<User>(surreal, 'user');
```

### 3. Define Table and Fields

```ts
await userOrm.defineTable("SCHEMAFULL", {
  creationMode: "IFNOTEXISTS",
  type: "NORMAL",
  permissions: { full: true },
  timestamps: true,
});
await userOrm.defineField('id', 'string', { optional: false, readonly: true });
await userOrm.defineField('name', 'string');
await userOrm.defineField('surname', 'string');
await userOrm.defineField('cars', 'array', { 
  arrayValues: { type: 'DATATYPE', value: 'record', size: 5 },
  recordTable: 'car' 
});
await userOrm.defineField('profile', 'record', { recordTable: 'profile' });
```

### 4. CRUD Operations

#### Create

```ts
await userOrm.create({ data: { id: 'user:alice', name: 'Alice', surname: 'Smith', cars: [] } });
```

#### Read (Select)

```ts
const users = await userOrm.findAll({
  fields: ['id', 'name', 'surname', 'cars'],
  include: [
    {
      model: 'cars',
      fields: ['id'],
      include: [
        { model: 'brand', fields: ['id', 'name'] }
      ]
    }
  ],
  where: { surname: 'Smith' },
  order: ['-name'],
  limit: 10,
  offset: 0
});
```

#### Update

```ts
await userOrm.update({ id: 'user:alice', data: { surname: 'Johnson' } });
```

#### Delete

```ts
await userOrm.delete({ id: 'user:alice' });
```

---

## Using Manager.ts

The `Manager` class provides advanced control over your SurrealDB instance, including connecting, running raw queries, and managing namespaces, databases, users, and parameters. Use it for administrative or setup tasks that are outside the scope of model-level operations.

### Example

```ts
import { Manager } from './Manager';

// Create a manager instance (with default or custom connection options)
const manager = new Manager(
  "http://localhost:8000", // SurrealDB URL
  "my_namespace",          // Namespace
  "my_database",           // Database
  "username",              // Username
  "password"               // Password
);

// Connect to SurrealDB (default is database scope)
await manager.connect();

// Run a raw SurrealQL query
const result = await manager.query("SELECT * FROM user;");
console.log(result);

// (Optional) Create a new namespace or database
await manager.defineNamespace("new_namespace");
await manager.defineDatabase("new_database");
```

**Note:** The `Manager` class is intended for administrative and setup tasks. For regular CRUD operations on your data models, use the `Surreality` ORM class as shown above.

---

## API Overview

- **`defineTable(base, options)`**: Define a table with schema, permissions, relations, and timestamps.
- **`defineField(name, type, options)`**: Define a field with type, default, validation, permissions, etc.
- **`create(options)`**: Insert new records (CONTENT/SET syntax, raw SurrealQL supported).
- **`findAll(options)`**: Select multiple records with fields, includes, where, order, limit, offset, and raw SurrealQL.
- **`findOne(options)`**: Select a single record (returns first match or null).
- **`update(options)`**: Update records by id or where clause (CONTENT/SET syntax, raw SurrealQL supported).
- **`delete(options)`**: Delete records by id or where clause (raw SurrealQL supported).

See full method and option documentation in the code or [API Reference](./Surreality.ts).

---

## Advanced Features

- **Type-safe recursive includes** for relations (see `include` option in select).
- **Flexible `where`**: Autocompletes table fields, but allows any key for advanced SurrealDB queries.
- **Order by**: Use `order: 'field'`, `order: ['-field', 'other']` for ASC/DESC and multi-field ordering.
- **Timestamps**: Auto-create `createdAt`, `updatedAt`, `deletedAt` fields with one option.
- **Permissions**: Fine-grained table and field-level permissions.

---

## Testing

Run the included test suite:

```bash
npm test
```

---

## License

MIT © Prorox

---

## Contributing

Pull requests and issues welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) if available.

---

## Acknowledgements

- [SurrealDB](https://surrealdb.com/)
- Inspired by Sequelize, Prisma, and other modern ORMs.

--- 