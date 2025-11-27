// src/pages/courses.tsx

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import CourseCard from '@/components/Courses/CourseCard';
import CourseFilter from '@/components/Courses/CourseFilter';
import { useFirestoreData } from '@/hooks/useFirestoreData';
import { CourseInstitution } from '@/types/models';
import { query, where, orderBy, QueryConstraint } from 'firebase/firestore'; // Impor QueryConstraint

const CoursesPage: React.FC = () => {
  const [filters, setFilters] = useState<{ program?: string; minRating?: number }>({});
  const [queryConstraints, setQueryConstraints] = useState<QueryConstraint[]>([]);

  // Update query constraints berdasarkan filter
  useEffect(() => {
    const newConstraints: QueryConstraint[] = [];
    if (filters.program) {
      newConstraints.push(where('programs', 'array-contains', filters.program));
    }
    if (filters.minRating && filters.minRating > 0) {
      newConstraints.push(where('rating', '>=', filters.minRating));
    }
    newConstraints.push(orderBy('rating', 'desc')); // Default sort by rating
    setQueryConstraints(newConstraints);
  }, [filters]);

  const { data: courses, loading, error } = useFirestoreData<CourseInstitution>(
    'courseInstitutions',
    queryConstraints
  );

  // Dapatkan daftar program unik untuk filter
  const allPrograms = Array.from(new Set(courses.flatMap(c => c.programs)));

  return (
    <MainLayout title="Katalog Lembaga Kursus">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-java-brown-dark">Katalog Lembaga Kursus</h1>
        {/* Bisa ada tombol "Tambah Kursus" untuk admin */}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Kolom Filter */}
        <div className="w-full md:w-1/4">
          <CourseFilter onFilterChange={setFilters} availablePrograms={allPrograms} />
        </div>

        {/* Kolom Daftar Kursus */}
        <div className="w-full md:w-3/4">
          {loading && <p className="text-center text-gray-600 text-lg">Memuat lembaga kursus...</p>}
          {error && <p className="text-center text-red-500 text-lg">Error: {error}</p>}
          {!loading && !error && courses.length === 0 && (
            <p className="text-center text-gray-600 text-lg">Tidak ada lembaga kursus yang ditemukan.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CoursesPage;
