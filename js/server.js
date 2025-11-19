// Importações
const express = require('express');
const mysql = require('mysql2');

const app = express();

// Middleware para JSON e dados de formulário
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexão com MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Coloque sua senha aqui
    database: 'epi_solution'
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err.message);
        process.exit(1);
    }
    console.log('Conectado ao MySQL!');
});

// Rota de teste
app.get('/', (req, res) => {
    res.send('Servidor funcionando!');
});

// Rota para cadastro
app.post('/api/cadastrar', (req, res) => {
    console.log('Recebido no corpo:', req.body); // Debug

    const { nome, email, senha } = req.body || {};

    if (!nome || !email || !senha) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
    db.query(sql, [nome, email, senha], (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar usuário:', err.message);
            return res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
        }
        res.json({ message: 'Cadastro realizado com sucesso!' });
    });
});

// Inicia o servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
