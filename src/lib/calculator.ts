// ============================================
// CALCULATOR: Основна логика за изчисление
// ============================================

import type {
  RouteInput,
  CalculationResult,
  CostItem,
  VehicleType,
  TransportRecord,
  HistoricalComparison,
} from '@/types';
import { calculateDistance, estimateDuration } from './geo';

// ============================================
// 1. БАЗОВИ ЦЕНИ/КМ (от историческите данни)
// ============================================

const BASE_RATES: Record<VehicleType, number> = {
  '7.5T': 1.31,
  '18T': 1.50,
  '18T2D': 1.84,
  '26T': 1.33,
  '40T': 1.69,
};

// ============================================
// 2. ДОПЪЛНИТЕЛНИ РАЗХОДИ ПО ДЪРЖАВИ
// ============================================

interface CountryCost {
  type: CostItem['type'];
  amount: number;
  description: string;
}

const COUNTRY_COSTS: Record<string, CountryCost[]> = {
  // Ферибот
  'GR': [{ type: 'ferry', amount: 1000, description: 'Ферибот до Гърция' }],
  'GB': [{ type: 'ferry', amount: 500, description: 'Ферибот до Великобритания' }],
  'IT': [{ type: 'ferry', amount: 800, description: 'Ферибот до Италия (острови)' }],
  'SE': [{ type: 'ferry', amount: 600, description: 'Ферибот до Швеция' }],
  'NO': [{ type: 'ferry', amount: 1200, description: 'Ферибот до Норвегия' }],
  
  // Тунели
  'CH': [{ type: 'tunnel', amount: 150, description: 'Тунели в Швейцария' }],
  'AT': [{ type: 'tunnel', amount: 120, description: 'Тунели в Австрия' }],
  'FR': [{ type: 'tunnel', amount: 100, description: 'Тунели във Франция' }],
  
  // Митници
  'TR': [{ type: 'customs', amount: 200, description: 'Митница Турция' }],
};

// ============================================
// 3. ОСНОВНА ФУНКЦИЯ ЗА ИЗЧИСЛЕНИЕ
// ============================================

export function calculateRoute(
  input: RouteInput,
  historicalRecords: TransportRecord[] = []
): CalculationResult {
  // 1. Изчисли разстояние
  const distance = calculateDistance(input.origin, input.destination);

  // 2. Вземи базова цена/км
  const baseRate = BASE_RATES[input.vehicleType] || 1.5;

  // 3. Коригирай цената според разстоянието
  const ratePerKm = adjustRateForDistance(baseRate, distance);

  // 4. Изчисли основна цена
  const basePrice = Math.round(distance * ratePerKm * 100) / 100;

  // 5. Изчисли доп. разходи
  const additionalCosts = calculateAdditionalCosts(input);

  // 6. Изчисли обща себестойност
  const additionalTotal = additionalCosts.reduce((sum, c) => sum + c.amount, 0);
  const totalCost = Math.round((basePrice + additionalTotal) * 100) / 100;

  // 7. Предложи продажна цена (с марж 15-25%)
  const marginPercent = getMarginForDistance(distance);
  const suggestedSalePrice = Math.round(totalCost * (1 + marginPercent / 100) * 100) / 100;

  // 8. Изчисли марж
  const estimatedMargin = Math.round((suggestedSalePrice - totalCost) * 100) / 100;
  const estimatedMarginPercent = marginPercent;

  // 9. Изчисли време
  const estimatedDurationHours = estimateDuration(distance);

  // 10. Намери подобни исторически маршрути
  const historicalComparisons = findSimilarRoutes(input, historicalRecords, 5);

  return {
    distance,
    emptyKm: 0,
    ratePerKm,
    basePrice,
    additionalCosts,
    totalCost,
    suggestedSalePrice,
    estimatedMargin,
    estimatedMarginPercent,
    estimatedDurationHours,
    historicalComparisons,
  };
}

// ============================================
// 4. КОРЕКЦИЯ НА ЦЕНАТА СПОРЕД РАЗСТОЯНИЕТО
// ============================================

function adjustRateForDistance(baseRate: number, distance: number): number {
  // Отстъпка за дълги разстояния
  if (distance > 2000) return Math.round(baseRate * 0.85 * 100) / 100;
  if (distance > 1000) return Math.round(baseRate * 0.92 * 100) / 100;
  if (distance > 500) return Math.round(baseRate * 0.97 * 100) / 100;
  return baseRate;
}

