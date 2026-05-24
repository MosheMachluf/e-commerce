# E-Commerce Microservices Platform

## Project Goal

Build a production-style E-Commerce backend platform using microservices architecture.

The system should demonstrate:

- Microservices
- Event-Driven Architecture
- Async communication
- Elasticsearch integration
- Queue-based synchronization
- API Gateway pattern
- Distributed systems concepts
- Clean architecture

This project is intended to be portfolio-level and suitable for senior backend/fullstack interviews.

---

# Tech Stack

## Backend

- Node.js
- NestJS
- Prisma ORM
- PostgreSQL

## Messaging

- RabbitMQ

## Search

- Elasticsearch

## Infrastructure

- Docker
- Docker Compose

---

# High-Level Architecture

The system will also include an IAM (Identity and Access Management) microservice that communicates internally using gRPC.

Responsibilities:

- Authentication
- Authorization
- JWT issuance and validation
- User identity verification
- Role and permission management
- Internal service-to-service auth validation

The IAM service will expose gRPC endpoints for internal communication between microservices.

---

```text
Client
   │
   ▼
API Gateway (NestJS)
   │
   ├──────────────► IAM Service (gRPC)
   │                     │
   │                     ▼
   │                 PostgreSQL
   │
   ├──────────────► Product Service
   │                     │
   │                     ▼
   │                PostgreSQL
   │                     │
   │                     ▼
   │               Publish Events
   │                     │
   ▼                     ▼
Search Service       RabbitMQ
   │                     │
   ▼                     ▼
Elasticsearch    Indexer Service
```

---

# Core Architecture Concepts

## API Gateway

The frontend should communicate only with the API Gateway.

Responsibilities:

- Request routing
- Authentication (future)
- Rate limiting (future)
- Aggregation
- Unified API entry point

---

## IAM Service

The IAM service is responsible for identity and access management.

Communication protocol:

- gRPC

Responsibilities:

- User registration
- Login
- JWT token generation
- Token validation
- Role management
- Permission checks
- Internal authentication for microservices

Suggested tables:

- users
- roles
- permissions
- refresh_tokens

Suggested future features:

- OAuth
- Google login
- Refresh token rotation
- API keys
- Service-to-service authentication

Example gRPC methods:

```proto
service AuthService {
  rpc ValidateToken(ValidateTokenRequest)
      returns (ValidateTokenResponse);

  rpc GetUserById(GetUserRequest)
      returns (UserResponse);
}
```

---

## Product Service

Responsibilities:

- Product CRUD
- PostgreSQL persistence
- Publishing events to RabbitMQ

Events:

- product.created
- product.updated
- product.deleted

---

## Indexer Service

Responsibilities:

- Consume RabbitMQ events
- Synchronize Elasticsearch index

This service listens to product events and updates Elasticsearch asynchronously.

---

## Search Service

Responsibilities:

- Query Elasticsearch
- Full-text search
- Filters
- Sorting
- Pagination

This service does NOT access PostgreSQL.

---

# Event-Driven Architecture

Instead of Product Service directly updating Elasticsearch:

```text
Product Service -> Elasticsearch
```

Use events:

```text
Product Service -> RabbitMQ -> Indexer Service -> Elasticsearch
```

Benefits:

- Loose coupling
- Scalability
- Fault tolerance
- Async processing
- Easier extensibility

---

# Eventual Consistency

PostgreSQL is the source of truth.

Elasticsearch is a search layer only.

Data synchronization is asynchronous.

Example flow:

```text
Save product to PostgreSQL
    ↓
Publish event to RabbitMQ
    ↓
Indexer Service consumes event
    ↓
Update Elasticsearch
```

Elasticsearch may update milliseconds later than PostgreSQL.

This is acceptable and expected.

---

# Project Structure

```text
ecommerce-system/
│
├── api-gateway/
├── product-service/
├── search-service/
├── indexer-service/
│
├── docker-compose.yml
└── libs/
```

---

