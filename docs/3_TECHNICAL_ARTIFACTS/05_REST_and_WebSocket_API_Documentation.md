# RoadSense AI — REST & WebSocket API Specification

Fastify 4.26 Enterprise Microservice Gateway (Default Port: `3001`)

---

## 1. Health & Status Endpoints

### `GET /health`
- **Description:** System health check, memory usage, uptime, and database connection status.
- **Response:**
```json
{
  "status": "healthy",
  "uptime": 14502.4,
  "service": "@roadsense/api",
  "timestamp": "2026-10-01T12:00:00.000Z",
  "metrics": {
    "kafkaLag": 38,
    "activeConnections": 142
  }
}
```

---

## 2. Connected Fleet Telemetry Endpoints

### `GET /api/v1/vehicles`
- **Description:** Returns paginated list of connected vehicles with real-time OBD-II telemetry.
- **Query Params:** `page`, `limit`, `city`, `status`, `search`
- **Sample Response:**
```json
{
  "success": true,
  "count": 60,
  "data": [
    {
      "id": "IND-VEH-10001",
      "driver": "Aarav Sharma",
      "city": "Delhi",
      "model": "Tata Nexon EV Max",
      "speed": 54,
      "stress": 38,
      "status": "NORMAL",
      "engine_temp": 82,
      "fuel_battery": 78,
      "odometer": 15420,
      "latitude": 28.6139,
      "longitude": 77.2090,
      "updated_at": "2026-10-01T12:00:00.000Z"
    }
  ]
}
```

### `GET /api/v1/vehicles/:id`
- **Description:** Fetch detailed diagnostic status, active DTC trouble codes, and trip history for a single vehicle.

---

## 3. Incident Response & Dispatch Endpoints

### `GET /api/v1/incidents`
- **Description:** Fetch live TomTom road disruptions across 16 Indian metropolitan corridors.
- **Sample Response:**
```json
{
  "success": true,
  "count": 42,
  "incidents": [
    {
      "id": "INC-DEL-401",
      "roadName": "Outer Ring Road, Munirka",
      "city": "Delhi",
      "type": "Road Construction",
      "category": "ROADWORKS",
      "severity": "HIGH",
      "delayMinutes": 18,
      "vehiclesAffected": 340,
      "stress": 74,
      "latitude": 28.5562,
      "longitude": 77.1734
    }
  ]
}
```

### `POST /api/v1/incidents/dispatch`
- **Description:** Dispatches an emergency patrol unit or municipal repair team to an incident site.
- **Payload:**
```json
{
  "incidentId": "INC-DEL-401",
  "unitId": "PATROL-DEL-09",
  "priority": "HIGH"
}
```

---

## 4. Real-Time WebSocket Streaming API

### `WS /api/v1/live`
- **Description:** High-frequency bi-directional WebSocket connection streaming live fleet updates and incident triage events.
- **Sample Server Event:**
```json
{
  "type": "FLEET_UPDATE",
  "eventsPerSecond": 95420,
  "activeIncidents": 1640,
  "processingLatencyMs": 18,
  "kafkaLag": 42,
  "timestamp": 1790800000000
}
```

---

## 5. Agentic AI Operations Controller Endpoint

### `POST /api/v1/chat`
- **Description:** Multi-model operations assistant endpoint grounded with live telemetry and domain guardrails.
- **Payload:**
```json
{
  "messages": [
    { "role": "user", "content": "Which corridors in Bengaluru currently exceed 75 stress?" }
  ],
  "telemetryContext": {
    "activeIncidentsCount": 1640,
    "topBottleneck": "Silk Board Junction"
  }
}
```
