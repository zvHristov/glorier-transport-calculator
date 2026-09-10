// ============================================
// GEO: Географски изчисления
// ============================================

import type { Location } from '@/types';

// Координати на градовете (за Haversine fallback)
// В реален продукт ще използваме Mapbox API, но за прототип
// ще имаме основни градове в Европа
const CITY_COORDINATES: Record<string, [number, number]> = {
  // България
  'sofia': [23.3219, 42.6977],
  'plovdiv': [24.7453, 42.1354],
  'varna': [27.9147, 43.2141],
  'burgas': [27.4679, 42.5061],
  'ruse': [26.0333, 43.8500],
  'blagoevgrad': [23.0943, 42.0142],
  'stara zagora': [25.6295, 42.4258],
  
  // Германия
  'berlin': [13.4050, 52.5200],
  'munich': [11.5820, 48.1351],
  'hamburg': [9.9937, 53.5511],
  'frankfurt': [8.6821, 50.1109],
  'cologne': [6.9603, 50.9375],
  'stuttgart': [9.1829, 48.7758],
  'dusseldorf': [6.7735, 51.2277],
  'dortmund': [7.4653, 51.5136],
  'bonn': [7.0982, 50.7374],
  
  // Италия
  'rome': [12.4964, 41.9028],
  'milan': [9.1900, 45.4642],
  'naples': [14.2681, 40.8518],
  'turin': [7.6869, 45.0703],
  'verona': [10.9916, 45.4384],
  'venice': [12.3155, 45.4408],
  'florence': [11.2558, 43.7696],
  
  // Франция
  'paris': [2.3522, 48.8566],
  'lyon': [4.8357, 45.7640],
  'marseille': [5.3698, 43.2965],
  'toulouse': [1.4442, 43.6047],
  'bordeaux': [-0.5792, 44.8378],
  
  // Испания
  'madrid': [-3.7038, 40.4168],
  'barcelona': [2.1734, 41.3851],
  'valencia': [-0.3763, 39.4699],
  'seville': [-5.9845, 37.3891],
  
  // Великобритания
  'london': [-0.1276, 51.5074],
  'manchester': [-2.2426, 53.4808],
  'birmingham': [-1.8904, 52.4862],
  
  // Нидерландия
  'amsterdam': [4.9041, 52.3676],
  'rotterdam': [4.4777, 51.9244],
  
  // Белгия
  'brussels': [4.3517, 50.8503],
  'antwerp': [4.4025, 51.2194],
  
  // Австрия
  'vienna': [16.3738, 48.2082],
  'salzburg': [13.0550, 47.8095],
  
  // Швейцария
  'zurich': [8.5417, 47.3769],
  'geneva': [6.1432, 46.2044],
  
  // Чехия
  'prague': [14.4378, 50.0755],
  
  // Полша
  'warsaw': [21.0122, 52.2297],
  'krakow': [19.9450, 50.0647],
  
  // Румъния
  'bucharest': [26.1025, 44.4268],
  
  // Гърция
  'athens': [23.7275, 37.9838],
  'thessaloniki': [22.9444, 40.6401],
};

// Средна скорост на камион (км/ч) – за изчисление на време
const AVERAGE_TRUCK_SPEED = 60;

// ============================================
// 1. HAVERSINE ФОРМУЛА (fallback)
// ============================================

export function haversineDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const R = 6371; // Радиус на Земята в км
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// ============================================
// 2. ИЗЧИСЛЯВАНЕ НА РАЗСТОЯНИЕ
// ============================================

export function calculateDistance(origin: Location, destination: Location): number {
  // Опитай да намериш координати по град
  const originCoords = findCityCoordinates(origin.city);
  const destinationCoords = findCityCoordinates(destination.city);

  if (originCoords && destinationCoords) {
    // Използвай Haversine и добави 20% за реални пътища
    const straightLine = haversineDistance(originCoords, destinationCoords);
    return Math.round(straightLine * 1.2);
  }

  // Fallback: използвай разстояние по държави
  return estimateDistanceByCountry(origin.country, destination.country);
}

// ============================================
// 3. НАМИРАНЕ НА КООРДИНАТИ ПО ГРАД
// ============================================

function findCityCoordinates(city: string): [number, number] | null {
  if (!city) return null;
  const normalized = city.toLowerCase().trim();
  return CITY_COORDINATES[normalized] || null;
}

// ============================================
// 4. FALLBACK: РАЗСТОЯНИЕ ПО ДЪРЖАВИ
// ============================================

const COUNTRY_DISTANCES: Record<string, Record<string, number>> = {
  'BG': { 'DE': 1700, 'IT': 1400, 'GR': 400, 'RO': 400, 'TR': 500, 'FR': 2200, 'NL': 2100, 'BE': 2000, 'AT': 1200, 'CH': 1600, 'ES': 2600, 'GB': 2500, 'PL': 1400, 'CZ': 1300 },
  'DE': { 'BG': 1700, 'IT': 1000, 'FR': 800, 'NL': 500, 'BE': 400, 'AT': 600, 'CH': 500, 'ES': 1800, 'GB': 1000, 'PL': 600, 'CZ': 400, 'GR': 1900 },
  'IT': { 'BG': 1400, 'DE': 1000, 'FR': 800, 'AT': 600, 'CH': 400, 'ES': 1400, 'GR': 1200, 'NL': 1300, 'BE': 1200 },
  'FR': { 'BG': 2200, 'DE': 800, 'IT': 800, 'ES': 1000, 'GB': 500, 'NL': 500, 'BE': 300, 'CH': 500 },
  'ES': { 'BG': 2600, 'DE': 1800, 'IT': 1400, 'FR': 1000, 'PT': 600 },
  'GR': { 'BG': 400, 'DE': 1900, 'IT': 1200, 'TR': 800 },
  'NL': { 'BG': 2100, 'DE': 500, 'FR': 500, 'BE': 200, 'GB': 500 },
  'BE': { 'BG': 2000, 'DE': 400, 'FR': 300, 'NL': 200, 'GB': 400 },
  'AT': { 'BG': 1200, 'DE': 600, 'IT': 600, 'CH': 300, 'HU': 300 },
  'CH': { 'BG': 1600, 'DE': 500, 'IT': 400, 'FR': 500, 'AT': 300 },
  'GB': { 'BG': 2500, 'DE': 1000, 'FR': 500, 'NL': 500, 'BE': 400 },
  'PL': { 'BG': 1400, 'DE': 600, 'CZ': 300, 'SK': 300 },
  'CZ': { 'BG': 1300, 'DE': 400, 'AT': 300, 'PL': 300 },
  'RO': { 'BG': 400, 'DE': 1500, 'HU': 400 },
  'HU': { 'AT': 300, 'RO': 400, 'SK': 200, 'DE': 900 },
};

function estimateDistanceByCountry(from: string, to: string): number {
  if (from === to) return 500; // Средно вътрешно разстояние
  const distance = COUNTRY_DISTANCES[from]?.[to] || COUNTRY_DISTANCES[to]?.[from];
  return distance || 1500; // Default за непознати държави
}

// ============================================
// 5. ИЗЧИСЛЯВАНЕ НА ВРЕМЕ
// ============================================

export function estimateDuration(distanceKm: number): number {
  return Math.round((distanceKm / AVERAGE_TRUCK_SPEED) * 10) / 10;
}

// ============================================
// 6. ЕКСПОРТ НА КООРДИНАТИ ЗА КАРТАТА
// ============================================

export function getCityCoordinates(city: string): [number, number] | null {
  return findCityCoordinates(city);
}