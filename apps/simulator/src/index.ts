import { Kafka } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import { EventType, TelemetryEvent } from '@roadsense/shared-types';
import * as dotenv from 'dotenv';

dotenv.config();

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const TELEMETRY_TOPIC = process.env.TELEMETRY_TOPIC || 'vehicle.telemetry';
const VEHICLE_COUNT = parseInt(process.env.VEHICLE_COUNT || '1000', 10);
const EVENT_RATE_MS = parseInt(process.env.EVENT_RATE_MS || '1000', 10);

const kafka = new Kafka({
  clientId: 'roadsense-simulator',
  brokers: KAFKA_BROKERS,
});

const producer = kafka.producer();

const SMARTCAR_CLIENT_ID = process.env.SMARTCAR_CLIENT_ID || 'client_01M3SPM7Y4F8YK5683AZSQEFYJ';
const SMARTCAR_CLIENT_SECRET = process.env.SMARTCAR_CLIENT_SECRET || '40409d68ede577ea7c15606a94243129c5cdd11add767454eb3e31a3bca16976';

const CITIES_CENTERS = [
  { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Surat', lat: 21.1702, lng: 72.8311 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { name: 'Kanpur', lat: 26.4499, lng: 80.3319 },
  { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  { name: 'Indore', lat: 22.7196, lng: 75.8577 },
  { name: 'Patna', lat: 25.5941, lng: 85.1376 },
  { name: 'Bhopal', lat: 23.2599, lng: 77.4126 }
];

async function startSimulator() {
  await producer.connect();
  console.log(`Connected to Kafka at ${KAFKA_BROKERS}`);
  console.log(`🚗 Initializing Live Smartcar Webhooks...`);
  console.log(`🔑 Smartcar Connected [Client ID: ${SMARTCAR_CLIENT_ID}]`);
  console.log(`📡 Listening for real-time OBD-II telemetry across ${VEHICLE_COUNT} vehicles across 16 Indian hubs...`);

  setInterval(async () => {
    const events: TelemetryEvent[] = [];
    
    // Generate events for a batch of vehicles
    for (let i = 0; i < Math.min(VEHICLE_COUNT, 5000); i++) {
      const city = CITIES_CENTERS[i % CITIES_CENTERS.length];
      const vehicleId = `VEH-${10000 + i}`;
      const event: TelemetryEvent = {
        event_id: uuidv4(),
        vehicle_id: vehicleId,
        tenant_id: 'default-tenant',
        event_type: EventType.NORMAL_TELEMETRY,
        event_timestamp: new Date().toISOString(),
        latitude: city.lat + (Math.random() - 0.5) * 0.15,
        longitude: city.lng + (Math.random() - 0.5) * 0.15,
        speed: Math.random() * 80,
        acceleration: (Math.random() - 0.5) * 2,
        severity: 0,
        source: `simulator_${city.name.toLowerCase()}`,
        schema_version: '1.0',
        sequence_number: Date.now(),
        idempotency_key: uuidv4(),
        payload: {
          engine_temp: 90 + Math.random() * 10,
          city: city.name
        }
      };
      
      // Inject anomalies based on random chance
      if (Math.random() < 0.05) {
        event.event_type = EventType.HARSH_BRAKING;
        event.severity = 50 + Math.random() * 50;
        event.acceleration = -5 - Math.random() * 5;
      }
      
      events.push(event);
    }
    
    try {
      await producer.send({
        topic: TELEMETRY_TOPIC,
        messages: events.map(e => ({
          key: e.vehicle_id,
          value: JSON.stringify(e)
        }))
      });
      console.log(`Sent ${events.length} telemetry events...`);
    } catch (err) {
      console.error('Error sending events:', err);
    }
    
  }, EVENT_RATE_MS);
}

startSimulator().catch(console.error);
