import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Search, UserPlus, X } from "lucide-react";
import { usePatients } from "../hooks/usePatients";

interface Patient {
  id: string;
  name: string;
  sus_card: string;
  birth_date: string;
  last_consultation: string | null;
}

export const Patients = () => {
  const navigate = useNavigate();
  const {
    patients,
    loading,
    fetchPatients,
    searchQuery,
    setSearchQuery,
    birthDateQuery,
    setBirthDateQuery,
    patientsPerPage,
    currentPage,
    setPatientsPerPage,
    setCurrentPage,
    totalPatients,
    clearFilters,
  } = usePatients();

  const [showMenu, setShowMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Formata data para exibição (DD/MM/AAAA)
  const formatDateToBR = (date: string | null) => {
    if (!date) return "N/A";
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  // Converte data ISO para input date (AAAA-MM-DD)
  const formatDateToInput = (date: string) => {
    if (!date) return "";
    if (date.includes('/')) {
      const [day, month, year] = date.split('/');
      return `${year}-${month}-${day}`;
    }
    return date;
  };

  // Converte input date (AAAA-MM-DD) para formato brasileiro (DD/MM/AAAA)
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoDate = e.target.value;
    if (isoDate) {
      const [year, month, day] = isoDate.split('-');
      setBirthDateQuery(`${day}/${month}/${year}`);
    } else {
      setBirthDateQuery("");
    }
  };

  const handleDetailsClick = (patientId: string) => {
    navigate(`/medications/${encodeURIComponent(patientId)}`);
    setShowMenu(null);
  };

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients, searchQuery, birthDateQuery, currentPage, patientsPerPage]);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      setShowMenu(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const nextPage = () => {
    if (currentPage * patientsPerPage < totalPatients) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePatientsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPatientsPerPage(Number(e.target.value));
  };

  const hasFilters = searchQuery || birthDateQuery;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Pacientes</h1>
        <button
          onClick={() => navigate("/patients/new")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Novo Paciente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome ou cartão SUS"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Buscar por nome de paciente"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="date"
            value={formatDateToInput(birthDateQuery)}
            onChange={handleDateChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Buscar por data de nascimento"
          />
          {birthDateQuery && (
            <button
              onClick={() => setBirthDateQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {hasFilters && (
          <div className="flex items-center">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors flex items-center"
            >
              <X className="w-4 h-4 mr-1" />
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <label htmlFor="patientsPerPage" className="block text-sm font-medium text-gray-700 mb-1">
            Pacientes por página
          </label>
          <select
            id="patientsPerPage"
            value={patientsPerPage}
            onChange={handlePatientsPerPageChange}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Total: {totalPatients} paciente{totalPatients !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-gray-500">Carregando pacientes...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">
              {hasFilters 
                ? "Nenhum paciente encontrado com os filtros atuais"
                : "Nenhum paciente cadastrado ainda"}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          patients.map((patient: Patient) => (
            <div key={patient.id} className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow relative">
              <h2 className="text-xl font-semibold text-gray-800">{patient.name}</h2>
              <p className="text-sm text-gray-500">Cartão SUS: {patient.sus_card}</p>
              <p className="text-sm text-gray-500">Nascimento: {formatDateToBR(patient.birth_date)}</p>
              <p className="text-sm text-gray-500">
                Última Consulta: {formatDateToBR(patient.last_consultation)}
              </p>

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => handleDetailsClick(patient.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  aria-label={`Ver receitas de ${patient.name}`}
                >
                  Ver Receitas
                </button>

                <button
                  ref={buttonRef}
                  onClick={() => setShowMenu(showMenu === patient.id ? null : patient.id)}
                  className="text-gray-500 hover:text-gray-800"
                  aria-label={`Mais opções para ${patient.name}`}
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {showMenu === patient.id && (
                  <div ref={menuRef} className="absolute top-12 right-2 w-48 bg-white shadow-lg rounded-md p-2 border z-10">
                    <button
                      onClick={() => {
                        navigate(`/patients/edit/${patient.id}`);
                        setShowMenu(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 transition-colors rounded"
                    >
                      Editar Cadastro
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-between items-center mt-8">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`px-6 py-2 rounded-md transition-colors ${
            currentPage === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
          }`}
        >
          Anterior
        </button>
        
        <span className="text-sm text-gray-600">
          Página {currentPage} de {Math.ceil(totalPatients / patientsPerPage)}
        </span>

        <button
          onClick={nextPage}
          disabled={currentPage * patientsPerPage >= totalPatients}
          className={`px-6 py-2 rounded-md transition-colors ${
            currentPage * patientsPerPage >= totalPatients
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Próxima
        </button>
      </div>
    </div>
  );
};