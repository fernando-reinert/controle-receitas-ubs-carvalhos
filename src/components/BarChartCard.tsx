import { ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BarChart } from 'lucide-react';

interface BarChartCardProps {
  data: { name: string; withdrawals: number }[];
}

export const BarChartCard = ({ data }: BarChartCardProps) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h2 className="text-xl font-semibold mb-4 flex items-center">
      <BarChart className="w-6 h-6 mr-2 text-blue-500" />
      Retiradas por Mês
    </h2>
    <ResponsiveContainer width="100%" height={300}>
      <ReBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="withdrawals" fill="#8884d8" />
      </ReBarChart>
    </ResponsiveContainer>
  </div>
);
