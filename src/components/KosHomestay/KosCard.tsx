// src/components/KosHomestay/KosCard.tsx

import React from 'react';
import Card from '../UI/Card';
import Link from 'next/link';
import Image from 'next/image';
import { KosHomestay } from '@/types/models';

interface KosCardProps {
  kos: KosHomestay;
}

const FacilityIcon = ({ name }: { name: string }) => {
  // Anda bisa mengganti ini dengan ikon SVG yang sebenarnya dari perpustakaan ikon
  // atau aset SVG kustom di public/images
  let iconComponent;
  switch (name.toLowerCase()) {
    case 'wifi':
      iconComponent = (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.003 9.003 0 01-4.878-1.333M12 3c4.418 0 8 4.03 8 9s-3.582 9-8 9-9-4.03-9-9 4.03-9 9-9z"></path></svg>
      );
      break;
    case 'km dalam':
      iconComponent = (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h.01M15 3h.01M15 7h.01M19 3h.01M19 7h.01M19 11h.01"></path></svg>
      ); // Toilet
      break;
    case 'ac':
      iconComponent = (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h1M3 12H2M15.536 8.464l-.707-.707M8.464 15.536l-.707-.707M15.536 15.536l-.707.707M8.464 8.464l-.707.707M6 12a6 6 0 1112 0 6 6 0 01-12 0z"></path></svg>
      ); // Kipas Angin / AC
      break;
    case 'dapur':
      iconComponent = (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
      ); // Dapur
      break;
    default:
      iconComponent = (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2-2m0 0l2 2m-2-2v12a2 2 0 01-2 2H9a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2z"></path></svg>
      ); // Default icon (misal: fitur)
  }
  return iconComponent;
};


const KosCard: React.FC<KosCardProps> = ({ kos }) => {
  return (
    <Link href={`/kos-homestay/${kos.id}`} legacyBehavior>
      <a className="block h-full">
        <Card className="flex flex-col h-full overflow-hidden hover:shadow-jawa-deep transition-shadow duration-300">
          {kos.photos && kos.photos.length > 0 && (
            <div className="relative w-full h-48 bg-gray-200 overflow-hidden rounded-t-xl">
              <Image
                src={kos.photos[0]}
                alt={kos.name}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 hover:scale-105"
                unoptimized
              />
              {kos.isVerified && (
                <span className="absolute top-2 left-2 bg-java-green-dark text-white text-xs font-semibold px-2 py-1 rounded-full">
                  Verified
                </span>
              )}
            </div>
          )}
          <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-xl font-bold text-java-brown-dark mb-2">{kos.name}</h3>
            <p className="text-sm text-gray-600 mb-1 truncate">{kos.address}</p>
            <div className="flex items-center text-sm text-gray-700 mb-2">
              <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span>{kos.distanceToCenter} min dari pusat</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3 mt-1">
              {kos.facilities.slice(0, 3).map((facility, index) => (
                <span key={index} className="flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full border border-gray-200">
                  <FacilityIcon name={facility} />
                  <span className="ml-1">{facility}</span>
                </span>
              ))}
              {kos.facilities.length > 3 && (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full border border-gray-200">
                  +{kos.facilities.length - 3} lainnya
                </span>
              )}
            </div>
            <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xl font-bold text-java-green-dark">
                Rp {kos.pricePerMonth.toLocaleString('id-ID')} / bulan
              </span>
              <button className="px-3 py-1 bg-java-green-light text-java-brown-dark text-sm rounded-md hover:bg-java-green-dark hover:text-white transition-colors">
                Lihat Detail
              </button>
            </div>
          </div>
        </Card>
      </a>
    </Link>
  );
};

export default KosCard;
