# RoadSense AI — Core Algorithmic Suite & Complexity Analysis

Package Reference: `@roadsense/validation` ([`packages/validation/src/index.ts`](file:///c:/Users/Hardik%20Agrawal/Desktop/roadsense/packages/validation/src/index.ts))

---

## 1. 17-Character VIN Checksum Validator (ISO 3779 / ISO 3780)

### Mathematical Formulation
Given a 17-character VIN string $V = [v_1, v_2, \dots, v_{17}]$, where $v_i \in \{A-Z, 0-9\} \setminus \{I, O, Q\}$:
1. Each character is mapped to a numeric transliteration value $M(v_i)$ using the ISO standard table.
2. Each position is assigned an official weight $W = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]$.
3. The weighted sum is computed:
   $$S = \sum_{i=1}^{17} (M(v_i) \times W_i)$$
4. The remainder $R = S \pmod{11}$ determines the check digit at position 9:
   - If $R = 10$, check digit is `'X'`.
   - Otherwise, check digit is $R$.

### Big-O Complexity
- **Time Complexity:** $O(1)$ — Exact 17 character iterations.
- **Space Complexity:** $O(1)$ — Constant size lookup table.

---

## 2. OBD-II DTC Diagnostic Fault Code Parser (SAE J2019 / ISO 15031-6)

### Classification Matrix
- **Category Decoding:**
  - `P` $\rightarrow$ Powertrain (Engine, Transmission, Fuel, Ignition)
  - `C` $\rightarrow$ Chassis (Brakes, ABS, Steering, Suspension)
  - `B` $\rightarrow$ Body (Airbags, Climate, Lighting)
  - `U` $\rightarrow$ Network Communication (CAN-bus, ECU Bus Off)
- **Severity Classifier:**
  - `P0300` (Random Misfire) $\rightarrow$ **CRITICAL** (Immediate engine protection)
  - `C0035` (Left Front Wheel Speed Sensor) $\rightarrow$ **HIGH** (ABS degradation)
  - `U0100` (Lost Communication with ECM) $\rightarrow$ **CRITICAL** (CAN network timeout)

### Big-O Complexity
- **Time Complexity:** $O(1)$ lookup via Hash Map.
- **Space Complexity:** $O(1)$.

---

## 3. Dijkstra Graph EV Optimal Charging Routing

### Algorithm Outline
Given an EV at coordinate $(lat_{veh}, lon_{veh})$ with remaining State-of-Charge $SoC_{curr}$ and battery capacity $Cap_{kWh}$, and a set of $N$ available DC Fast charging stations $C = \{c_1, c_2, \dots, c_N\}$:
1. Compute geodesic Haversine distance $d(veh, c_i)$ for each station:
   $$d = 2R \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos \phi_1 \cos \phi_2 \sin^2\left(\frac{\Delta \lambda}{2}\right)} \right)$$
2. Compute estimated energy consumption $E_{req} = d \times \kappa$, where $\kappa \approx 0.18 \text{ kWh/km}$.
3. Discard unviable stations where $E_{req} > (SoC_{curr} - 10\%) \times Cap_{kWh}$.
4. Optimize total trip cost $Cost = d \times \text{Rate}_{transit} + E_{charge} \times \text{Tariff}_{kWh}$.

### Big-O Complexity
- **Time Complexity:** $O(N \log N)$ where $N$ is charger graph nodes.
- **Space Complexity:** $O(N)$ priority queue.

---

## 4. Streaming Bloom Filter for Idempotent Telemetry Ingestion

### Bitwise Implementation
To eliminate duplicate telemetry packets arriving within network burst windows across 100k vehicles:
- $m = 500,000$ bit array.
- $k = 4$ independent hash functions derived using MurmurHash3 dual-hashing ($h_i(x) = h_1(x) + i \cdot h_2(x) \pmod m$).
- False positive probability: $p \approx \left(1 - e^{-kn/m}\right)^k \approx 1.2\%$.

### Big-O Complexity
- **Time Complexity:** $O(k)$ bit operations per packet.
- **Space Complexity:** $O(m)$ bits (~62.5 KB RAM).
