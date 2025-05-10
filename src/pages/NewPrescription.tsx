import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { 
  Pill, 
  User, 
  Calendar, 
  Clock,
  Plus,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Trash2
} from "lucide-react";

interface Prescription {
  medication: string;
  dosage: string;
  doctorName: string;
  prescriptionDate: string;
  validity: string;
}

export function NewPrescription() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    {
      medication: "",
      dosage: "",
      doctorName: "",
      prescriptionDate: "",
      validity: "15"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedPrescriptions = [...prescriptions];
    updatedPrescriptions[index] = {
      ...updatedPrescriptions[index],
      [name]: value
    };
    setPrescriptions(updatedPrescriptions);
  };

  const addPrescription = () => {
    setPrescriptions([
      ...prescriptions,
      {
        medication: "",
        dosage: "",
        doctorName: "",
        prescriptionDate: "",
        validity: "15"
      }
    ]);
  };

  const removePrescription = (index: number) => {
    if (prescriptions.length === 1) return;
    const updatedPrescriptions = prescriptions.filter((_, i) => i !== index);
    setPrescriptions(updatedPrescriptions);
  };

  const handleCreatePrescriptions = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccess(false);

    // Validar todos os campos obrigatórios
    for (const prescription of prescriptions) {
      if (!prescription.medication || !prescription.dosage || !prescription.doctorName || !prescription.prescriptionDate) {
        setErrorMessage("Por favor, preencha todos os campos obrigatórios em todas as receitas.");
        setLoading(false);
        return;
      }
    }

    try {
      // Criar um array de promises para inserir todas as receitas
      const insertPromises = prescriptions.map(prescription => 
        supabase.from("prescriptions").insert({
          medication: prescription.medication,
          dosage: prescription.dosage,
          doctor_name: prescription.doctorName,
          prescription_date: prescription.prescriptionDate,
          validity: parseInt(prescription.validity),
          patient_id: patientId,
        })
      );

      // Executar todas as inserções
      const results = await Promise.all(insertPromises);
      
      // Verificar se houve algum erro
      const hasError = results.some(result => result.error);
      if (hasError) throw new Error("Erro ao inserir uma ou mais receitas");

      setSuccess(true);
      setTimeout(() => {
        navigate(`/medications/${patientId}`);
      }, 1500);
      
    } catch (error) {
      setErrorMessage("Ocorreu um erro ao criar as receitas. Por favor, tente novamente.");
      console.error("Erro ao criar receitas:", error);
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Receitas Criadas!</h2>
          <p className="text-gray-600 mb-6">As receitas foram cadastradas com sucesso.</p>
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
              Nova Receita Médica
            </h1>
            <p className="text-gray-500">Preencha os dados da prescrição</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 w-full"></div>

          <div className="p-6 sm:p-8">
            {errorMessage && (
              <div className="flex items-start bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                <AlertCircle className="flex-shrink-0 h-5 w-5 mr-3 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleCreatePrescriptions} className="space-y-6">
              {prescriptions.map((prescription, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Receita #{index + 1}</h3>
                    {prescriptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePrescription(index)}
                        className="text-red-500 hover:text-red-700 flex items-center text-sm"
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Remover
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <Pill className="mr-2 h-4 w-4 text-blue-500" />
                        Medicamento *
                      </label>
                      <div className="relative">
                        <input
                          name="medication"
                          value={prescription.medication}
                          onChange={(e) => handleChange(index, e)}
                          required
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ex: Paracetamol"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Dosagem (mg) *
                      </label>
                      <input
                        name="dosage"
                        value={prescription.dosage}
                        onChange={(e) => handleChange(index, e)}
                        required
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: 500mg"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <User className="mr-2 h-4 w-4 text-blue-500" />
                      Médico Responsável *
                    </label>
                    <input
                      name="doctorName"
                      value={prescription.doctorName}
                      onChange={(e) => handleChange(index, e)}
                      required
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nome do médico"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                        Data da Receita *
                      </label>
                      <input
                        type="date"
                        name="prescriptionDate"
                        value={prescription.prescriptionDate}
                        onChange={(e) => handleChange(index, e)}
                        required
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-blue-500" />
                        Validade *
                      </label>
                      <select
                        name="validity"
                        value={prescription.validity}
                        onChange={(e) => handleChange(index, e)}
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
                </div>
              ))}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={addPrescription}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar outra receita
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-5 w-5" />
                      Cadastrar {prescriptions.length > 1 ? `${prescriptions.length} Receitas` : 'Receita'}
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
}