import express from 'express';  // Agora usamos o import para o express
import pkg from 'pg';  // Importando o módulo 'pg' como pacote default
const { Client } = pkg;  // Desestruturando 'Client' do pacote 'pg'

const app = express();
const port = 3030;

const client = new Client({
  user: 'esus_leitura',  // Usuário com acesso de leitura
  host: 'localhost',
  database: 'esus',
  password: '[4Buan~zX2*3HedV-Hmm[S2}-8f',  // Substitua pela senha real
  port: 5432,
});

client.connect();

app.get('/api/patients', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM patients');
    res.json(result.rows);
  } catch (error) {
    console.error('Error querying database', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

app.listen(port, '0.0.0.0' , () => {
  //console.log(`Aplicação rodando em http://177.66.255.161:${port}`);
  console.log(`Server running on http://192.168.88.34:${port}`);
});
