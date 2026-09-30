const INDIAN_CITIES = [
  // North
  { lat: 28.7041, lng: 77.1025, name: "Delhi" },
  { lat: 26.8467, lng: 80.9462, name: "Lucknow" },
  { lat: 26.9124, lng: 75.7873, name: "Jaipur" },
  { lat: 30.7333, lng: 76.7794, name: "Chandigarh" },
  { lat: 31.6340, lng: 74.8723, name: "Amritsar" },
  { lat: 34.0837, lng: 74.7973, name: "Srinagar" },
  { lat: 27.1767, lng: 78.0081, name: "Agra" },
  { lat: 25.3176, lng: 83.0039, name: "Varanasi" },
  { lat: 26.4499, lng: 80.3319, name: "Kanpur" },
  // West
  { lat: 19.0760, lng: 72.8777, name: "Mumbai" },
  { lat: 18.5204, lng: 73.8567, name: "Pune" },
  { lat: 23.0225, lng: 72.5714, name: "Ahmedabad" },
  { lat: 21.1702, lng: 72.8311, name: "Surat" },
  { lat: 22.3039, lng: 70.8022, name: "Rajkot" },
  { lat: 22.7196, lng: 75.8577, name: "Indore" },
  { lat: 23.2599, lng: 77.4126, name: "Bhopal" },
  { lat: 21.1458, lng: 79.0882, name: "Nagpur" },
  { lat: 19.9975, lng: 73.7898, name: "Nashik" },
  // South
  { lat: 12.9716, lng: 77.5946, name: "Bangalore" },
  { lat: 13.0827, lng: 80.2707, name: "Chennai" },
  { lat: 17.3850, lng: 78.4867, name: "Hyderabad" },
  { lat: 11.0168, lng: 76.9558, name: "Coimbatore" },
  { lat: 9.9252,  lng: 78.1198, name: "Madurai" },
  { lat: 8.5241,  lng: 76.9366, name: "Trivandrum" },
  { lat: 9.9312,  lng: 76.2673, name: "Kochi" },
  { lat: 15.3173, lng: 75.7139, name: "Hubli" },
  { lat: 11.8745, lng: 75.3704, name: "Kannur" },
  { lat: 10.7905, lng: 78.7047, name: "Trichy" },
  { lat: 11.6643, lng: 78.1460, name: "Salem" },
  // East & Central
  { lat: 22.5726, lng: 88.3639, name: "Kolkata" },
  { lat: 25.5941, lng: 85.1376, name: "Patna" },
  { lat: 26.1445, lng: 91.7362, name: "Guwahati" },
  { lat: 20.2961, lng: 85.8245, name: "Bhubaneswar" },
  { lat: 21.2514, lng: 81.6296, name: "Raipur" },
  { lat: 23.3441, lng: 85.3096, name: "Ranchi" },
  { lat: 23.7957, lng: 86.4304, name: "Dhanbad" },
  { lat: 22.8046, lng: 86.2029, name: "Jamshedpur" },
  { lat: 16.5062, lng: 80.6480, name: "Vijayawada" },
  { lat: 17.6868, lng: 83.2185, name: "Visakhapatnam" }
];

export function generateIndiaRoadSegments(count: number = 2000) {
  const segments = [];
  for (let i = 0; i < count; i++) {
    // Pick a random city
    const city = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
    
    // Add jitter (approx 20-30km radius) so cities look dense but stay mostly on land
    const lat = city.lat + (Math.random() - 0.5) * 0.3;
    const lng = city.lng + (Math.random() - 0.5) * 0.3;

    const stress = Math.floor(Math.random() * 100);
    
    let status = 'NORMAL';
    if (stress > 80) status = 'CRITICAL';
    else if (stress > 60) status = 'HIGH';
    else if (stress > 40) status = 'ELEVATED';

    segments.push({
      id: `IND-${city.name.substring(0, 3).toUpperCase()}-${1000 + i}`,
      lat,
      lng,
      stress,
      status
    });
  }
  return segments;
}
