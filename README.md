# Transaction Handling Example

A demonstration of transactional vs non-transactional database operations using TypeORM, Express, and PostgreSQL.

## Setup

1. Install dependencies:

```
   npm install
```

2. Configure PostgreSQL connection in src/database.ts
3. Create database `transaction-test`
4. Start the app:

```
   npm start
```

## API Endpoints

### Non-Transactional Create

**POST** /user/non-transactional

Example curl:

```
curl -X POST http://localhost:3000/user/non-transactional \
 -H "Content-Type: application/json" \
 -d '{
"name": "John Doe",
"email": "john@example.com",
"bio": "Software Developer"
}'
```

### Transactional Create

**POST** /user/transactional

Example curl:

```
curl -X POST http://localhost:3000/user/transactional \
 -H "Content-Type: application/json" \
 -d '{
"name": "Jane Smith",
"email": "jane@example.com",
"bio": "Product Manager"
}'
```

> Note: Both endpoints currently throw test errors ("Throwing error in transaction" and "Throwing error in non-transactional") to demonstrate rollback behavior. These errors can be removed from UserController to test successful creation.

## Key Features

- Transaction wrapper with automatic rollback
- Dependency injection using tsyringe
- TypeORM for database operations
- Intentional errors to demonstrate transaction behavior



## Key Files

### Transaction Wrapper

`src/transaction-wrapper.ts` - Utility function for handling database transactions:

```typescript
import { IsolationLevel } from "typeorm/driver/types/IsolationLevel";
import { DataSource, QueryRunner } from "typeorm";

export async function withTransaction<T>(
  dataSource: DataSource,
  callback: (queryRunner: QueryRunner) => Promise<T>,
  isolationLevel: IsolationLevel = "READ COMMITTED"
): Promise<T> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction(isolationLevel);

  try {
    const result = await callback(queryRunner);
    await queryRunner.commitTransaction();
    return result;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

### User Service

`src/user/user.service.ts` - Service demonstrating transactional vs non-transactional operations:

```typescript
@injectable()
export class UserService {
  constructor(
    @inject("DataSource") private readonly dataSource: DataSource,
    private readonly profileService: ProfileService
  ) {}

  async createUserWithProfileNonTransactional(data: {
    name: string;
    email: string;
    bio: string;
  }) {
    let userId: number;
    try {
      const user = await this.createUser({ name: data.name, email: data.email });
      userId = user.id;

      throw new Error("Throwing error in non-transactional");

      const profile = await this.profileService.createProfile({
        userId: user.id,
        bio: data.bio,
      });

      return { user: { ...user, profile } };
    } catch (error) {
      const user = await this.getUserById(userId);
      throw {
        message: "Non-transactional operation failed",
        userCreated: user,
        originalError: error,
      };
    }
  }

  async createUserWithProfileTransactional(data: {
    name: string;
    email: string;
    bio: string;
  }) {
    let userId: number;
    try {
      const txResult = await withTransaction(
        this.dataSource,
        async (queryRunner) => {
          const user = await this.createUser(
            { name: data.name, email: data.email },
            queryRunner
          );
          userId = user.id;

          throw new Error("Throwing error in transaction");

          const profile = await this.profileService.createProfile(
            { userId: user.id, bio: data.bio },
            queryRunner
          );

          return { user, profile };
        }
      );

      return { user: { ...txResult.user, profile: txResult.profile } };
    } catch (error) {
      const user = await this.getUserById(userId);
      throw {
        message: "Transactional operation failed",
        userCreated: user,
        originalError: error,
      };
    }
  }
}
```

## Project Structure

- src/
  - entities/ - Database models
  - user/ - User services & controllers
  - profile/ - Profile services
  - transaction-wrapper.ts - Transaction utility
  - app.ts - Application entry
  - database.ts - DB config
  - ioc.ts - DI setup