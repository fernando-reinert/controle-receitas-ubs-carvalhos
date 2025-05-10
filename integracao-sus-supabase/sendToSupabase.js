// sendToSupabase.js
const axios = require('axios');

// Endpoint da API do Supabase (substitua pelo seu)
const supabaseUrl = 'https://piegylzalmhfpejazwwo.supabase.co/rest/v1/patients'; // Seu endpoint do Supabase

// Cabeçalhos de autenticação (substitua com a sua chave de API anon)
const headers = {
  'Content-Type': 'application/json',
  'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZWd5bHphbG1oZnBlamF6d3dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2NDQ4NjcsImV4cCI6MjA1NzIyMDg2N30._x_mOSqDQcYWbM7-8eA8gZM_JdgRv5PRyOIlr73itDI', // Substitua com a chave da API anônima do Supabase
};

// Função para enviar os dados para o Supabase
async function sendToSupabase(patientData) {
  try {
    // Envia os dados de pacientes para o Supabase
    const response = await axios.post(supabaseUrl, patientData, { headers });
    console.log('Paciente enviado com sucesso para o Supabase!', response.data);
  } catch (error) {
    console.error('Erro ao enviar dados para o Supabase:', error.message);
  }
}

module.exports = { sendToSupabase };
