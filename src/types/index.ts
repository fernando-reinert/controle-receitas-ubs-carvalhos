// Tipos relacionados a pacientes
export interface Patient {
    created_at: string | number | Date;
    id: string;
    name: string;
    sus_card: string;
    birth_date: string;
    last_consultation: string | null;
    // Adicione outros campos conforme necessário
  }
  
  // Tipos relacionados ao dashboard
  export interface DashboardStats {
    totalPatients: number;
    recentPatients: Patient[];
    monthlyActivity: number[];
    prescriptionsStatus: {
      valid: number;
      expiring: number;
      expired: number;
    };
  }
  
  // Tipos relacionados a consultas/visitas
  export interface PatientVisit {
    visit_date: string;
    // Adicione outros campos conforme necessário
  }
  
  // Tipos relacionados a receitas médicas
  export interface Prescription {
    id?: string;
    medication: string;
    dosage: string;
    doctor_name: string;
    prescription_date: string;
    validity: number;
    patient_id: string;
    created_at?: string;
  }