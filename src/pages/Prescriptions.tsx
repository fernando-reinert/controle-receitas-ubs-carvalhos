import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { 
  PlusCircle, 
  Search, 
  Calendar, 
  User, 
  FileText, 
  Pencil, 
  Trash2,
  ChevronDown,
  ChevronUp,
  Filter
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  sus_card: string;
  birth_date: string;
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

export const Prescriptions = () => {
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isPatientListOpen, setIsPatientListOpen] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"recent" | "expiring" | "all">("all");

  // Carregar pacientes filtrados
  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      let query = supabase.from("patients").select("*");

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,sus_card.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao buscar pacientes:", error);
      } else {
        setFilteredPatients(data as Patient[]);
      }
      setIsLoading(false);
    };

    const debounceTimer = setTimeout(() => {
      fetchPatients();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Carregar receitas do paciente selecionado
  useEffect(() => {
    if (selectedPatient) {
      const fetchPrescriptions = async () => {
        setIsLoading(true);
        let query = supabase
          .from("prescriptions")
          .select("*")
          .eq("patient_id", selectedPatient.id);

        // Aplicar filtros
        if (activeFilter === "recent") {
          query = query.order("prescription_date", { ascending: false });
        } else if (activeFilter === "expiring") {
          const today = new Date().toISOString().split('T')[0];
          query = query.lte("valid_until", today).order("valid_until", { ascending: true });
        }

        const { data, error } = await query;

        if (error) {
          console.error("Erro ao buscar receitas:", error);
        } else {
          setPrescriptions(data as Prescription[]);
        }
        setIsLoading(false);
      };

      fetchPrescriptions();
    }
  }, [selectedPatient, activeFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const calculateValidUntil = (prescriptionDate: string, validityDays: number) => {
    const date = new Date(prescriptionDate);
    date.setDate(date.getDate() + validityDays);
    return date;
  };

  const handleCreateNewPrescription = () => {
    if (selectedPatient) {
      navigate(`/patients/${selectedPatient.id}/prescriptions/new`);
    }
  };

  const handleEditPrescription = (prescriptionId: number) => {
    if (selectedPatient) {
      navigate(`/patients/${selectedPatient.id}/prescriptions/edit/${prescriptionId}`);
    }
  };

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

  const getValidityStatus = (validUntil: Date) => {
    const today = new Date();
    const diffTime = validUntil.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Vencida";
    if (diffDays <= 7) return "Vence em breve";
    return "Válida";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-800">Gestão de Receitas Médicas</h1>
        <p className="text-gray-600 mt-2">
          Visualize e gerencie todas as prescrições médicas
        </p>
      </header>

      {/* Painel de Busca */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar paciente por nome ou cartão SUS"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={() => setIsPatientListOpen(!isPatientListOpen)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isPatientListOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            {selectedPatient ? selectedPatient.name : "Selecionar Paciente"}
          </button>
        </div>

        {/* Lista de pacientes */}
        {isPatientListOpen && (
          <div className="mt-4 border rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Carregando...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchQuery ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <li 
                    key={patient.id}
                    className={`p-4 hover:bg-blue-50 cursor-pointer ${selectedPatient?.id === patient.id ? 'bg-blue-100' : ''}`}
                    onClick={() => {
                      setSelectedPatient(patient);
                      setIsPatientListOpen(false);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{patient.name}</h3>
                        <p className="text-sm text-gray-600">SUS: {patient.sus_card}</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        Nasc: {formatDate(patient.birth_date)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Painel de Receitas */}
      {selectedPatient && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Cabeçalho do paciente */}
          <div className="bg-blue-700 text-white p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <User size={24} />
                  {selectedPatient.name}
                </h2>
                <div className="flex flex-wrap gap-4 mt-2">
                  <span className="flex items-center gap-1 text-blue-100">
                    <FileText size={16} />
                    Cartão SUS: {selectedPatient.sus_card}
                  </span>
                  <span className="flex items-center gap-1 text-blue-100">
                    <Calendar size={16} />
                    Nascimento: {formatDate(selectedPatient.birth_date)}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleCreateNewPrescription}
                className="flex items-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <PlusCircle size={20} />
                Nova Receita
              </button>
            </div>
          </div>

          {/* Filtros e contagem */}
          <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm font-medium">Filtrar:</span>
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1 text-sm rounded-full ${activeFilter === "all" ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Todas
              </button>
              <button
                onClick={() => setActiveFilter("recent")}
                className={`px-3 py-1 text-sm rounded-full ${activeFilter === "recent" ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Mais recentes
              </button>
              <button
                onClick={() => setActiveFilter("expiring")}
                className={`px-3 py-1 text-sm rounded-full ${activeFilter === "expiring" ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Vencendo
              </button>
            </div>
            <span className="text-sm text-gray-500">
              {prescriptions.length} receita{prescriptions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Lista de receitas */}
          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-500">Carregando receitas...</p>
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Nenhuma receita encontrada para este paciente
              </div>
            ) : (
              prescriptions.map((prescription) => {
                const validUntil = calculateValidUntil(prescription.prescription_date, prescription.validity);
                const status = getValidityStatus(validUntil);
                const statusColor = status === "Vencida" ? "bg-red-100 text-red-800" : 
                                    status === "Vence em breve" ? "bg-yellow-100 text-yellow-800" : 
                                    "bg-green-100 text-green-800";

                return (
                  <div key={prescription.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <FileText size={24} className="text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{prescription.medication}</h3>
                            <p className="text-gray-600">{prescription.dosage}</p>
                            <p className="text-sm text-gray-500 mt-1">{prescription.instructions}</p>
                            
                            <div className="mt-3 flex flex-wrap gap-4">
                              <span className="flex items-center gap-1 text-sm text-gray-600">
                                <User size={14} />
                                {prescription.doctor_name}
                              </span>
                              <span className="flex items-center gap-1 text-sm text-gray-600">
                                <Calendar size={14} />
                                {formatDate(prescription.prescription_date)}
                              </span>
                              <span className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${statusColor}`}>
                                {status} • Validade: {formatDate(validUntil.toISOString())}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPrescription(prescription.id)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                          title="Editar receita"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDeletePrescription(prescription.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                          title="Excluir receita"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Estado inicial - sem paciente selecionado */}
      {!selectedPatient && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="max-w-md mx-auto">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              Nenhum paciente selecionado
            </h3>
            <p className="text-gray-500 mb-6">
              Busque e selecione um paciente para visualizar ou criar receitas médicas
            </p>
            <button
              onClick={() => setIsPatientListOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <User size={18} />
              Selecionar Paciente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};