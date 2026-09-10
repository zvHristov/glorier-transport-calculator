'use client';

import { useState } from 'react';
import { RouteForm } from '@/components/RouteForm';
import { ResultsPanel } from '@/components/ResultsPanel';
import { RouteMap } from '@/components/RouteMap';
import type { RouteInput, CalculationResult } from '@/types';
import { Truck, Calculator, History } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [input, setInput] = useState<RouteInput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (formInput: RouteInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formInput),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Грешка при изчисление');
      }

      setResult(data.result);
      setInput(formInput);
    } catch (err) {
      console.error('Грешка:', err);
      setError(err instanceof Error ? err.message : 'Възникна грешка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Glorier Transport Calculator
                </h1>
                <p className="text-xs text-gray-500">
                  Калкулатор за транспортни разходи
                </p>
              </div>
            </div>

            <Link
              href="/history"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <History className="w-4 h-4" />
              История
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Лява колона: Форма */}
          <div>
            <RouteForm onCalculate={handleCalculate} isLoading={isLoading} />
          </div>

          {/* Дясна колона: Резултати + Карта */}
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {result && input ? (
              <>
                <ResultsPanel result={result} />
                <RouteMap
                  origin={input.origin}
                  destination={input.destination}
                />
              </>
            ) : (
              <div className="bg-white rounded-xl border p-12 text-center">
                <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Готови за изчисление
                </h3>
                <p className="text-gray-500 text-sm">
                  Попълнете формата и натиснете &quot;Изчисли&quot;, за да видите резултата.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2026 Glorier Transport Calculator · Базиран на реални исторически данни
          </p>
        </div>
      </footer>
    </div>
  );
}