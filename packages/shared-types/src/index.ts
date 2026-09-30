export enum VehicleType {
  Sedan = 'Sedan',
  Hatchback = 'Hatchback',
  SUV = 'SUV',
  Truck = 'Truck',
  Bus = 'Bus',
  EV = 'EV',
  Delivery = 'Delivery vehicle',
  Commercial = 'Commercial fleet vehicle'
}

export enum EventType {
  NORMAL_TELEMETRY = 'NORMAL_TELEMETRY',
  HARSH_BRAKING = 'HARSH_BRAKING',
  HARSH_ACCELERATION = 'HARSH_ACCELERATION',
  SUDDEN_SPEED_DROP = 'SUDDEN_SPEED_DROP',
  OVERSPEED = 'OVERSPEED',
  VIBRATION_ANOMALY = 'VIBRATION_ANOMALY',
  ENGINE_TEMPERATURE_ANOMALY = 'ENGINE_TEMPERATURE_ANOMALY',
  BATTERY_TEMPERATURE_ANOMALY = 'BATTERY_TEMPERATURE_ANOMALY',
  SUSPENSION_ANOMALY = 'SUSPENSION_ANOMALY',
  DIAGNOSTIC_TROUBLE_CODE = 'DIAGNOSTIC_TROUBLE_CODE',
  FUEL_LEVEL_CHANGE = 'FUEL_LEVEL_CHANGE',
  LOW_BATTERY = 'LOW_BATTERY',
  CONNECTIVITY_LOSS = 'CONNECTIVITY_LOSS',
  CONNECTIVITY_RESTORED = 'CONNECTIVITY_RESTORED',
  TRIP_STARTED = 'TRIP_STARTED',
  TRIP_ENDED = 'TRIP_ENDED'
}

export interface TelemetryEvent {
  event_id: string;
  vehicle_id: string;
  tenant_id: string;
  event_type: EventType;
  event_timestamp: string; // ISO String
  ingestion_timestamp?: string; // ISO String
  latitude: number;
  longitude: number;
  speed: number;
  acceleration: number;
  severity: number;
  source: string;
  schema_version: string;
  sequence_number: number;
  idempotency_key: string;
  payload: Record<string, any>;
}

export interface Vehicle {
  vehicle_id: string;
  tenant_id: string;
  manufacturer: string;
  model: string;
  model_year: number;
  vehicle_type: VehicleType;
  fuel_type: string;
  battery_capacity: number;
  current_latitude: number;
  current_longitude: number;
  speed: number;
  acceleration: number;
  heading: number;
  odometer: number;
  engine_temperature: number;
  battery_soc: number;
  battery_soh: number;
  fuel_level: number;
  vibration_level: number;
  engine_rpm: number;
  connectivity_status: string;
  current_trip_id: string | null;
  created_at: string;
  updated_at: string;
}

export enum RoadStressState {
  NORMAL = 'NORMAL',
  MONITORING = 'MONITORING',
  ELEVATED = 'ELEVATED',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum IncidentStatus {
  ACTIVE = 'ACTIVE',
  MONITORING = 'MONITORING',
  RESOLVED = 'RESOLVED'
}

export interface RoadStressIncident {
  incident_id: string;
  road_segment_id: string;
  severity: number;
  stress_score: number;
  confidence_score: number;
  affected_vehicle_count: number;
  dominant_signals: string[];
  first_detected_at: string;
  last_updated_at: string;
  status: IncidentStatus;
}
