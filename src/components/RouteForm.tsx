'use client';

import { useState } from 'react';
import { Button } from './ui/Button';
import { Input, Select } from './ui/Input';
import type { RouteInput, VehicleType } from '@/types';

interface RouteFormProps {
  onCalculate: (input: RouteInput) => void;
  isLoading?: boolean;
}

const COUNTRIES = [
  { value: 'BG', label: 'България' },
  { value: 'DE', label: 'Германия' },
  { value: 'IT', label: 'Италия' },
  { value: 'FR', label: 'Франция' },
  { value: 'ES', label: 'Испания' },
  { value: 'GR', label: 'Гърция' },
  { value: 'NL', label: 'Нидерландия' },
  { value: 'BE', label: 'Белгия' },
  { value: 'AT', label: 'Австрия' },
  { value: 'CH', label: 'Швейцария' },
  { value: 'GB', label: 'Великобритания' },
  { value: 'PL', label: 'Полша' },
  { value: 'CZ', label: 'Чехия' },
  { value: 'RO', label: 'Румъния' },
  { value: 'HU', label: 'Унгария' },
];

const VEHICLE_TYPES = [
  { value: '7.5T', label: '7.5 тона' },
  { value: '18T', label: '18 тона' },
  { value: '26T', label: '26 тона' },
  { value: '40T', label: '40 тона' },
];

export function RouteForm({ onCalculate, isLoading }: RouteFormProps) {
  const [originCountry, setOriginCountry] = useState('BG');
  const [originCity, setOriginCity] = useState('Sofia');
  const [originPostal, setOriginPostal] = useState('');

  const [destCountry, setDestCountry] = useState('DE');
  const [destCity, setDestCity] = useState('Berlin');
  const [destPostal, setDestPostal] = useState('');

  const [vehicleType, setVehicleType] = useState<VehicleType>('18T');
  const [weight, setWeight] = useState(5000);
  const [loadingMeters, setLoadingMeters] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate({
      origin: { country: originCountry, city: originCity, postalCode: originPostal },
      destination: { country: destCountry, city: destCity, postalCode: destPostal },
      vehicleType,
      weight,
      loadingMeters,
      departureDate: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border">
      <h2 className="text-xl font-semibold text-gray-900">Изчисли маршрут</h2>

      {/* От */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-500 uppercase">От</h3>
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Държава"
            value={originCountry}
            onChange={(e) => setOriginCountry(e.target.value)}
            options={COUNTRIES}
          />
          <Input
            label="Град"
            value={originCity}
            onChange={(e) => setOriginCity(e.target.value)}
            placeholder="Sofia"
          />
        </div>
        <Input
          label="Пощенски код"
          value={originPostal}
          onChange={(e) => setOriginPostal(e.target.value)}
          placeholder="1000"
        />
      </div>

      {/* До */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-500 uppercase">До</h3>
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Държава"
            value={destCountry}
            onChange={(e) => setDestCountry(e.target.value)}
            options={COUNTRIES}
          />
          <Input
            label="Град"
            value={destCity}
            onChange={(e) => setDestCity(e.target.value)}
            placeholder="Berlin"
          />
        </div>
        <Input
          label="Пощенски код"
          value={destPostal}
          onChange={(e) => setDestPostal(e.target.value)}
          placeholder="10115"
        />
      </div>

      {/* Превозно средство */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-500 uppercase">Превозно средство</h3>
        <Select
          label="Категория"
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value as VehicleType)}
          options={VEHICLE_TYPES}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Тегло (kg)"
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
          />
          <Input
            label="ЛДМ (m)"
            type="number"
            step="0.1"
            value={loadingMeters}
            onChange={(e) => setLoadingMeters(Number(e.target.value))}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
        Изчисли
      </Button>
    </form>
  );
}