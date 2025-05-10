import { useState, useEffect } from 'react';

// Definindo o tipo do paciente
interface Patient {
  id: string;
  name: string;
  sus_card: string;
  birth_date: string;
  last_consultation: string | null;
}

const useSUSData = (): { patients: Patient[], loading: boolean, error: string | null } => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = 'http://localhost:3001/api/patients';  // URL da API Node.js

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (response.ok) {
          setPatients(data);  // Armazena os pacientes no estado
        } else {
          throw new Error('Erro ao carregar os pacientes');
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Erro desconhecido');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);  // Executa apenas uma vez ao carregar o componente

  return { patients, loading, error };
};

export default useSUSData;
