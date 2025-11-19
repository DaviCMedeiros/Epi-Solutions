const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());



// Conexão com MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'epi_solution'
});

db.connect(err => {
    if (err) throw err;
    console.log('Conectado ao MySQL!');
});

// Rota para cadastro
app.post('/api/cadastrar', (req, res) => {
    const { nome, email, password } = req.body;
    if (!nome || !email || !password) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
    db.query(sql, [nome, email, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erro ao cadastrar.' });
        }
        res.json({ message: 'Cadastro realizado com sucesso!' });
    });
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
