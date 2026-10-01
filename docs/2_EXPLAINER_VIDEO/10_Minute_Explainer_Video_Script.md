# RoadSense AI — 10-Minute Hackathon Explainer Video Script

**Target Duration:** 08:30 – 09:45 (Strictly < 10:00)  
**Presenter:** Hardik Agrawal  
**Project Title:** RoadSense AI — Enterprise Connected Vehicle & Road Intelligence Platform  
**Live Demo URL:** [https://roadsense-ai-one.vercel.app/](https://roadsense-ai-one.vercel.app/)  

---

## ⏱️ Video Structure & Timestamp Guide

| Section | Timestamp | Screen Visual / Action | Spoken Focus |
| :--- | :--- | :--- | :--- |
| **1. Hook & Problem Statement** | `0:00 – 1:15` | Slide: Connected Fleet Data Firehose (25GB/hr/veh) | Ingestion velocity, OEM fragmentation, delayed emergency response |
| **2. Motorq Alignment & Solution** | `1:15 – 2:30` | Slide: Motorq Reference vs RoadSense Architecture | Unified schema, sub-second latency, Motorq Fuse equivalent AI |
| **3. End-to-End Architecture** | `2:30 – 3:45` | Architecture Diagram (Mermaid / Flow) | Kafka ingestion, Polyglot 3NF DB, Redis, Fastify & Next.js |
| **4. Live Demo: Overview & Weather** | `3:45 – 5:00` | Browser: [Overview Page](https://roadsense-ai-one.vercel.app/) | 16-City weather selector dropdown, live Kafka events/sec KPI |
| **5. Live Demo: Incidents & Dispatch**| `5:00 – 6:15` | Browser: [Incident Response Triage](https://roadsense-ai-one.vercel.app/incidents) | TomTom live incidents, Grid/Table view, 1-click unit dispatch |
| **6. Live Demo: Fleet Telemetry** | `6:15 – 7:15` | Browser: [Fleet Vehicles](https://roadsense-ai-one.vercel.app/vehicles) | Live OBD-II diagnostics, DTC codes, vehicle inspection modal |
| **7. Live Demo: Geospatial Heatmap**| `7:15 – 8:00` | Browser: [Road Intelligence Map](https://roadsense-ai-one.vercel.app/road-intelligence) | MapLibre GIS map, 4 basemap styles, corridor stress heatmap |
| **8. Live Demo: Agentic AI Assistant**| `8:00 – 9:00` | Browser: Floating AI Assistant Drawer | Grounded live telemetry questions, patrol dispatch, memory |
| **9. Gov Roadmap & Closing** | `9:00 – 9:45` | Slide: NHAI, MoRTH, CAD Dial 112 & Summary | Impact, future vision, and conclusion |

---

## 🎙️ Word-for-Word Narration Script & Live Visual Cues

### Part 1: Introduction & The Core Problem (`0:00 – 1:15`)
- **[Visual: Slide 1 — Title & Problem Statement]**
> *"Hello everyone and esteemed judges. I am Hardik Agrawal, and today I am thrilled to present **RoadSense AI**, an enterprise-grade connected vehicle intelligence and predictive road analytics platform.*
> 
> *Modern connected vehicles generate up to **25 gigabytes of time-series telemetric data every single hour**. For an enterprise fleet of **100,000 vehicles**, this produces an overwhelming firehose of **~100,000 events per second**—spanning GPS, CAN-bus, engine diagnostics, battery state-of-charge, and accelerometer G-spikes.*
> 
> *Today’s fleet operators and municipal authorities face three massive challenges:*
> *First, **heterogeneous OEM data fragmentation** across Tata, Mahindra, Ashok Leyland, and Hyundai.*
> *Second, **unmonitored corridor congestion and road stress**, causing delivery delays and vehicle degradation.*
> *And third, **slow, manual emergency escalation**, where hazardous bottlenecks and collisions take hours to reach dispatch teams.*
> 
> *RoadSense AI solves all three."*

---

### Part 2: Motorq Alignment & High-Level Architecture (`1:15 – 2:30`)
- **[Visual: Slide 2 — Architecture & Motorq Reference Comparison]**
> *"Drawing inspiration from the **Motorq Reference Architecture**, RoadSense AI delivers:*
> *1. High-velocity stream ingestion via an Apache Kafka multi-partitioned pipeline.*
> *2. A normalized canonical telemetry schema with strict ISO 3779 17-character VIN verification and SAE J2019 diagnostic trouble code parsing.*
> *3. Sub-second latency with real-time WebSocket streaming.*
> *4. And an **Agentic AI Operations Controller**—our Motorq Fuse equivalent—grounded directly in live vehicle states and municipal traffic data.*
> 
> *Our polyglot data layer combines **PostgreSQL 15 in strict 3NF** for relational integrity, **TimescaleDB range partitioning** to ingest 100k events/sec without index locks, **Redis 7.2** for sub-millisecond hot GPS lookups, and **pgvector** for AI retrieval."*

---

### Part 3: Live Application Walkthrough — Overview & Weather (`2:30 – 4:00`)
- **[Visual: Switch to Browser — https://roadsense-ai-one.vercel.app/]**
> *"Let's jump straight into the live production application deployed on Vercel.*
> 
> *Here on the **Executive Overview Dashboard**, we immediately see our real-time telemetry stream ingesting over **95,000 events per second** with a processing latency of just 18 milliseconds.*
> 
> *At the top right, we’ve integrated a **unified 16-City Indian Metropolitan Corridor selector**. When I open this dropdown and switch between Delhi, Mumbai, Bengaluru, Chennai, or Kolkata, RoadSense AI dynamically queries OpenWeatherMap and updates the meteorological conditions instantly, ensuring fleet dispatchers account for rain, fog, and temperature spikes."*

---

### Part 4: Live Demo — Incident Response Triage (`4:00 – 5:30`)
- **[Visual: Click on "Incidents" in the Sidebar]**
> *"Moving to the **Incident Response Triage** cockpit, we integrate live geospatial incident feeds from the **TomTom Traffic API** across 16 Indian metropolitan corridors.*
> 
> *Operators can toggle seamlessly between a high-information **Card Grid view** and a dense **Table view**, filtering by severity—Critical, High, or Medium.*
> 
> *When a critical road obstruction or severe bottleneck occurs, the operator simply clicks **Dispatch Unit**. Instantly, the system updates the incident state and fires an audio-visual dispatch alert directly into our top-bar notification center."*

---

### Part 5: Live Demo — Connected Fleet Telemetry & Inspection (`5:30 – 6:45`)
- **[Visual: Click on "Vehicles" in the Sidebar]**
> *"Next, in **Fleet Telemetry & Vehicles**, we monitor connected vehicles across mixed EV and commercial diesel fleets.*
> 
> *Our `@roadsense/validation` algorithmic engine continuously parses OBD-II diagnostic fault codes. When I click on any vehicle to inspect, the deep inspection modal opens—revealing live speed, engine temperature, State-of-Charge, odometer readings, and GPS coordinates."*

---

### Part 6: Live Demo — Geospatial Map & Heatmap (`6:45 – 7:45`)
- **[Visual: Click on "Road Intelligence" in the Sidebar]**
> *"In **Geospatial Road Intelligence**, we render high-performance MapLibre vector maps.*
> 
> *Operators can switch between **Light Streets, Light Minimal, Satellite, and Dark modes**, and toggle our real-time **Road Stress Heatmap layer** to visualize bottlenecks across national expressways like the Delhi-Mumbai Corridor and NH-44."*

---

### Part 7: Live Demo — Grounded Agentic AI Assistant (`7:45 – 8:45`)
- **[Visual: Open the Floating AI Assistant in the bottom right corner]**
> *"Finally, here is our **RoadSense AI Operations Controller**.*
> 
> *Unlike generic chatbots, this assistant is **grounded in real-time telemetry**. I can ask: `'Which corridors currently have critical stress and what units should we dispatch?'`*
> 
> *The assistant inspects live incident data, identifies the highest-stress bottlenecks, and recommends immediate dispatch actions. It features multi-turn conversation retention and resilient multi-model fallback across Qwen 2.5 72B and Llama 3.3 70B."*

---

### Part 8: Government Integration Roadmap & Conclusion (`8:45 – 9:30`)
- **[Visual: Slide 3 — Future Government Roadmap & Conclusion]**
> *"Looking ahead, RoadSense AI is architected for direct integration with:
> 1. **State Police CAD Systems (Dial 112 / 1033)** for automated multi-vehicle collision packets.
> 2. **NHAI & MoRTH Highway Protocols** for automated Variable Message Sign alerts.
> 3. And **Municipal Pothole Ticketing (BMC, BBMP, MCD)** using vehicle accelerometer G-spikes.*
> 
> *RoadSense AI bridges automotive IoT with national road infrastructure intelligence. Thank you very much!"*
