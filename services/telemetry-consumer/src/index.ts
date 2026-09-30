import { Kafka } from 'kafkajs';
import { Pool } from 'pg';
import { createClient } from 'redis';
import * as dotenv from 'dotenv';
import { TelemetryEvent, EventType } from '@roadsense/shared-types';

dotenv.config();

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const TOPIC = process.env.TELEMETRY_TOPIC || 'vehicle.telemetry';
const STRESS_TOPIC = process.env.ROAD_STRESS_TOPIC || 'road.stress';

const kafka = new Kafka({
  clientId: 'telemetry-consumer',
  brokers: KAFKA_BROKERS,
});

const consumer = kafka.consumer({ groupId: 'telemetry-group-1' });
const producer = kafka.producer();

const pgPool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432', 10),
  user: process.env.POSTGRES_USER || 'roadsense',
  password: process.env.POSTGRES_PASSWORD || 'roadsense123',
  database: process.env.POSTGRES_DB || 'roadsense',
});

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redisClient.on('error', (err: any) => console.log('Redis Client Error', err));

async function run() {
  await redisClient.connect();
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });

  console.log(`Telemetry Consumer started, listening on ${TOPIC}`);

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;
      
      const event: TelemetryEvent = JSON.parse(message.value.toString());
      
      // Deduplication using Redis
      const isDuplicate = await redisClient.get(`event:${event.event_id}`);
      if (isDuplicate) {
        console.log(`Duplicate event detected: ${event.event_id}`);
        return;
      }
      // Set key with 24 hours expiry
      await redisClient.setEx(`event:${event.event_id}`, 86400, '1');
      
      // Forward critical events to DB
      if (event.event_type !== EventType.NORMAL_TELEMETRY) {
        try {
          await pgPool.query(
            `INSERT INTO events_recent 
             (event_id, vehicle_id, event_type, event_timestamp, latitude, longitude, severity, payload)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (event_id) DO NOTHING`,
            [
              event.event_id,
              event.vehicle_id,
              event.event_type,
              event.event_timestamp,
              event.latitude,
              event.longitude,
              event.severity,
              JSON.stringify(event.payload)
            ]
          );
        } catch (err) {
          console.error(`DB Insert failed for event ${event.event_id}:`, err);
        }
      }

      // Geohashing and Spatio-temporal aggregation would go here
      // For now, if we detect harsh braking, we can emit a road stress event
      if (event.event_type === EventType.HARSH_BRAKING || event.event_type === EventType.SUDDEN_SPEED_DROP) {
        const stressEvent = {
          road_segment_id: 'ROAD-DEMO-1', // Simplified placeholder
          event_type: event.event_type,
          vehicle_id: event.vehicle_id,
          timestamp: event.event_timestamp,
          severity: event.severity
        };
        
        await producer.send({
          topic: STRESS_TOPIC,
          messages: [{ value: JSON.stringify(stressEvent) }]
        });
      }
    },
  });
}

run().catch(console.error);
