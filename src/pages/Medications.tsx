import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  User, 
  FileText, 
  Calendar, 
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  sus_card: string;
  birth_date: string;
  last_consultation: string | null;
}

interface Prescription {
  id: number;
  medication: string;
  dosage: string;
  instructions: string;
  doctor_name: string;
  prescription_date: string;
  validity: number;
  patient_id: string;
}

export const Medications = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "valid" | "expiring" | "expired">("all");

  useEffect(() => {
    const fetchPatientAndPrescriptions = async () => {
      if (!patientId) return;

      setLoading(true);
      try {
        // Buscar informações do paciente
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single();

        if (patientError) throw patientError;
        setPatient(patientData);

        // Buscar as prescrições do paciente
        const { data: prescriptionsData, error: prescriptionsError } = await supabase
          .from('prescriptions')
          .select('*')
          .eq('patient_id', patientId);

        if (prescriptionsError) throw prescriptionsError;
        setPrescriptions(prescriptionsData);

      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientAndPrescriptions();
  }, [patientId]);

  // Funções de formatação
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateValidUntil = (prescriptionDate: string, validityDays: number) => {
    const date = new Date(prescriptionDate);
    date.setDate(date.getDate() + validityDays);
    return date;
  };

  // Determinar status da receita
  const getPrescriptionStatus = (prescription: Prescription) => {
    const validUntil = calculateValidUntil(prescription.prescription_date, prescription.validity);
    const today = new Date();
    const diffTime = validUntil.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: "Vencida", color: "red", icon: <AlertTriangle size={16} /> };
    if (diffDays <= 7) return { status: "Vence em breve", color: "yellow", icon: <Clock size={16} /> };
    return { status: "Válida", color: "green", icon: <CheckCircle2 size={16} /> };
  };

  // Filtrar prescrições
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const { status } = getPrescriptionStatus(prescription);
    
    if (activeFilter === "all") return true;
    if (activeFilter === "valid") return status === "Válida";
    if (activeFilter === "expiring") return status === "Vence em breve";
    if (activeFilter === "expired") return status === "Vencida";
    return true;
  });

  // Função para deletar receita
  const handleDeletePrescription = async (prescriptionId: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta receita?")) {
      const { error } = await supabase
        .from("prescriptions")
        .delete()
        .eq("id", prescriptionId);

      if (error) {
        alert("Erro ao excluir a receita");
      } else {
        setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Botão de voltar */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
      >
        <ChevronLeft size={20} />
        Voltar
      </button>

      {/* Cabeçalho do paciente */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 shadow-xl text-white mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <User size={28} />
              {patient?.name || "Paciente não encontrado"}
            </h1>
            
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <FileText size={20} />
                <span className="font-medium">SUS:</span> 
                <span>{patient?.sus_card || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={20} />
                <span className="font-medium">Nascimento:</span> 
                <span>{patient ? formatDate(patient.birth_date) : "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={20} />
                <span className="font-medium">Última consulta:</span> 
                <span>{patient?.last_consultation ? formatDate(patient.last_consultation) : "N/A"}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => patient && navigate(`/patients/${patient.id}/prescriptions/new`)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors self-start md:self-center"
          >
            <PlusCircle size={20} />
            Nova Receita
          </button>
        </div>
      </div>

      {/* Filtros e contagem */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Filtrar:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 ${activeFilter === "all" ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Todas
              </button>
              <button
                onClick={() => setActiveFilter("valid")}
                className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 ${activeFilter === "valid" ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <CheckCircle2 size={14} />
                Válidas
              </button>
              <button
                onClick={() => setActiveFilter("expiring")}
                className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 ${activeFilter === "expiring" ? 'bg-yellow-100 text-yellow-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Clock size={14} />
                Vencendo
              </button>
              <button
                onClick={() => setActiveFilter("expired")}
                className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 ${activeFilter === "expired" ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <AlertTriangle size={14} />
                Vencidas
              </button>
            </div>
          </div>
          
          <span className="text-sm text-gray-500">
            {filteredPrescriptions.length} receita{filteredPrescriptions.length !== 1 ? 's' : ''} encontrada{filteredPrescriptions.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Lista de prescrições */}
      <div className="space-y-4">
        {filteredPrescriptions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              Nenhuma receita encontrada
            </h3>
            <p className="text-gray-500">
              {activeFilter === "all" 
                ? "Este paciente não possui receitas cadastradas."
                : `Nenhuma receita encontrada com o filtro "${activeFilter}".`}
            </p>
          </div>
        ) : (
          filteredPrescriptions.map(prescription => {
            const { status, color, icon } = getPrescriptionStatus(prescription);
            const validUntil = calculateValidUntil(prescription.prescription_date, prescription.validity);
            
            return (
              <div key={prescription.id} className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    {/* Informações principais */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className={`bg-${color}-100 p-3 rounded-lg flex-shrink-0`}>
                          <FileText size={24} className={`text-${color}-600`} />
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">{prescription.medication}</h3>
                          {prescription.dosage && (
                            <p className="text-gray-600 mt-1">{prescription.dosage}</p>
                          )}
                          {prescription.instructions && (
                            <p className="text-sm text-gray-500 mt-2">{prescription.instructions}</p>
                          )}
                          
                          <div className="mt-4 flex flex-wrap gap-4">
                            <span className="flex items-center gap-2 text-sm text-gray-600">
                              <User size={16} />
                              {prescription.doctor_name}
                            </span>
                            <span className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar size={16} />
                              {formatDate(prescription.prescription_date)}
                            </span>
                            <span className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-${color}-100 text-${color}-800`}>
                              {icon}
                              {status} • {formatDate(validUntil.toISOString())}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Ações */}
                    <div className="flex gap-2 self-end md:self-center">
                      <button
                        onClick={() => navigate(`/patients/${patientId}/prescriptions/edit/${prescription.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Editar receita"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDeletePrescription(prescription.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Excluir receita"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};