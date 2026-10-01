# RoadSense AI — System Architecture & Data Flow Specification

## 1. High-Level Mermaid Architecture

```mermaid
flowchart TD
    subgraph S1["1. High-Velocity Telemetry Ingestion Layer"]
        V["100,000 Connected Fleet Vehicles<br/>(OBD-II, CAN-bus, GPS, Accelerometer)"]
        S["Smartcar OEM Cloud API<br/>(Battery SoC, Odometer, Lock Status)"]
        T["TomTom Live Traffic API<br/>(16-City Indian Metro Incidents)"]
        W["OpenWeatherMap API<br/>(Real-Time Meteorological Telemetry)"]
    end

    subgraph S2["2. Validation & Deduplication Gateway"]
        IG["Fastify Ingestion Gateway"]
        VIN["ISO 3779 17-Char VIN Validator"]
        BF["Streaming Bloom Filter Deduplicator"]
        DTC["SAE J2019 Fault Code Parser"]
    end

    subgraph S3["3. High-Throughput Event Streaming"]
        K["Apache Kafka Multi-Partition Cluster"]
        T1[("Topic: vehicle.telemetry")]
        T2[("Topic: road.stress")]
        T3[("Topic: incident.alerts")]
    end

    subgraph S4["4. Real-Time Analytics Engines"]
        SE1["Sliding-Window Corridor Stress Engine"]
        SE2["Dijkstra EV Range & Charging Model"]
        SE3["Predictive DTC Mechanical Anomaly Engine"]
        SE4["Autonomous Incident Dispatch Triager"]
    end

    subgraph S5["5. Polyglot Persistence Layer"]
        R[("Redis 7.2 Cache<br/>(Sub-ms Hot Coordinates & Geohashes)")]
        TS[("TimescaleDB / Partitioned PG<br/>(100k events/sec TimeSeries)")]
        PG[("PostgreSQL 15 3NF Core<br/>(Fleets, Drivers, Trips, Audit Logs)")]
        PV[("pgvector Embeddings<br/>(Incident RAG & Semantic Context)")]
    end

    subgraph S6["6. Enterprise API & Agentic AI Controller"]
        FAP["Fastify REST & WebSocket API Gateway<br/>(Port 3001 · JWT & RBAC Protected)"]
        AI["Agentic AI Operations Controller<br/>(Qwen 2.5 72B / Llama 3.3 70B / Local Heuristic)"]
    end

    subgraph S7["7. Frontend Operations Command Cockpit"]
        UI1["Executive Overview & 16-City Weather Hub"]
        UI2["Incident Response Triage Grid & Table"]
        UI3["Fleet Telemetry & Deep Vehicle Inspection"]
        UI4["Geospatial Road Stress Heatmap (MapLibre)"]
        UI5["Universal Spotlight Search (Cmd+K)"]
        UI6["Grounded Operations AI Assistant Drawer"]
    end

    V --> IG
    S --> IG
    T --> IG
    W --> IG

    IG --> VIN
    VIN --> BF
    BF --> DTC
    DTC --> K

    K --> T1
    K --> T2
    K --> T3

    T1 --> SE1
    T1 --> SE2
    T1 --> SE3
    T3 --> SE4

    SE1 --> R
    SE2 --> TS
    SE3 --> PG
    SE4 --> PV

    R --> FAP
    TS --> FAP
    PG --> FAP
    PV --> AI

    FAP <-->|WebSocket Stream & REST| UI1
    FAP <-->|WebSocket Stream & REST| UI2
    FAP <-->|WebSocket Stream & REST| UI3
    FAP <-->|WebSocket Stream & REST| UI4
    FAP <-->|WebSocket Stream & REST| UI5
    AI <-->|Grounded Telemetry Context| UI6
```

## 2. Ingestion & Data Flow Sequence

1. **Ingestion & Validation:** Connected vehicles emit telemetry packets containing VIN, GPS coordinate, speed, engine temperature, State-of-Charge, and DTC diagnostic codes.
2. **De-duplication & Routing:** The Fastify Ingestion Gateway checks the packet VIN against ISO 3779 specifications, de-duplicates using a Streaming Bloom Filter ($O(k)$ bit operations), and pushes to Apache Kafka topic `vehicle.telemetry`.
3. **Real-Time Stream Processing:** Stream consumers compute rolling 5-minute corridor stress averages and detect harsh braking anomalies.
4. **Polyglot Persistence:** Current vehicle states are cached in Redis (`O(1)` geohash lookups); full historical events are written to TimescaleDB monthly partitions; relational metadata is stored in PostgreSQL 3NF core.
5. **Client Broadcast:** Fastify API streams live telemetry over WebSockets to the Next.js cockpit with sub-second latency.
