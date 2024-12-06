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

## Project Structure

- src/
  - entities/ - Database models
  - user/ - User services & controllers
  - profile/ - Profile services
  - transaction-wrapper.ts - Transaction utility
  - app.ts - Application entry
  - database.ts - DB config
  - ioc.ts - DI setup
