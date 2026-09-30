import { 
  isValidVIN, 
  parseDTC, 
  findOptimalEVCharger, 
  StreamingBloomFilter 
} from '../index';

describe('Hackathon Core DSA & Algorithm Test Suite', () => {
  describe('1. 17-Char VIN Validator & Check Digit (ISO 3779)', () => {
    test('Validates a standard 17-char VIN with correct check digit', () => {
      // 1HGCM82633A004352 (from the hackathon problem statement)
      const res = isValidVIN('1HGCM82633A004352');
      expect(res.valid).toBe(true);
    });

    test('Rejects VINs containing prohibited characters I, O, Q', () => {
      const resI = isValidVIN('1HGCM82633I004352');
      expect(resI.valid).toBe(false);
      expect(resI.reason).toContain('prohibited characters');

      const resO = isValidVIN('1HGCM82633O004352');
      expect(resO.valid).toBe(false);
    });

    test('Rejects VINs with wrong length', () => {
      const res = isValidVIN('1HGCM82633');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('exactly 17 characters');
    });

    test('Rejects VINs with invalid check digit', () => {
      const res = isValidVIN('1HGCM82673A004352'); // Altered check digit
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('check digit mismatch');
    });
  });

  describe('2. OBD-II DTC Fault Code Parser (SAE J2019 / ISO 15031-6)', () => {
    test('Correctly parses Powertrain Misfire code P0301', () => {
      const dtc = parseDTC('P0301');
      expect(dtc.category).toBe('Powertrain');
      expect(dtc.isGeneric).toBe(true);
      expect(dtc.severity).toBe('HIGH');
      expect(dtc.description).toContain('Cylinder 1 Misfire');
    });

    test('Correctly identifies Critical EV Battery fault P0A80', () => {
      const dtc = parseDTC('P0A80');
      expect(dtc.category).toBe('Powertrain');
      expect(dtc.severity).toBe('CRITICAL');
      expect(dtc.recommendedAction).toContain('EV');
    });

    test('Parses Chassis ABS fault C0035', () => {
      const dtc = parseDTC('C0035');
      expect(dtc.category).toBe('Chassis');
      expect(dtc.severity).toBe('HIGH');
    });

    test('Handles Network CAN Bus error U0100', () => {
      const dtc = parseDTC('U0100');
      expect(dtc.category).toBe('Network');
      expect(dtc.severity).toBe('CRITICAL');
    });
  });

  describe('3. EV Dijkstra & Range Constraint Reachability Optimizer', () => {
    const mockChargers = [
      { id: 'CH-1', name: 'Delhi Hub Fast Charger', latitude: 28.62, longitude: 77.21, powerKw: 60, tariffPerKwhInr: 12, availablePorts: 4 },
      { id: 'CH-2', name: 'Gurugram Supercharger', latitude: 28.45, longitude: 77.02, powerKw: 150, tariffPerKwhInr: 15, availablePorts: 8 },
      { id: 'CH-3', name: 'Far Away Depot', latitude: 30.50, longitude: 76.50, powerKw: 50, tariffPerKwhInr: 10, availablePorts: 2 }
    ];

    test('Finds optimal charger within remaining battery SoC range', () => {
      // Vehicle in Central Delhi with 40% battery
      const routes = findOptimalEVCharger(28.6139, 77.2090, 40, 60, 16, mockChargers);
      expect(routes.length).toBe(3);
      expect(routes[0].isReachable).toBe(true);
      expect(routes[0].charger.id).toBe('CH-1');
      expect(routes[0].estimatedChargeTimeMins).toBeGreaterThan(0);
      expect(routes[2].isReachable).toBe(false); // Far Away Depot out of range
    });
  });

  describe('4. Streaming Bloom Filter for Idempotent Deduplication', () => {
    test('Correctly flags added items and does not false-negative', () => {
      const bloom = new StreamingBloomFilter(10000, 0.01);
      const eventKey1 = 'evt_10001_seq_9921';
      const eventKey2 = 'evt_10002_seq_9922';

      expect(bloom.has(eventKey1)).toBe(false);
      bloom.add(eventKey1);
      expect(bloom.has(eventKey1)).toBe(true);
      expect(bloom.has(eventKey2)).toBe(false);
    });
  });
});
