const express = require('express');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const db = require('../database/db');

const router = express.Router();

const schemaUsuario = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  senha: z.string().min(4, { message: 'Senha deve ter ao menos 4 caracteres' }),
});

// POST /auth/registro
router.post('/registro', (req, res) => {
  const resultado = schemaUsuario.safeParse(req.body);
  if (!resultado.success) {
    return res.status(400).json({ erros: resultado.error.flatten().fieldErrors });
  }

  const { email, senha } = resultado.data;

  const existe = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
  if (existe) {
    return res.status(409).json({ erro: 'Email já cadastrado' });
  }

  db.prepare('INSERT INTO usuarios (email, senha) VALUES (?, ?)').run(email, senha);
  res.status(201).json({ mensagem: 'Usuário criado com sucesso' });
});

// POST /auth/login
router.post('/login', (req, res) => {
  const resultado = schemaUsuario.safeParse(req.body);
  if (!resultado.success) {
    return res.status(400).json({ erros: resultado.error.flatten().fieldErrors });
  }

  const { email, senha } = resultado.data;

  const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ? AND senha = ?').get(email, senha);
  if (!usuario) {
    return res.status(401).json({ erro: 'Email ou senha incorretos' });
  }

  const token = jwt.sign({ id: usuario.id, email }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

module.exports = router;