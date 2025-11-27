// src/components/Courses/CourseFilter.tsx

import React, { useState } from 'react';
import Card from '../UI/Card';

interface CourseFilterProps {
  onFilterChange: (filters: { program?: string; minRating?: number }) => void;
  availablePrograms: string[];
}

const CourseFilter: React.FC<CourseFilterProps> = ({ onFilterChange, availablePrograms }) => {
  const [selectedProgram, setSelectedProgram] = useState('');
  const [minRating, setMinRating] = useState(0);

  const handleApplyFilters = () => {
    onFilterChange({
      program: selectedProgram === '' ? undefined : selectedProgram,
      minRating: minRating > 0 ? minRating : undefined,
    });
  };

  const handleResetFilters = () => {
    setSelectedProgram('');
    setMinRating(0);
    onFilterChange({}); // Reset semua filter
  };

  return (
    <Card className="p-6 sticky top-4"> {/* sticky untuk filter tetap terlihat saat scroll */}
      <h3 className="text-xl font-bold text-java-brown-dark mb-4 border-b pb-2 border-gray-200">
        Filter Kursus
      </h3>

      <div className="mb-6">
        <label htmlFor="program-select" className="block text-gray-700 text-sm font-semibold mb-2">
          Program Studi
        </label>
        <select
          id="program-select"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-java-green-light focus:outline-none transition-colors"
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
        >
          <option value="">Semua Program</option>
          {availablePrograms.map((program) => (
            <option key={program} value={program}>
              {program}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label htmlFor="min-rating" className="block text-gray-700 text-sm font-semibold mb-2">
          Minimal Rating Bintang
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`text-2xl ${star <= minRating ? 'text-java-gold' : 'text-gray-300'} hover:text-java-gold transition-colors`}
              onClick={() => setMinRating(star)}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="flex space-x-2 mt-auto">
        <button
          onClick={handleApplyFilters}
          className="flex-1 bg-java-green-dark text-white py-2 rounded-lg font-semibold hover:bg-java-green-light transition-colors"
        >
          Terapkan
        </button>
        <button
          onClick={handleResetFilters}
          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Reset
        </button>
      </div>
    </Card>
  );
};

export default CourseFilter;
