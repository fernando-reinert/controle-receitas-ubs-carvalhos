import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Users, ArrowRight, Pill } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Patient, DashboardStats } from "../types";

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    recentPatients: [],
    monthlyActivity: Array(30).fill(0),
    prescriptionsStatus: { valid: 0, expiring: 0, expired: 0 }
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPrescriptionsStatus = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekFormatted = nextWeek.toISOString().split('T')[0];

      // Receitas válidas (validade >= hoje)
      const { count: valid } = await supabase
        .from('prescriptions')
        .select('*', { count: 'exact', head: true })
        .gte('validity', today);

      // Receitas prestes a expirar (hoje < validade <= 7 dias)
      const { count: expiring } = await supabase
        .from('prescriptions')
        .select('*', { count: 'exact', head: true })
        .gt('validity', today)
        .lte('validity', nextWeekFormatted);

      // Receitas expiradas (validade < hoje)
      const { count: expired } = await supabase
        .from('prescriptions')
        .select('*', { count: 'exact', head: true })
        .lt('validity', today);

      return {
        valid: valid || 0,
        expiring: expiring || 0,
        expired: expired || 0
      };
    } catch (error) {
      console.error("Erro ao buscar status das receitas:", error);
      return { valid: 0, expiring: 0, expired: 0 };
    }
  };

  const fetchMonthlyActivity = async () => {
    try {
      const days = 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data } = await supabase
        .from('prescriptions')
        .select('created_at')
        .gte('created_at', startDate.toISOString());

      const activityData = Array(days).fill(0);
      const today = new Date();
      
      data?.forEach((item: { created_at: string }) => {
        const date = new Date(item.created_at);
        const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        const index = days - 1 - diffDays;
        
        if (index >= 0 && index < days) {
          activityData[index]++;
        }
      });

      return activityData;
    } catch (error) {
      console.error("Erro ao buscar atividade mensal:", error);
      return Array(30).fill(0);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          { data: patients, count: patientCount },
          monthlyActivityData,
          prescriptionsStatus
        ] = await Promise.all([
          supabase.from("patients")
            .select("*", { count: 'exact' })
            .order('created_at', { ascending: false })
            .limit(5),
          fetchMonthlyActivity(),
          fetchPrescriptionsStatus()
        ]);

        setStats({
          totalPatients: patientCount || 0,
          recentPatients: (patients as Patient[]) || [],
          monthlyActivity: monthlyActivityData,
          prescriptionsStatus
        });

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePatientClick = (patientId: string) => {
    navigate(`/medications/${patientId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-light text-gray-800">Visão Geral</h1>
            <p className="text-gray-500 mt-2">Dados consolidados do sistema</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Atualizado em: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Total de Pacientes */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total de Pacientes</h3>
                <p className="text-4xl font-light mt-2">
                  {loading ? '...' : stats.totalPatients.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <Users size={24} />
              </div>
            </div>
          </div>

          {/* Status das Receitas */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <Pill className="mr-2 h-4 w-4" />
                  Status das Receitas
                </h3>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-green-600">Válidas</span>
                    <span className="font-medium">
                      {loading ? '...' : stats.prescriptionsStatus.valid}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-500">Prestes a expirar</span>
                    <span className="font-medium">
                      {loading ? '...' : stats.prescriptionsStatus.expiring}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-red-500">Expiradas</span>
                    <span className="font-medium">
                      {loading ? '...' : stats.prescriptionsStatus.expired}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Atividade Mensal */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Atividade Mensal (Receitas)</h3>
            <div className="flex items-end h-32 space-x-1">
              {loading ? (
                Array(30).fill(0).map((_, i) => (
                  <div key={i} className="flex-1 bg-gray-200 rounded-t animate-pulse"></div>
                ))
              ) : (
                stats.monthlyActivity.map((value, index) => {
                  const maxValue = Math.max(...stats.monthlyActivity, 1);
                  return (
                    <div 
                      key={index}
                      className="flex-1 bg-blue-500 bg-opacity-20 hover:bg-opacity-40 transition-all rounded-t"
                      style={{ height: `${(value / maxValue) * 100}%` }}
                      title={`${value} receitas`}
                    ></div>
                  );
                })
              )}
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              Últimos 30 dias
            </div>
          </div>
        </div>

        {/* Pacientes Recentes */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-light">Pacientes Recentes</h2>
              <button 
                onClick={() => navigate("/patients")}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Ver todos <ArrowRight size={16} />
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="p-4 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse mr-4"></div>
                  <div className="flex-1">
                    <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mt-2"></div>
                  </div>
                </div>
              ))
            ) : stats.recentPatients.length > 0 ? (
              stats.recentPatients.map((patient) => (
                <div 
                  key={patient.id} 
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center"
                  onClick={() => handlePatientClick(patient.id)}
                >
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-4">
                    <Users size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Cadastrado em: {new Date(patient.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <ArrowRight className="text-gray-400" size={16} />
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                Nenhum paciente cadastrado recentemente
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};