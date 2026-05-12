# bookStoreGraph

Basic NestJS starter wired with Fastify and Mercurius for GraphQL.

## Getting started

```bash
pnpm install
pnpm start:dev
```

## Available scripts

```bash
pnpm build
pnpm start:dev
pnpm start:debug
pnpm start
pnpm test
```

## GraphQL

- GraphQL endpoint: `http://localhost:3000/graphql`
- GraphiQL UI: `http://localhost:3000/graphiql`

Default environment variables:

- `PORT=3000`
- `GRAPHQL_PATH=/graphql`

The project currently includes a simple `healthCheck` query so you can confirm the setup is working before wiring in your own database layer and domain modules.
