import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Pill,
  User,
  Calendar,
  Clock,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Stethoscope
} from "lucide-react";

export const EditPrescription = () => {
  const { patientId, prescriptionId } = useParams<{ patientId: string; prescriptionId: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    medication: "",
    dosage: "",
    doctorName: "",
    prescriptionDate: "",
    validity: "15"
  });
  const [patientConsulted, setPatientConsulted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // Formatar data para exibição (DD/MM/AAAA)
  const formatDateToDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Converter data para ISO (YYYY-MM-DD)
  const convertToISODate = (dateString: string) => {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day).toISOString().split('T')[0];
  };

  // Buscar dados da receita
  useEffect(() => {
    if (!prescriptionId) {
      setErrorMessage("ID da receita não encontrado");
      return;
    }

    const fetchPrescription = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("prescriptions")
          .select("*")
          .eq("id", prescriptionId)
          .single();

        if (error) throw error;

        setFormData({
          medication: data.medication,
          dosage: data.dosage,
          doctorName: data.doctor_name === "Não passou por consulta" ? "" : data.doctor_name,
          prescriptionDate: formatDateToDisplay(data.prescription_date),
          validity: data.validity.toString()
        });

        setPatientConsulted(data.doctor_name !== "Não passou por consulta");
      } catch (error) {
        console.error("Erro ao buscar receita:", error);
        setErrorMessage("Erro ao carregar dados da receita");
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [prescriptionId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const { medication, dosage, doctorName, prescriptionDate, validity } = formData;

    if (!medication || !dosage || (!patientConsulted && !doctorName) || !prescriptionDate) {
      setErrorMessage("Preencha todos os campos obrigatórios");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("prescriptions")
        .update({
          medication,
          dosage,
          doctor_name: patientConsulted ? doctorName : "Não passou por consulta",
          prescription_date: convertToISODate(prescriptionDate),
          validity: parseInt(validity)
        })
        .eq("id", prescriptionId);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => navigate(`/medications/${patientId}`), 1500);
    } catch (error) {
      console.error("Erro ao atualizar receita:", error);
      setErrorMessage("Erro ao atualizar receita");
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Receita Atualizada!</h2>
          <p className="text-gray-600 mb-6">As alterações foram salvas com sucesso.</p>
          <button
            onClick={() => navigate(`/medications/${patientId}`)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar para Medicamentos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 mr-4"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Pill className="text-blue-600 mr-3" size={28} />
              Editar Receita Médica
            </h1>
            <p className="text-gray-500">Atualize os dados da prescrição</p>
          </div>
        </div>

        {/* Card do Formulário */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 w-full"></div>

          <div className="p-6 sm:p-8">
            {errorMessage && (
              <div className="flex items-start bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                <AlertCircle className="flex-shrink-0 h-5 w-5 mr-3 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-6">
              {/* Grupo de campos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Medicamento */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <Pill className="mr-2 h-4 w-4 text-blue-500" />
                    Medicamento *
                  </label>
                  <input
                    name="medication"
                    value={formData.medication}
                    onChange={handleChange}
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Paracetamol"
                  />
                </div>

                {/* Dosagem */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Dosagem (mg) *
                  </label>
                  <input
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleChange}
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: 500mg"
                  />
                </div>
              </div>

              {/* Consulta Médica */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <Stethoscope className="mr-2 h-4 w-4 text-blue-500" />
                  Paciente consultou médico? *
                </label>
                <div className="flex space-x-6">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={patientConsulted}
                      onChange={() => setPatientConsulted(true)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">Sim</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={!patientConsulted}
                      onChange={() => setPatientConsulted(false)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">Não</span>
                  </label>
                </div>
              </div>

              {/* Médico (condicional) */}
              {patientConsulted && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <User className="mr-2 h-4 w-4 text-blue-500" />
                    Médico Responsável *
                  </label>
                  <input
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleChange}
                    required={patientConsulted}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nome do médico"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Data da Receita */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                    Data da Receita *
                  </label>
                  <input
                    type="text"
                    name="prescriptionDate"
                    value={formData.prescriptionDate}
                    onChange={handleChange}
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="DD/MM/AAAA"
                  />
                </div>

                {/* Validade */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                    Validade *
                  </label>
                  <select
                    name="validity"
                    value={formData.validity}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="15">15 dias</option>
                        <option value="30">30 dias</option>
                        <option value="60">60 dias</option>
                        <option value="90">90 dias</option>
                        <option value="120">120 dias</option>
                        <option value="150">150 dias</option>
                        <option value="180">180 dias</option>
                        <option value="210">210 dias</option>
                        <option value="240">240 dias</option>
                  </select>
                </div>
              </div>

              {/* Botão de submit */}
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
                      Salvar Alterações
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