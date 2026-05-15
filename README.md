# Book Store Graph

A NestJS project implementing a GraphQL API for a book catalog as per the HOLYWATER TECH back-end developer test task. 
This project utilizes **NestJS**, **GraphQL (Mercurius + Fastify)**, and **PostgreSQL** via **TypeORM**.

## Features
- **GraphQL API** built securely with Fastify + Mercurius to manage Books, Authors, and Genres.
- **Relational Database** built with PostgreSQL using TypeORM.
- **Data Seeding** configured as a TypeORM migration to auto-populate 1000+ books and 5 authors with relationships.
- **Rate Limiting** implemented on the GraphQL endpoints via `@nestjs/throttler` (`GqlThrottlerGuard`).
- **Comprehensive Unit Testing** with over 30 tests covering resolvers, core services, and logic using Jest. 

---

## Project Setup

### Prerequisites
- Node.js (>= 18)
- pnpm or npm
- Docker & Docker Compose (for Postgres & Redis)

### 1. Installation

```bash
git clone https://github.com/olegustimchik/bookStoreGraph.git
cd bookStoreGraph
# Using pnpm is highly recommended
pnpm install
```

### 2. Environment Variables

Create a `.env` file in the root directory of the application mapping the exact configurations to your services. For example:

```env
# Database configuration
DATABASE_HOST="localhost"
DATABASE_PORT=5432
DATABASE_USERNAME="root"
DATABASE_PASSWORD="password"
DATABASE_NAME="db"
DATABASE_SYNCHRONIZE=false
DATABASE_LOGGING=true
DATABASE_MIGRATIONS_RUN=true

# Server
SERVER_PORT=8080
CLIENT_URL=http://localhost:8000
METHODS=GET,HEAD,PUT,PATCH,POST,DELETE
ORIGINS=*
NODE_ENV=development

# Redis configuration (For scaling & caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TTL=3600

# Throttler
THROTTLE_TTL=1000
THROTTLE_LIMIT=10
```

### 3. Set Up Postgres and Redis infrastructure

Start the required external services effortlessly utilizing Docker Compose:

```bash
docker-compose up -d
```

### 4. Database Migrations and Seeding

The requirements for database schema handling and 1000+ random data generation are handled via TypeORM migrations (such as `1778734540292-SeedInitialData.ts`). 

To generate your tables and insert the sample catalog data, run:

```bash
pnpm run mr
```
_Note: Because `DATABASE_MIGRATIONS_RUN=true` is used in the `.env` template, migrations and initial seed execution are automatically applied against the container DB during the first application boot startup._

---

## Running the Application

```bash
# Standard Launch
pnpm run start

# Auto-reloading watch mode for active development
pnpm run start:dev

# Prod build
pnpm run build && pnpm run start:prod
```

You can now interact with the instance on:
- **API Endpoint:** `http://localhost:8080/graphql`
- **GraphiQL Sandbox:** `http://localhost:8080/graphiql`

---

### Example GraphQL Queries

### Global Search Query
This API exposes flexible global searching techniques across multiple entities (Books, Authors, Genres) using the `search` query. It supports case-insensitive searching, partial matches, and robust filtering like genres and publication years.

```graphql
query GlobalSearch {
  search(
    search: {
      query: "Potter"
      filter: {
        genre: "Fantasy"
        publicationYear: {
          from: 1995
          to: 2015
        }
      }
    }
  ) {
    books {
      totalCount
      data {
        id
        title
        publicationDate
        author {
          id
          fullName
        }
        genres {
          id
          name
        }
      }
    }
    authors {
      totalCount
      data {
        id
        fullName
      }
    }
    genres {
      totalCount
      data {
        id
        name
      }
    }
  }
}
```

### Searching Authors

```graphql
query SearchAuthors {
  authors(query: "Rowling", limit: 5, offset: 0) {
    totalCount
    data {
      id
      fullName
      dateOfBirth
    }
  }
}
```

---

## Rate Limiting
Rate-limiting guards block excessively repeated querying hitting the underlying Postgres servers. 
It uses `@nestjs/throttler` via the local implementation mapping natively to the `FastifyRequest`.
Values inside `.env` define limits.

---

## Caching (Redis)
To optimize performance and minimize database load, the API integrates query-level caching using Redis.
- Complex resolving operations (Books, Authors, Genres) are intercepted and managed by a custom `CacheService`.
- A SHA-256 hash is generated dynamically from the paginated arguments to guarantee unique and scalable key lookups.
- Deserialization automatically parses ISO timestamp strings back into native `Date` payloads to cleanly respect the internal GraphQL layer processing.

---

## Testing Coverage

The solution utilizes Jest for testing Services, Repository mocking configurations, and application Resolvers ensuring full code validation paths passing successfully.

```bash
# Execute unit testing suite directly
pnpm run test

# Render the application coverage metric reporting
pnpm run test --coverage
```

---

## Authors & Resources

Template: **[link](https://github.com/dmytroPolhul/nestjs-boilerplate)**

Originating repository layout referenced/available over at:
 **[bookStoreGraph GitHub Link](https://github.com/olegustimchik/bookStoreGraph)**