// ============================================
// 5. МАРЖ СПОРЕД РАЗСТОЯНИЕТО
// ============================================

function getMarginForDistance(distance: number): number {
  // По-голям марж за кратки, по-малък за дълги
  if (distance < 300) return 25;
  if (distance < 800) return 20;
  if (distance < 1500) return 18;
  return 15;
}

// ============================================
// 6. ДОПЪЛНИТЕЛНИ РАЗХОДИ
// ============================================

function calculateAdditionalCosts(input: RouteInput): CostItem[] {
  const costs: CostItem[] = [];

  // Провери дестинацията
  const destCountry = input.destination.country;
  const originCountry = input.origin.country;

  const destCosts = COUNTRY_COSTS[destCountry] || [];
  const originCosts = COUNTRY_COSTS[originCountry] || [];

  // Добави разходи за дестинацията
  for (const cost of destCosts) {
    costs.push({
      type: cost.type,
      amount: cost.amount,
      currency: 'EUR',
      description: cost.description,
    });
  }

  // Добави разходи за произхода (ако не са дублирани)
  for (const cost of originCosts) {
    if (!costs.some(c => c.type === cost.type)) {
      costs.push({
        type: cost.type,
        amount: cost.amount,
        currency: 'EUR',
        description: cost.description,
      });
    }
  }

  return costs;
}

// ============================================
// 7. ТЪРСЕНЕ НА ПОДОБНИ МАРШРУТИ
// ============================================

function findSimilarRoutes(
  input: RouteInput,
  records: TransportRecord[],
  limit: number = 5
): HistoricalComparison[] {
  if (!records.length) return [];

  const targetCountry = input.destination.country;
  const originCountry = input.origin.country;
  const targetDistance = calculateDistance(input.origin, input.destination);

  // ✅ Само записи с реални данни
  const valid = records.filter(r => {
    const km = r.actualKm > 0 ? r.actualKm : r.plannedKm;
    return r.ratePerKm > 0 && km > 0;
  });

  console.log(`🔍 Търсене сред ${valid.length} валидни записа (target: ${targetDistance} км, ${originCountry} → ${targetCountry})`);

  // ✅ Приоритетно сортиране:
  // 1. Същата дестинация (ако има)
  // 2. Същия произход (ако има)
  // 3. Подобно разстояние
  const scored = valid.map(r => {
    const km = r.actualKm > 0 ? r.actualKm : r.plannedKm;
    let score = 0;

    // Същата държава на дестинация
    if (r.unloading.country && r.unloading.country === targetCountry) score += 100;
    // Същата държава на произход
    if (r.loading.country && r.loading.country === originCountry) score += 50;
    // Подобно разстояние (±20%)
    const distanceDiff = Math.abs(km - targetDistance) / targetDistance;
    if (distanceDiff < 0.2) score += 50;
    else if (distanceDiff < 0.4) score += 20;

    // Същата категория превозно средство
    if (r.vehicleType === input.vehicleType) score += 30;

    return { record: r, score, km };
  });

  // Сортирай по score (низходящо)
  scored.sort((a, b) => b.score - a.score);

  console.log(`🔍 Топ 3 резултата:`, scored.slice(0, 3).map(s => ({ 
    id: s.record.id, 
    score: s.score, 
    km: s.km,
    route: `${s.record.loading.country} → ${s.record.unloading.country || '?'}`
  })));

  return scored.slice(0, limit).map(s => ({
    recordId: s.record.id,
    route: `${s.record.loading.country || '?'} ${s.record.loading.city || '?'} → ${s.record.unloading.country || '?'} ${s.record.unloading.city || '?'}`,
    distance: s.km,
    ratePerKm: s.record.ratePerKm,
    totalPrice: s.record.freight || s.record.saleFreight || 0,
    date: s.record.loadingDate || 'N/A',
  }));
}

// ============================================
// 8. ТЕСТ
// ============================================

if (require.main === module) {
  const testInput: RouteInput = {
    origin: { country: 'BG', city: 'Sofia', postalCode: '1000' },
    destination: { country: 'DE', city: 'Berlin', postalCode: '10115' },
    vehicleType: '18T',
    weight: 5000,
    departureDate: new Date().toISOString(),
  };

  const result = calculateRoute(testInput);
  console.log('📊 Резултат от калкулация:');
  console.log(JSON.stringify(result, null, 2));
}