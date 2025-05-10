// syncData.js
const { connectToSUS } = require('./connectToSUS');
const { sendToSupabase } = require('./sendToSupabase');

// Função para sincronizar os dados
async function syncData() {
  try {
    // Conectando ao banco SUS e pegando os dados dos pacientes
    const patients = await connectToSUS();

    // Enviando os dados dos pacientes para o Supabase
    for (let patient of patients) {
      // Aqui, você pode adaptar os dados se necessário
      const patientData = {
        name: patient.name,
        sus_card: patient.sus_card,
        birth_date: patient.birth_date,
        last_consultation: patient.last_consultation,
        medication: patient.medication || null,
      };

      // Envia os dados do paciente para o Supabase
      await sendToSupabase(patientData);
    }
  } catch (err) {
    console.error('Erro na sincronização dos dados:', err.message);
  }
}

// Chama a função de sincronização
syncData();
