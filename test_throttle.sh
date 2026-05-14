#!/bin/bash
for i in {1..10}; do
curl -s -X POST http://localhost:8080/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { books { totalCount } }"}' &
done
wait
