# ADR-002: Event Streaming, Back-Pressure and Idempotency Strategy

## Status
Accepted

## Context
During shift starts, cellular dead-zone exits, and network reconnects, connected vehicle telemetry bursts at up to 3x normal velocity (300,000 events/sec). Telemetry events may arrive out of order, duplicated, or delayed.

## Decision
1. **Partitioned Apache Kafka Stream:** Telemetry events are partitioned by `vehicle_id` ensuring sequential ordering per vehicle while horizontally distributing loads across Kafka brokers.
2. **Streaming Bloom Filter & Idempotency Key:** Every event carries a unique `idempotency_key` and monotonic `sequence_number`. An in-memory dual-hash Streaming Bloom Filter rejects duplicates with sub-millisecond overhead.
3. **Consumer Back-Pressure Regulation:** Stream consumers monitor database buffer queue depths and dynamically adjust poll batch sizes (`max.poll.records`) to prevent downstream memory exhaustion.

## Consequences
- **Positive:** Guarantees zero dropped packets during 3x load bursts and achieves exactly-once processing semantics at downstream persistence layers.
- **Negative:** Requires stateful deduplication buffers and offset tracking in consumer groups.
