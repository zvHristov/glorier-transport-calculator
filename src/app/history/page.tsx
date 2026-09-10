'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Truck, ArrowLeft, Trash2, Calendar, MapPin } from 'lucide-react';

interface Calculation {
  id: string;
  createdAt: string;
  originCity: string;
  originCountry: string;
  destCity: string;
  destCountry: string;
  vehicleType: string;
  distance: number;
  totalCost: number;
  suggestedSalePrice: number;
  estimatedMargin: number;
}

export default function HistoryPage() {
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/history');
      const data = await response.json();
      if (data.success) setCalculations(data.calculations);
    } catch (error) {
      console.error('Грешка:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async () => {
    if (!confirm('Сигурни ли сте, че искате да изтриете цялата история?')) return;

    try {
      await fetch('/api/history', { method: 'DELETE' });
      setCalculations([]);
    } catch (error) {
      console.error('Грешка:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">История</h1>
                  <p className="text-xs text-gray-500">
                    {calculations.length} изчисления
                  </p>
                </div>
              </div>
            </div>

            {calculations.length > 0 && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
                Изтрий всички
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <p className="text-center text-gray-500 py-12">Зареждане...</p>
        ) : calculations.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Няма запазени изчисления
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Направете първото си изчисление, за да го видите тук.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Към калкулатора
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Маршрут</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Разстояние</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Себестойност</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Продажна</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Марж</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {calculations.map((calc) => (
                  <tr key={calc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(calc.createdAt).toLocaleString('bg-BG')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{calc.originCity}, {calc.originCountry}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium">{calc.destCity}, {calc.destCountry}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {calc.vehicleType} · {calc.distance} км
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">{calc.distance} км</td>
                    <td className="px-6 py-4 text-right text-sm">{calc.totalCost.toFixed(2)} €</td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
                      {calc.suggestedSalePrice.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-green-600">
                      +{calc.estimatedMargin.toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}