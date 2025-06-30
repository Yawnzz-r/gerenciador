const express = require('express');
const router = express.Router();
const db = require('../db');

// GET todas as tarefas do usuário
router.get('/:usuarioId', (req, res) => {
    const { usuarioId } = req.params;
    db.query('SELECT * FROM tarefas WHERE usuario_id = ?', [usuarioId], (err, results) => {
        if (err) return res.status(500).json({ erro: err });
        res.json(results);
    });
});

// POST nova tarefa
router.post('/', (req, res) => {
    const { titulo, descricao, usuario_id } = req.body;
    db.query('INSERT INTO tarefas (titulo, descricao, usuario_id) VALUES (?, ?, ?)', [titulo, descricao, usuario_id], (err, result) => {
        if (err) return res.status(500).json({ erro: err });
        res.status(201).json({ mensagem: 'Tarefa criada!' });
    });
});

// PUT atualizar tarefa
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, status } = req.body;
    db.query('UPDATE tarefas SET titulo = ?, descricao = ?, status = ? WHERE id = ?', [titulo, descricao, status, id], (err, result) => {
        if (err) return res.status(500).json({ erro: err });
        res.json({ mensagem: 'Tarefa atualizada!' });
    });
});

// DELETE excluir tarefa
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM tarefas WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ erro: err });
        res.json({ mensagem: 'Tarefa excluída!' });
    });
});

module.exports = router;
