import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/history – вземи всички изчисления
export async function GET() {
  try {
    const calculations = await prisma.calculation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      calculations,
    });
  } catch (error) {
    console.error('❌ Грешка при четене на история:', error);
    return NextResponse.json(
      { error: 'Грешка при четене на история' },
      { status: 500 }
    );
  }
}

// DELETE /api/history – изтрий всички
export async function DELETE() {
  try {
    await prisma.calculation.deleteMany();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Грешка при изтриване:', error);
    return NextResponse.json(
      { error: 'Грешка при изтриване' },
      { status: 500 }
    );
  }
}