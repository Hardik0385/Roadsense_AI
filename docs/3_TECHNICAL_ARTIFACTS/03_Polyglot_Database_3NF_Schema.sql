-- ==============================================================================
-- RoadSense AI: Enterprise Connected Vehicle Intelligence Database Schema
-- Architecture: 3NF Relational Core + TimescaleDB Partitioning + pgvector Storage
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "vector"; -- Vector embeddings for AI retrieval

-- ------------------------------------------------------------------------------
-- 1. 3NF Relational Core (ACID, Tenant Isolation, Subscriptions & Fleets)
-- ------------------------------------------------------------------------------

-- Tenants (Fleet owners, Rental enterprises, OEMs)
CREATE TABLE tenants (
    tenant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(50) NOT NULL DEFAULT 'ENTERPRISE', -- ENTERPRISE, PRO, STANDARD
    max_vehicles INT NOT NULL DEFAULT 100000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fleets
CREATE TABLE fleets (
    fleet_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    operating_region VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drivers
CREATE TABLE drivers (
    driver_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(50),
    safety_score INT NOT NULL DEFAULT 100 CHECK (safety_score BETWEEN 0 AND 100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vehicles (17-char VIN 3NF definition)
CREATE TABLE vehicles (
    vehicle_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fleet_id UUID NOT NULL REFERENCES fleets(fleet_id) ON DELETE RESTRICT,
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    vin CHAR(17) NOT NULL UNIQUE,
    license_plate VARCHAR(30) NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    model_year INT NOT NULL,
    powertrain_type VARCHAR(30) NOT NULL DEFAULT 'EV', -- EV, ICE, HYBRID, PHEV
    battery_capacity_kwh NUMERIC(6,2),
    assigned_driver_id UUID REFERENCES drivers(driver_id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    smartcar_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trips
CREATE TABLE trips (
    trip_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(driver_id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    start_odometer_km NUMERIC(10,2) NOT NULL,
    end_odometer_km NUMERIC(10,2),
    distance_km NUMERIC(8,2) GENERATED ALWAYS AS (end_odometer_km - start_odometer_km) STORED,
    energy_consumed_kwh NUMERIC(8,2),
    harsh_braking_events INT NOT NULL DEFAULT 0,
    overspeed_duration_secs INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. Time-Series Partitioned Telemetry (High-Velocity Ingest: 100k events/sec)
-- ------------------------------------------------------------------------------

CREATE TABLE vehicle_telemetry (
    event_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    event_timestamp TIMESTAMPTZ NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    speed_kmh NUMERIC(5,2) NOT NULL,
    acceleration_mps2 NUMERIC(5,2) NOT NULL,
    engine_temp_celsius NUMERIC(5,2),
    battery_soc_pct NUMERIC(5,2),
    battery_soh_pct NUMERIC(5,2),
    dtc_fault_codes TEXT[], -- Array of OBD-II Diagnostic Trouble Codes
    road_stress_score INT CHECK (road_stress_score BETWEEN 0 AND 100),
    is_anomaly BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (vehicle_id, event_timestamp)
) PARTITION BY RANGE (event_timestamp);

-- Monthly partitions example
CREATE TABLE vehicle_telemetry_2026_10 PARTITION OF vehicle_telemetry
    FOR VALUES FROM ('2026-10-01 00:00:00+00') TO ('2026-11-01 00:00:00+00');

-- High-performance composite & partial indexes
CREATE INDEX idx_telemetry_time_speed ON vehicle_telemetry (event_timestamp DESC, speed_kmh);
CREATE INDEX idx_telemetry_critical_anomalies ON vehicle_telemetry (vehicle_id, event_timestamp DESC) WHERE is_anomaly = TRUE;
CREATE INDEX idx_telemetry_geospatial ON vehicle_telemetry USING gist (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));

-- ------------------------------------------------------------------------------
-- 3. Incident Response Triage & Vector Embeddings Layer
-- ------------------------------------------------------------------------------

CREATE TABLE road_incidents (
    incident_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    corridor_name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- ACCIDENT, ROADWORKS, CLOSURE, JAM
    severity VARCHAR(30) NOT NULL, -- CRITICAL, HIGH, MEDIUM, LOW
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    delay_seconds INT NOT NULL DEFAULT 0,
    impacted_vehicles_count INT NOT NULL DEFAULT 0,
    dispatched_unit_id VARCHAR(100),
    dispatch_status VARCHAR(50) NOT NULL DEFAULT 'UNASSIGNED',
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    embedding vector(1536) -- pgvector semantic representation for AI RAG
);

CREATE INDEX idx_incidents_city_severity ON road_incidents (city, severity, reported_at DESC);
