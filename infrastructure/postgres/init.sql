CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- PostGIS or TimescaleDB might be added later, assuming standard PG for now.

CREATE TABLE tenants (
    tenant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(tenant_id),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicle_types (
    type_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE manufacturers (
    manufacturer_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE vehicles (
    vehicle_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(tenant_id),
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    model_year INT,
    vehicle_type VARCHAR(50),
    fuel_type VARCHAR(50),
    battery_capacity FLOAT,
    odometer FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE road_segments (
    segment_id VARCHAR(50) PRIMARY KEY,
    road_name VARCHAR(255),
    road_type VARCHAR(50),
    geohash VARCHAR(20),
    start_latitude FLOAT,
    start_longitude FLOAT,
    end_latitude FLOAT,
    end_longitude FLOAT,
    speed_limit FLOAT,
    traffic_level VARCHAR(50),
    baseline_stress FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incidents (
    incident_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    road_segment_id VARCHAR(50) REFERENCES road_segments(segment_id),
    severity INT,
    stress_score FLOAT,
    confidence_score FLOAT,
    affected_vehicle_count INT,
    dominant_signals JSONB,
    status VARCHAR(50),
    first_detected_at TIMESTAMP WITH TIME ZONE,
    last_updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE vehicle_health (
    health_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(vehicle_id),
    health_score FLOAT,
    maintenance_risk VARCHAR(50),
    road_stress_exposure FLOAT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(255),
    entity_id VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: high volume telemetry storage might require TimescaleDB or partitioning.
-- This events table is for recent critical events, raw events stay in Kafka / analytical store.
CREATE TABLE events_recent (
    event_id VARCHAR(100) PRIMARY KEY,
    vehicle_id UUID REFERENCES vehicles(vehicle_id),
    event_type VARCHAR(100),
    event_timestamp TIMESTAMP WITH TIME ZONE,
    latitude FLOAT,
    longitude FLOAT,
    severity FLOAT,
    payload JSONB
);

-- Indexing
CREATE INDEX idx_events_vehicle ON events_recent(vehicle_id);
CREATE INDEX idx_events_timestamp ON events_recent(event_timestamp);
CREATE INDEX idx_incidents_segment ON incidents(road_segment_id);
CREATE INDEX idx_incidents_status ON incidents(status);
