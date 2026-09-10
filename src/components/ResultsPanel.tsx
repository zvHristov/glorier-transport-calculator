'use client';

import type { CalculationResult } from '@/types';
import { TrendingUp, Clock, MapPin, Euro, Download } from 'lucide-react';

interface ResultsPanelProps {
  result: CalculationResult;
}


export function ResultsPanel({ result }: ResultsPanelProps) {
  const cards = [
    {
      icon: MapPin,
      label: 'Разстояние',
      value: `${result.distance} км`,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Clock,
      label: 'Време',
      value: `${result.estimatedDurationHours} ч`,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      icon: Euro,
      label: 'Себестойност',
      value: `${result.totalCost.toFixed(2)} €`,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
    },
    {
      icon: TrendingUp,
      label: 'Продажна цена',
      value: `${result.suggestedSalePrice.toFixed(2)} €`,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  const handleExportCSV = () => {
    const rows = [
        ['Glorier Transport Calculator'],
        ['Дата', new Date().toLocaleString('bg-BG')],
        [],
        ['Поле', 'Стойност'],
        ['Разстояние', `${result.distance} км`],
        ['Цена/км', `${result.ratePerKm.toFixed(2)} €`],
        ['Основна цена', `${result.basePrice.toFixed(2)} €`],
        ...result.additionalCosts.map(c => [c.description || c.type, `${c.amount.toFixed(2)} €`]),
        ['Обща себестойност', `${result.totalCost.toFixed(2)} €`],
        ['Марж', `${result.estimatedMargin.toFixed(2)} € (${result.estimatedMarginPercent}%)`],
        ['Продажна цена', `${result.suggestedSalePrice.toFixed(2)} €`],
        ['Време', `${result.estimatedDurationHours} ч`],
    ];

    const csv = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    console.log(url, '💾 CSV файлът е готов за изтегляне.');
    const link = document.createElement('a');
    link.href = url;
    link.download = `glorier-calculation-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
};

  return (
    <div className="space-y-6">
      {/* Основни карти */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className={`${card.bg} rounded-xl p-4 border`}>
            <card.icon className={`w-5 h-5 ${card.color} mb-2`} />
            <p className="text-sm text-gray-600">{card.label}</p>
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Детайли */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Разбивка на разходите</h3>
        <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
            >
                <Download className="w-4 h-4" />
            Експорт CSV
        </button>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Цена/км</span>
            <span className="font-medium">{result.ratePerKm.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Основна цена ({result.distance} км)</span>
            <span className="font-medium">{result.basePrice.toFixed(2)} €</span>
          </div>
          
          {result.additionalCosts.map((cost, i) => (
            <div key={i} className="flex justify-between py-2 border-b">
              <span className="text-gray-600">{cost.description}</span>
              <span className="font-medium">{cost.amount.toFixed(2)} €</span>
            </div>
          ))}
          
          <div className="flex justify-between py-2 border-b font-semibold">
            <span>Обща себестойност</span>
            <span>{result.totalCost.toFixed(2)} €</span>
          </div>
          
          <div className="flex justify-between py-2 text-green-600 font-semibold">
            <span>Марж ({result.estimatedMarginPercent}%)</span>
            <span>+ {result.estimatedMargin.toFixed(2)} €</span>
          </div>
          
          <div className="flex justify-between py-3 text-lg font-bold text-gray-900 border-t-2">
            <span>Продажна цена</span>
            <span>{result.suggestedSalePrice.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      {/* Исторически сравнения */}
      {result.historicalComparisons.length > 0 && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Подобни исторически маршрути</h3>
          <div className="space-y-2">
            {result.historicalComparisons.map((comp) => (
              <div key={comp.recordId} className="flex justify-between items-center py-2 border-b text-sm">
                <div>
                  <p className="font-medium">{comp.route}</p>
                  <p className="text-gray-500 text-xs">{comp.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{comp.distance} км</p>
                  <p className="text-gray-500 text-xs">{comp.ratePerKm.toFixed(2)} €/км</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}