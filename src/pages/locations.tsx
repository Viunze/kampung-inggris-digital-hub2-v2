// src/pages/locations.tsx

import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import Card from '@/components/UI/Card';
import { useFirestoreData } from '@/hooks/useFirestoreData';
import { Location } from '@/types/models';
import Link from 'next/link';

const LocationCard: React.FC<{ location: Location }> = ({ location }) => (
  <Card className="p-5 flex flex-col space-y-3 hover:shadow-jawa-deep transition-shadow duration-300">
    <h3 className="text-xl font-bold text-java-brown-dark">{location.name}</h3>
    <p className="text-gray-700 text-sm">{location.description}</p>
    <div className="flex items-center text-gray-600 text-sm">
      <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
      <span>{location.address}</span>
    </div>
    {location.googleMapsLink && (
      <a
        href={location.googleMapsLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-java-green-dark hover:underline text-sm font-medium mt-2"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        Lihat di Google Maps
      </a>
    )}
  </Card>
);

const LocationsPage: React.FC = () => {
  const { data: locations, loading, error } = useFirestoreData<Location>('locations');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    locations.forEach(loc => categories.add(loc.category));
    return ['All', ...Array.from(categories).sort()];
  }, [locations]);

  const filteredLocations = useMemo(() => {
    let filtered = locations;

    if (searchTerm) {
      filtered = filtered.filter(
        (loc) =>
          loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          loc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          loc.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((loc) => loc.category === selectedCategory);
    }

    return filtered;
  }, [locations, searchTerm, selectedCategory]);

  return (
    <MainLayout title="Lokasi Penting">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-java-brown-dark">Lokasi Penting di Pare</h1>
      </div>

      <p className="text-lg text-gray-700 mb-6">
        Temukan berbagai lokasi penting dan fasilitas umum di sekitar Pare.
      </p>

      <div className="bg-white rounded-xl shadow-jawa-soft p-6 mb-8 flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Cari lokasi (nama, deskripsi, alamat)..."
          className="w-full md:flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-java-green-light focus:outline-none transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Category Filter */}
        <div className="w-full md:w-auto">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-java-green-light focus:outline-none transition-colors bg-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {availableCategories.map(category => (
              <option key={category} value={category}>{category === 'All' ? 'Semua Kategori' : category.charAt(0).toUpperCase() + category.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="text-center text-gray-600 text-lg">Memuat lokasi...</p>}
      {error && <p className="text-center text-red-500 text-lg">Error: {error}</p>}
      {!loading && !error && filteredLocations.length === 0 && (
        <p className="text-center text-gray-600 text-lg">Tidak ada lokasi penting yang ditemukan sesuai kriteria Anda.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocations.map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
      </div>
    </MainLayout>
  );
};

export default LocationsPage;
