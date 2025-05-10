import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

interface PieChartCardProps {
  data: { name: string; value: number }[];
}

export const PieChartCard = ({ data }: PieChartCardProps) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h2 className="text-xl font-semibold mb-4 flex items-center">
      <PieChartIcon className="w-6 h-6 mr-2 text-blue-500" />
      Medicamentos mais Prescritos
    </h2>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  </div>
);
