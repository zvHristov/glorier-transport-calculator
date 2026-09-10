// ============================================
// TYPES: Transport Calculator
// ============================================

// Локация (държава, град, пощенски код, фирма)
export interface Location {
  country: string;      // 'BG', 'DE', 'IT' и т.н.
  postalCode?: string;
  city: string;
  company?: string;
}

// Тип превозно средство
export type VehicleType = '7.5T' | '18T' | '26T' | '40T' | '18T2D';

// Тип на разход
export type CostType =
  | 'ferry'         // ферибот
  | 'tunnel'        // тунел
  | 'customs'       // митница
  | 'parking'       // паркинг
  | 'driver_work'   // работа шофьор
  | 'extra_stay'    // доп. престой
  | 'fine'          // глоба
  | 'other';        // друго

// Отделен разход
export interface CostItem {
  type: CostType;
  amount: number;
  currency: string;     // 'EUR', 'BGN'
  description?: string;
}

// Запис от XML/Excel данните
export interface TransportRecord {
  id: number;
  status: string;                    // 'Активен', 'Завършен', 'Сторниран'
  client: string;
  vehicleType: VehicleType;
  loadingDate: string;
  unloadingDate: string;
  loading: Location;
  unloading: Location;
  loadingMeters: number;             // ЛДМ
  weight: number;                    // kg
  emptyKm: number;                   // празни км
  plannedKm: number;                 // планирани км
  actualKm: number;                  // изминати км
  ratePerKm: number;                 // цена/км
  freight: number;                   // навло (себестойност)
  saleFreight: number;               // навло продажба
  additionalCosts: CostItem[];
  carrier?: string;
}

// Входни данни за калкулатора
export interface RouteInput {
  origin: Location;
  destination: Location;
  vehicleType: VehicleType;
  weight: number;
  loadingMeters?: number;
  departureDate: string;             // ISO string
}

// Резултат от калкулацията
export interface CalculationResult {
  distance: number;                  // км
  emptyKm: number;                   // празни км
  ratePerKm: number;                 // цена/км
  basePrice: number;                 // основна цена
  additionalCosts: CostItem[];       // доп. разходи
  totalCost: number;                 // обща себестойност
  suggestedSalePrice: number;        // предложена продажна цена
  estimatedMargin: number;           // марж (€)
  estimatedMarginPercent: number;    // марж (%)
  estimatedDurationHours: number;    // време (часове)
  historicalComparisons: HistoricalComparison[];
}

// Сравнение с исторически данни
export interface HistoricalComparison {
  recordId: number;
  route: string;                     // 'BG Sofia → DE Berlin'
  distance: number;
  ratePerKm: number;
  totalPrice: number;
  date: string;
}

// Статистика за цени по категория
export interface RateStatistics {
  vehicleType: VehicleType;
  averageRatePerKm: number;
  minRatePerKm: number;
  maxRatePerKm: number;
  sampleSize: number;
}