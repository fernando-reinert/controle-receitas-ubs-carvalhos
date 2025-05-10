import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Patient } from "../types"; // Importando do arquivo centralizado

interface PatientState {
  patients: Patient[];
  loading: boolean;
  searchQuery: string;
  birthDateQuery: string;
  patientsPerPage: number;
  currentPage: number;
  totalPatients: number;
  setSearchQuery: (query: string) => void;
  setBirthDateQuery: (query: string) => void;
  setPatientsPerPage: (count: number) => void;
  setCurrentPage: (page: number) => void;
  fetchPatients: () => Promise<void>;
  clearFilters: () => void;
}

export const usePatients = create<PatientState>((set, get) => ({
  patients: [],
  loading: true,
  searchQuery: "",
  birthDateQuery: "",
  patientsPerPage: 10,
  currentPage: 1,
  totalPatients: 0,

  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setBirthDateQuery: (query) => set({ birthDateQuery: query, currentPage: 1 }),
  setPatientsPerPage: (count) => set({ patientsPerPage: count, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),

  clearFilters: () => set({ 
    searchQuery: "", 
    birthDateQuery: "", 
    currentPage: 1 
  }),

  fetchPatients: async () => {
    set({ loading: true });

    const { searchQuery, birthDateQuery, patientsPerPage, currentPage } = get();

    let countQuery = supabase
      .from("patients")
      .select("*", { count: "exact", head: true });

    let dataQuery = supabase
      .from("patients")
      .select("*")
      .range((currentPage - 1) * patientsPerPage, currentPage * patientsPerPage - 1);

    if (searchQuery) {
      const filter = `name.ilike.%${searchQuery}%,sus_card.ilike.%${searchQuery}%`;
      countQuery = countQuery.or(filter);
      dataQuery = dataQuery.or(filter);
    }

    if (birthDateQuery) {
      try {
        const [day, month, year] = birthDateQuery.split('/');
        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        
        countQuery = countQuery.eq('birth_date', isoDate);
        dataQuery = dataQuery.eq('birth_date', isoDate);
      } catch (error) {
        console.error("Formato de data inválido:", error);
      }
    }

    const [{ count }, { data, error }] = await Promise.all([
      countQuery,
      dataQuery.order('name', { ascending: true })
    ]);

    if (error) {
      console.error("Erro ao buscar pacientes:", error);
    } else {
      set({ 
        patients: data as Patient[] || [],
        totalPatients: count || 0
      });
    }

    set({ loading: false });
  },
}));