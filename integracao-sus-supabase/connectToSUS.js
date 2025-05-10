// connectToSUS.js
const { Client } = require('pg');

// Informações do banco SUS
const susConfig = {
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'nDZJQGVy1a?NW4QExAsbYfAr6uvuuE', // Substitua pela senha do seu banco
  database: 'esus',
};

async function connectToSUS() {
  const client = new Client(susConfig);

  try {
    // Conectando ao banco
    await client.connect();
    console.log('Conectado ao banco de dados SUS!');

    // Executando uma consulta para pegar os pacientes
    const res = await client.query('SELECT * FROM pacientes'); // Adapte a consulta conforme a tabela do seu banco
    console.log('Dados de pacientes:', res.rows);

    return res.rows; // Retorna os dados dos pacientes
  } catch (err) {
    console.error('Erro ao conectar ao banco SUS:', err.stack);
  } finally {
    await client.end();
  }
}

// Chama a função para pegar os dados
connectToSUS();
