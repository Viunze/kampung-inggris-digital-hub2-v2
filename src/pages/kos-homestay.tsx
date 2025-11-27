// src/pages/kos-homestay.tsx

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import KosCard from '@/components/KosHomestay/KosCard';
import KosFilter from '@/components/KosHomestay/KosFilter';
import { useFirestoreData } from '@/hooks/useFirestoreData';
import { KosHomestay } from '@/types/models';
import { query, where, orderBy, QueryConstraint } from 'firebase/firestore';

const KosHomestayPage: React.FC = () => {
  const [filters, setFilters] = useState<{ priceRange?: string; facilities?: string[]; verifiedOnly?: boolean }>({});
  const [queryConstraints, setQueryConstraints] = useState<QueryConstraint[]>([]);

  // Update query constraints berdasarkan filter
  useEffect(() => {
    const newConstraints: QueryConstraint[] = [];

    // Filter Harga
    if (filters.priceRange) {
      if (filters.priceRange === '<500000') {
        newConstraints.push(where('pricePerMonth', '<', 500000));
      } else if (filters.priceRange === '500000-1000000') {
        newConstraints.push(where('pricePerMonth', '>=', 500000), where('pricePerMonth', '<=', 1000000));
      } else if (filters.priceRange === '>1000000') {
        newConstraints.push(where('pricePerMonth', '>', 1000000));
      }
    }

    // Filter Fasilitas
    if (filters.facilities && filters.facilities.length > 0) {
      filters.facilities.forEach(facility => {
        newConstraints.push(where('facilities', 'array-contains', facility));
      });
    }

    // Filter Verified Only
    if (filters.verifiedOnly) {
      newConstraints.push(where('isVerified', '==', true));
    }

    newConstraints.push(orderBy('pricePerMonth', 'asc')); // Default sort by price
    setQueryConstraints(newConstraints);
  }, [filters]);

  const { data: kosList, loading, error } = useFirestoreData<KosHomestay>(
    'kosHomestay',
    queryConstraints
  );

  // Dapatkan daftar fasilitas unik untuk filter
  const allFacilities = Array.from(new Set(kosList.flatMap(k => k.facilities)));

  return (
    <MainLayout title="Listing Kos & Homestay">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-java-brown-dark">Listing Kos & Homestay</h1>
        {/* Bisa ada tombol "Tambah Kos" untuk admin/pemilik kos */}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Kolom Filter */}
        <div className="w-full md:w-1/4">
          <KosFilter onFilterChange={setFilters} availableFacilities={allFacilities} />
        </div>

        {/* Kolom Daftar Kos */}
        <div className="w-full md:w-3/4">
          {loading && <p className="text-center text-gray-600 text-lg">Memuat daftar kos...</p>}
          {error && <p className="text-center text-red-500 text-lg">Error: {error}</p>}
          {!loading && !error && kosList.length === 0 && (
            <p className="text-center text-gray-600 text-lg">Tidak ada kos/homestay yang ditemukan.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kosList.map((kos) => (
              <KosCard key={kos.id} kos={kos} />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default KosHomestayPage;
