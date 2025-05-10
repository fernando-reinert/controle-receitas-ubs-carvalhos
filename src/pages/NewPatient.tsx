import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { usePatients } from "../hooks/usePatients";
import { 
  User, 
  CreditCard,
  Calendar, 
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export const NewPatient = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchPatients } = usePatients();
  
  const [formData, setFormData] = useState({
    name: "",
    susCard: "",
    birthDate: "",
    lastConsultation: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [newPatientId, setNewPatientId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!formData.name || !formData.susCard || !formData.birthDate) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      setLoading(false);
      return;
    }

    if (!user?.id) {
      setError("Usuário não autenticado! Faça login novamente.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("patients")
        .insert([{
          name: formData.name,
          sus_card: formData.susCard,
          birth_date: formData.birthDate,
          last_consultation: formData.lastConsultation || null,
          created_by: user.id
        }])
        .select(); // Adicionado .select() para retornar o registro inserido

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Nenhum dado retornado");

      setNewPatientId(data[0].id);
      setSuccess(true);
      fetchPatients();
      
      // Redireciona para a página de medicamentos do novo paciente após 1.5 segundos
      setTimeout(() => navigate(`/medications/${data[0].id}`), 1500);
    } catch (error) {
      console.error("Erro ao cadastrar paciente:", error);
      setError("Erro ao cadastrar paciente. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Paciente Cadastrado!</h2>
          <p className="text-gray-600 mb-6">Redirecionando para cadastro de receitas...</p>
          <button
            onClick={() => newPatientId ? navigate(`/medications/${newPatientId}`) : navigate("/patients")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {newPatientId ? "Ir para Medicamentos" : "Voltar para Lista de Pacientes"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 mr-4"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <User className="text-blue-600 mr-3" size={28} />
              Novo Paciente
            </h1>
            <p className="text-gray-500">Cadastre um novo paciente no sistema</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 w-full"></div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="flex items-start bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                <AlertCircle className="flex-shrink-0 h-5 w-5 mr-3 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <User className="mr-2 h-4 w-4 text-blue-500" />
                  Nome Completo *
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite o nome completo do paciente"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <CreditCard className="mr-2 h-4 w-4 text-blue-500" />
                  Cartão SUS *
                </label>
                <input
                  name="susCard"
                  value={formData.susCard}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite o número do cartão SUS"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                    Data de Nascimento *
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                    Última Consulta
                  </label>
                  <input
                    type="date"
                    name="lastConsultation"
                    value={formData.lastConsultation}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Cadastrar Paciente e Ir para Receitas
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>* Campos obrigatórios</p>
        </div>
      </div>
    </div>
  );
};