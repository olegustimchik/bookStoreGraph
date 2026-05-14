curl -X POST http://localhost:8000/graphql \
-H "Content-Type: application/json" \
-d '{"query": "query { findAllGenres(offset: 0, limit: 10) { id name } }"}'
