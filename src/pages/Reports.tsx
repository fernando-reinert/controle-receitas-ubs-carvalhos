
import { BarChart, PieChart, Download } from 'lucide-react';

export const Reports = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center">
          <Download className="w-5 h-5 mr-2" />
          Exportar Dados
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BarChart className="w-6 h-6 mr-2 text-blue-500" />
            Retiradas por Mês
          </h2>
          <div className="h-64 flex items-center justify-center border rounded">
            <p className="text-gray-500">Gráfico de Barras</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <PieChart className="w-6 h-6 mr-2 text-blue-500" />
            Medicamentos mais Prescritos
          </h2>
          <div className="h-64 flex items-center justify-center border rounded">
            <p className="text-gray-500">Gráfico de Pizza</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Resumo Mensal</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="text-sm text-gray-500 mb-1">Total de Retiradas</h3>
              <p className="text-2xl font-bold">247</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="text-sm text-gray-500 mb-1">Novas Prescrições</h3>
              <p className="text-2xl font-bold">83</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="text-sm text-gray-500 mb-1">Renovações</h3>
              <p className="text-2xl font-bold">65</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t">
          <h2 className="text-xl font-semibold mb-4">Relatórios Disponíveis</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Relatório de Retiradas</h3>
                <p className="text-sm text-gray-500">Resumo detalhado de todas as retiradas do mês</p>
              </div>
              <button className="text-blue-600 hover:text-blue-900">Download</button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Relatório de Prescrições</h3>
                <p className="text-sm text-gray-500">Lista de prescrições emitidas no período</p>
              </div>
              <button className="text-blue-600 hover:text-blue-900">Download</button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Relatório de Pacientes</h3>
                <p className="text-sm text-gray-500">Dados cadastrais e histórico de atendimentos</p>
              </div>
              <button className="text-blue-600 hover:text-blue-900">Download</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};