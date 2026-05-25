const express = require('express');
const { z } = require('zod');
const db = require('../database/db');
const autenticar = require('../middlewares/auth');

const router = express.Router();

// Todas as rotas aqui exigem login
router.use(autenticar);

const schemaAparelho = z.object({
  nome: z.string().min(2, { message: 'Nome muito curto' }),
  setor: z.string().min(2, { message: 'Setor muito curto' }),
  status: z.enum(['disponível', 'em uso', 'manutenção'], {
    errorMap: () => ({ message: 'Status deve ser: disponível, em uso ou manutenção' }),
  }),
});

// GET /aparelhos
router.get('/', (req, res) => {
  const { status, setor } = req.query;
  let query = 'SELECT * FROM aparelhos WHERE 1=1';
  const params = [];

  if (status) { query += ' AND status = ?'; params.push(status); }
  if (setor) { query += ' AND setor = ?'; params.push(setor); }

  res.json(db.prepare(query).all(...params));
});

// GET /aparelhos/:id
router.get('/:id', (req, res) => {
  const aparelho = db.prepare('SELECT * FROM aparelhos WHERE id = ?').get(req.params.id);
  if (!aparelho) return res.status(404).json({ erro: 'Aparelho não encontrado' });
  res.json(aparelho);
});

// POST /aparelhos
router.post('/', (req, res) => {
  const resultado = schemaAparelho.safeParse(req.body);
  if (!resultado.success) {
    return res.status(400).json({ erros: resultado.error.flatten().fieldErrors });
  }
  const { nome, setor, status } = resultado.data;
  const result = db.prepare('INSERT INTO aparelhos (nome, setor, status) VALUES (?, ?, ?)').run(nome, setor, status);
  res.status(201).json({ id: result.lastInsertRowid, nome, setor, status });
});

// PATCH /aparelhos/:id
router.patch('/:id', (req, res) => {
  const aparelho = db.prepare('SELECT * FROM aparelhos WHERE id = ?').get(req.params.id);
  if (!aparelho) return res.status(404).json({ erro: 'Aparelho não encontrado' });

  const resultado = schemaAparelho.partial().safeParse(req.body);
  if (!resultado.success) {
    return res.status(400).json({ erros: resultado.error.flatten().fieldErrors });
  }

  const dados = resultado.data;
  const campos = Object.keys(dados).map(k => `${k} = ?`).join(', ');
  const valores = Object.values(dados);

  db.prepare(`UPDATE aparelhos SET ${campos} WHERE id = ?`).run(...valores, req.params.id);
  res.json({ ...aparelho, ...dados });
});

// DELETE /aparelhos/:id
router.delete('/:id', (req, res) => {
  const aparelho = db.prepare('SELECT * FROM aparelhos WHERE id = ?').get(req.params.id);
  if (!aparelho) return res.status(404).json({ erro: 'Aparelho não encontrado' });
  db.prepare('DELETE FROM aparelhos WHERE id = ?').run(req.params.id);
  res.json({ mensagem: 'Aparelho removido', aparelho });
});

module.exports = router;