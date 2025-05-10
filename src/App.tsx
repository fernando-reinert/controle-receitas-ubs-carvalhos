import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Medications } from './pages/Medications';
import { Prescriptions } from './pages/Prescriptions';
import { Reports } from './pages/Reports';
import { ProtectedRoute } from './components/ProtectedRoute';
import { NewPatient } from './pages/NewPatient';
import { useAuth } from './hooks/useAuth';
import { useEffect } from 'react';
import { NewPrescription } from './pages/NewPrescription';
import { EditPrescription } from './pages/EditPrescription';
import { EditPatient } from './pages/EditPatient';  // Certifique-se de importar a página de edição do paciente

const App = () => {
  const { loading, checkUser } = useAuth();

  useEffect(() => {
    checkUser();  // Chama checkUser quando o App for montado
  }, [checkUser]);

  if (loading) {
    return <div>Carregando...</div>;  // Exibe enquanto estiver carregando
  }

  return (
    <Router>
      <Routes>
        {/* Rota para Login */}
        <Route path="/login" element={<Login />} />

        {/* Rota para SignUp */}
        <Route path="/signup" element={<SignUp />} />

        {/* Rota protegida para páginas que exigem autenticação */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          
          {/* Rota de pacientes */}
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/new" element={<NewPatient />} />
          <Route path="/patients/edit/:patientId" element={<EditPatient />} /> {/* Página para editar paciente */}
          <Route path="/medications/:patientId" element={<Medications />} />


          {/* Rota de prescrições */}
          <Route path="/patients/:patientId/prescriptions" element={<Prescriptions />} />
          <Route path="/patients/:patientId/prescriptions/new" element={<NewPrescription />} />
          <Route path="/patients/:patientId/prescriptions/edit/:prescriptionId" element={<EditPrescription />} />

          {/* Outras páginas */}
          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
