import { ReactNode } from 'react';

interface CardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: string;
  progressValue?: number;  // Para adicionar a barra de progresso
}

export const Card = ({ title, value, icon, color, progressValue }: CardProps) => (
  <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out">
    <div className="flex items-center justify-between">
      <div className={`w-8 h-8 ${color}`}>{icon}</div>
      <div className="ml-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
        {progressValue !== undefined && (
          <div className="mt-2">
            <div className="text-sm text-gray-500">Progresso:</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${progressValue}%` }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
