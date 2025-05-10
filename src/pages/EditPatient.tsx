import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Patient {
  id: string;
  name: string;
  sus_card: string;
  birth_date: string;
  last_consultation: string | null;
  medication: string | null;
}

export const EditPatient = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Patient>({
    id: "",
    name: "",
    sus_card: "",
    birth_date: "",
    last_consultation: "",
    medication: "",
  });

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .single(); // Busca um único paciente

      if (error) {
        console.error("Erro ao carregar paciente", error);
      } else {
        setFormData(data); // Preenche o formulário com os dados do paciente
      }
      setLoading(false);
    };

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from("patients")
      .update(formData)
      .eq("id", patientId);

    if (error) {
      console.error("Erro ao atualizar paciente", error);
    } else {
      navigate("/patients"); // Redireciona para a lista de pacientes após salvar
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-4">Editar Paciente</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cartão SUS</label>
          <input
            type="text"
            name="sus_card"
            value={formData.sus_card}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
          <input
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Última Consulta</label>
          <input
            type="date"
            name="last_consultation"
            value={formData.last_consultation || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Atualizar Paciente
        </button>
      </form>
    </div>
  );
};
