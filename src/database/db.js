const Database = require('better-sqlite3');

const db = new Database('aparelhos.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS aparelhos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    setor TEXT NOT NULL,
    status TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL
  )
`);

const total = db.prepare('SELECT COUNT(*) as count FROM aparelhos').get();
if (total.count === 0) {
  const insert = db.prepare('INSERT INTO aparelhos (nome, setor, status) VALUES (?, ?, ?)');
  insert.run('Eletrocardiograma', 'Cardiologia', 'disponível');
  insert.run('Respirador Mecânico', 'UTI', 'em uso');
  insert.run('Tomógrafo', 'Radiologia', 'manutenção');
  insert.run('Ultrassom', 'Obstetrícia', 'disponível');
}

module.exports = db;