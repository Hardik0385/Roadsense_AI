# ADR-001: Polyglot Persistence Strategy (Relational 3NF, Time-Series & Vector Storage)

## Status
Accepted

## Context
Connected vehicle platforms ingest massive streams of high-velocity time-series telemetry (~100,000 events/sec, ~8.6 TB/day) while simultaneously managing strictly transactional enterprise data (fleet subscriptions, billing, RBAC access control, driver assignments, and compliance audit logs). 

A single relational database fails at this scale due to B-tree write lock amplification, connection pool starvation, and analytical scan interference. Conversely, a pure NoSQL database lacks the ACID guarantees and referential integrity required for billing and tenant isolation.

## Decision
We adopt a **Polyglot Storage Architecture**:
1. **PostgreSQL 3NF Core (CP / ACID):** Handles tenants, fleets, vehicles, drivers, trips, subscriptions, and audit logs with strict referential integrity.
2. **TimescaleDB / Partitioned Range Tables (AP / Time-Series):** Daily/monthly partition tables on `vehicle_telemetry(vehicle_id, event_timestamp)` to ensure constant-time ingestion throughput without B-tree degradation.
3. **Redis (In-Memory Hot Layer):** Sub-millisecond retrieval of live vehicle states, geohash spatial indexes, and cached fleet KPIs.
4. **pgvector (Vector Storage):** 1536-dimensional embeddings for semantic incident retrieval and grounding the RoadSense AI agent.

## Consequences
- **Positive:** Ingestion throughput scales to 100,000+ events/sec; analytical scans do not impact transactional queries; API response p95 is under 20ms.
- **Negative:** Requires dual-write synchronization and eventual consistency handling between stream consumers and cache layers.
