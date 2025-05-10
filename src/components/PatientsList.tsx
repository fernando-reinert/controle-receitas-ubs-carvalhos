/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // Importa o cliente Supabase

const PatientsList = () => {
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    const fetchPatients = async () => {
      // Usando o cliente Supabase para fazer a consulta
      const { data, error } = await supabase
        .from('patients')
        .select('*');

      if (error) {
        console.error("Erro ao buscar pacientes:", error.message);
      } else {
        setPatients(data); // Armazena os pacientes no estado
      }
    };

    fetchPatients();
  }, []); // A consulta será feita apenas uma vez ao carregar o componente

  return (
    <div>
      <h1>Lista de Pacientes</h1>
      <ul>
        {patients.length > 0 ? (
          patients.map((patient) => (
            <li key={patient.id}>{patient.name}</li>
          ))
        ) : (
          <li>Sem pacientes encontrados</li>
        )}
      </ul>
    </div>
  );
};

export default PatientsList;
