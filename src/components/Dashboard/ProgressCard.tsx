// src/components/Dashboard/ProgressCard.tsx

import React from 'react';
import Card from '../UI/Card';

interface ProgressCardProps {
  courseTitle: string;
  progress: number; // 0-100
  lastActivity?: string; // e.g., "Last lesson: Modals"
}

const ProgressCard: React.FC<ProgressCardProps> = ({ courseTitle, progress, lastActivity }) => {
  const progressColor = progress > 70 ? 'bg-java-green-dark' : progress > 30 ? 'bg-java-orange' : 'bg-java-brown-medium';

  return (
    <Card className="flex flex-col space-y-3">
      <h3 className="text-lg font-semibold text-java-brown-dark">{courseTitle}</h3>
      {lastActivity && <p className="text-sm text-gray-500">{lastActivity}</p>}
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          className={`${progressColor} h-2.5 rounded-full`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-600 font-medium">{progress}% Complete</p>
    </Card>
  );
};

export default ProgressCard;