# Infrastructure Setup

## Docker Compose

Services:

- PostgreSQL
- RabbitMQ
- Elasticsearch

Example docker-compose.yml:

```yaml
version: "3.9"

services:

  postgres:
    image: postgres:16
    container_name: postgres_db
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin
      POSTGRES_DB: products_db
    ports:
      - "5432:5432"

  rabbitmq:
    image: rabbitmq:3-management
    container_name: rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
    ports:
      - "9200:9200"
```

Run:

```bash
docker compose up -d
```

---

# PostgreSQL Schema

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Product {
  id          String   @id @default(uuid())
  title       String
  description String?
  price       Float
  currency    String   @default("ILS")
  brand       String?
  stock       Int      @default(0)
  isActive    Boolean  @default(true)

  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id])

  images      ProductImage[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Category {
  id       String   @id @default(uuid())
  name     String
  parentId String?

  products Product[]
}

model ProductImage {
  id        String  @id @default(uuid())
  url       String
  isMain    Boolean @default(false)

  productId String
  product   Product @relation(fields: [productId], references: [id])
}
```

---

# Product Service Setup

## Create NestJS App

```bash
nest new product-service
```

---

## Install Prisma

```bash
npm install prisma --save-dev
npm install @prisma/client

npx prisma init
```

---

## .env

```env
DATABASE_URL="postgresql://root:root@localhost:5432/ecommerce"
```

---

## Run Migration

```bash
npx prisma migrate dev --name init
```

---

# API Gateway Setup

## Create Gateway

```bash
nest new api-gateway
```

---

## Install HTTP Client

```bash
npm install @nestjs/axios axios
```

---

## Gateway Responsibilities

Example flow:

```text
Client -> API Gateway -> Product Service
```

Gateway forwards requests to internal services.

---

# RabbitMQ Integration Plan

## Product Created Event

Example payload:

```json
{
  "event": "product.created",
  "data": {
    "id": "uuid",
    "title": "iPhone 15",
    "price": 4500
  }
}
```

---

# Elasticsearch Plan

Index name:

```text
products
```

Document example:

```json
{
  "id": "uuid",
  "title": "iPhone 15",
  "description": "Apple smartphone",
  "price": 4000,
  "category": "phones",
  "brand": "Apple",
  "stock": 10
}
```

---

# Search Features

## Required

- Full-text search
- Filters
- Sorting
- Pagination

## Bonus

- Autocomplete
- Aggregations
- Ranking
- Suggestions

---

# gRPC Integration

The project will use gRPC for internal synchronous communication between services where high performance and typed contracts are important.

Primary usage:

- API Gateway ↔ IAM Service

Why gRPC:

- Fast binary protocol
- Strong typing with protobuf
- Better internal microservice communication
- Contract-based APIs
- Widely used in modern distributed systems

Suggested structure:

```text
libs/
  grpc/
    auth.proto
```

Example auth.proto:

```proto
syntax = "proto3";

package auth;

service AuthService {
  rpc ValidateToken (ValidateTokenRequest)
      returns (ValidateTokenResponse);
}

message ValidateTokenRequest {
  string token = 1;
}

message ValidateTokenResponse {
  bool valid = 1;
  string userId = 2;
  repeated string roles = 3;
}
```

---

# Future Improvements

## Reliability

- Retry mechanism
- Dead Letter Queue (DLQ)
- Reindex jobs

## Security

- JWT Authentication
- Role-based authorization

## Infrastructure

- Redis caching
- Kubernetes deployment
- CI/CD pipeline

## Observability

- Logging
- Metrics
- Distributed tracing

---

# Resume Description

Example:

```text
Built a production-style E-Commerce platform using microservices architecture with NestJS, PostgreSQL, RabbitMQ, and Elasticsearch.

Implemented asynchronous event-driven synchronization between services using RabbitMQ and background workers.

Developed full-text search capabilities with Elasticsearch, including filtering, sorting, and scalable indexing architecture.
```

