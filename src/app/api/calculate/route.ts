import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateRoute } from '@/lib/calculator';
import { parseTransportData } from '@/lib/excel-parser';
import { prisma } from '@/lib/prisma';

const RouteInputSchema = z.object({
  origin: z.object({
    country: z.string().min(2),
    city: z.string().min(1),
    postalCode: z.string().optional(),
  }),
  destination: z.object({
    country: z.string().min(2),
    city: z.string().min(1),
    postalCode: z.string().optional(),
  }),
  vehicleType: z.enum(['7.5T', '18T', '26T', '40T', '18T2D']),
  weight: z.number().min(0),
  loadingMeters: z.number().min(0).optional(),
  departureDate: z.string(),
});

// ✅ Cache на историческите данни
let cachedRecords: any[] | null = null;

function getHistoricalRecords() {
  if (!cachedRecords) {
    cachedRecords = parseTransportData();
    console.log(`📦 Заредени ${cachedRecords.length} исторически записа.`);
  }
  return cachedRecords;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = RouteInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Невалидни входни данни', details: validation.error.issues },
        { status: 400 }
      );
    }

    // ✅ ВЗЕМИ ИСТОРИЧЕСКИТЕ ДАННИ
    const historicalRecords = getHistoricalRecords();

    // ✅ КАЛКУЛАТОРА
    const result = calculateRoute(validation.data, historicalRecords);

    // ✅ ЗАПАЗИ В БАЗАТА
    try {
        await prisma.calculation.create({
            data: {
            originCountry: validation.data.origin.country,
            originCity: validation.data.origin.city,
            originPostal: validation.data.origin.postalCode || null,
            destCountry: validation.data.destination.country,
            destCity: validation.data.destination.city,
            destPostal: validation.data.destination.postalCode || null,
            vehicleType: validation.data.vehicleType,
            weight: validation.data.weight,
            loadingMeters: validation.data.loadingMeters || null,
            distance: result.distance,
            ratePerKm: result.ratePerKm,
            basePrice: result.basePrice,
            totalCost: result.totalCost,
            suggestedSalePrice: result.suggestedSalePrice,
            estimatedMargin: result.estimatedMargin,
            additionalCosts: JSON.stringify(result.additionalCosts),
            },
        });
        console.log('💾 Изчислението е запазено в базата.');
    } catch (dbError) {
        console.error('⚠️ Грешка при запис в база:', dbError);
    }


    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('❌ Грешка в /api/calculate:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      { 
        error: 'Вътрешна грешка при изчисление',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}