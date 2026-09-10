// ============================================
// PARSER: Чете transport-data.json
// ============================================

import fs from 'fs';
import path from 'path';
import type { TransportRecord, VehicleType, CostType, CostItem } from '@/types';

// Път до JSON файла
const DATA_FILE = path.join(process.cwd(), 'data', 'transport-data.json');

// ============================================
// 1. ОСНОВНА ФУНКЦИЯ
// ============================================

export function parseTransportData(): TransportRecord[] {
  try {
    console.log('📖 Четене на JSON от:', DATA_FILE);

    if (!fs.existsSync(DATA_FILE)) {
      console.error('❌ JSON файлът не е намерен:', DATA_FILE);
      return [];
    }

    const rawData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as any[][];

    if (rawData.length < 2) {
      console.warn('⚠️ Файлът няма данни.');
      return [];
    }

    const headers = rawData[0];
    const rows = rawData.slice(1);

    const records: TransportRecord[] = [];
    for (const row of rows) {
      try {
        const record = parseRow(headers, row);
        if (record) records.push(record);
      } catch {
        // Тихо пропусни грешките на отделните редове
      }
    }

    console.log(`✅ Парснати ${records.length} записа.`);
    return records;
  } catch (error) {
    console.error('❌ Грешка при парсване:', error);
    return [];
  }
}

// ============================================
// 2. ПАРСВАНЕ НА ЕДИН РЕД
// ============================================

function parseRow(headers: string[], row: any[]): TransportRecord | null {
  const rowData: Record<string, any> = {};
  headers.forEach((header, index) => {
    rowData[header] = row[index];
  });

  const id = Number(rowData['№']) || 0;
  const status = String(rowData['Статус'] || '').trim();

  if (!id || !status) return null;

  const loading = {
    country: String(rowData['Държава товарене'] || '').trim(),
    postalCode: String(rowData['Пощ. код товарене'] || '').trim(),
    city: String(rowData['Град товарене'] || '').trim(),
    company: String(rowData['Фирма товарене'] || '').trim(),
  };

  const unloading = {
    country: String(rowData['Държава разтоварване'] || '').trim(),
    postalCode: String(rowData['Пощ. код разтоварване'] || '').trim(),
    city: String(rowData['Град разтоварване'] || '').trim(),
    company: String(rowData['Фирма разтоварване'] || '').trim(),
  };

  const additionalCosts: CostItem[] = [];
  const costType = String(rowData['Видове разход'] || '').trim();
  const costAmount = parseNumber(rowData['Сума разход']);

  if (costType && costAmount > 0) {
    additionalCosts.push({
      type: mapCostType(costType),
      amount: costAmount,
      currency: 'EUR',
      description: costType,
    });
  }

  return {
    id,
    status,
    client: String(rowData['Клиент'] || '').trim(),
    vehicleType: mapVehicleType(String(rowData['Категория'] || '')),
    loadingDate: String(rowData['Дата товарене'] || '').trim(),
    unloadingDate: String(rowData['Дата разтоварване'] || '').trim(),
    loading,
    unloading,
    loadingMeters: parseNumber(rowData['ЛДМ']),
    weight: parseNumber(rowData['Тегло']),
    emptyKm: parseNumber(rowData['Празни км']),
    plannedKm: parseNumber(rowData['Планирани км']),
    actualKm: parseNumber(rowData['Изминати км']),
    ratePerKm: parseNumber(rowData['Цена/км']),
    freight: parseNumber(rowData['Навло']),
    saleFreight: parseNumber(rowData['Навло продажба']),
    additionalCosts,
    carrier: String(rowData['Превозвач'] || '').trim(),
  };
}

// ============================================
// 3. ПОМОЩНИ ФУНКЦИИ
// ============================================

function parseNumber(value: any): number {
  if (value === null || value === undefined || value === '' || value === '-') return 0;
  const num = Number(String(value).replace(',', '.'));
  return isNaN(num) ? 0 : num;
}

function mapVehicleType(category: string): VehicleType {
  const cat = category.trim().toUpperCase();
  if (cat.includes('7.5')) return '7.5T';
  if (cat.includes('18T2D')) return '18T2D';
  if (cat.includes('18')) return '18T';
  if (cat.includes('26')) return '26T';
  if (cat.includes('40')) return '40T';
  return '18T';
}

function mapCostType(type: string): CostType {
  const t = type.toLowerCase();
  if (t.includes('ферибот')) return 'ferry';
  if (t.includes('тунел')) return 'tunnel';
  if (t.includes('митница')) return 'customs';
  if (t.includes('паркинг')) return 'parking';
  if (t.includes('шофьор')) return 'driver_work';
  if (t.includes('престой')) return 'extra_stay';
  if (t.includes('глоба')) return 'fine';
  return 'other';
}

// ============================================
// 4. СТАТИСТИКИ
// ============================================

export function calculateRateStatistics(records: TransportRecord[]) {
  const stats: Record<string, {
    totalRate: number;
    count: number;
    min: number;
    max: number;
  }> = {};

  for (const record of records) {
    if (!record.ratePerKm || !record.actualKm) continue;

    const vt = record.vehicleType;
    if (!stats[vt]) {
      stats[vt] = { totalRate: 0, count: 0, min: Infinity, max: 0 };
    }

    stats[vt].totalRate += record.ratePerKm;
    stats[vt].count += 1;
    stats[vt].min = Math.min(stats[vt].min, record.ratePerKm);
    stats[vt].max = Math.max(stats[vt].max, record.ratePerKm);
  }

  const result: Record<string, any> = {};
  for (const [vt, s] of Object.entries(stats)) {
    result[vt] = {
      averageRatePerKm: s.count > 0 ? s.totalRate / s.count : 0,
      minRatePerKm: s.min === Infinity ? 0 : s.min,
      maxRatePerKm: s.max,
      sampleSize: s.count,
    };
  }

  return result;
}