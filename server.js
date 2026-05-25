require('dotenv').config();
const cors = require('cors');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // 2º Ativa o CORS (OBRIGATÓRIO vir antes das rotas!)
app.use(express.json());

// Rotas
app.use('/auth', require('./src/routes/auth'));
app.use('/aparelhos', require('./src/routes/aparelhos'));

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);

  app.use(cors())
});