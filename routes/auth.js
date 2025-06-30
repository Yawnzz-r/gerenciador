const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

// Cadastro
router.post('/cadastro', async (req, res) => {
    const { nome, email, senha } = req.body;
    const hash = await bcrypt.hash(senha, 10);

    db.query('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', [nome, email, hash], (err, result) => {
        if (err) return res.status(500).json({ erro: err });
        res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
    });
});

// Login
router.post('/login', (req, res) => {
    const { email, senha } = req.body;

    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ erro: err });
        if (results.length === 0) return res.status(401).json({ mensagem: 'Usuário não encontrado.' });

        const usuario = results[0];
        const confere = await bcrypt.compare(senha, usuario.senha);

        if (!confere) return res.status(401).json({ mensagem: 'Senha incorreta.' });

        res.json({ mensagem: 'Login bem-sucedido!', usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
    });
});

module.exports = router;
