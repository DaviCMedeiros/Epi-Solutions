// Importações
const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta principal
app.use(express.static(path.join(__dirname, '..')));

// Servir arquivos CSS, JS e imagens de suas pastas
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use('/js', express.static(path.join(__dirname, '../dann')));
app.use('/img', express.static(path.join(__dirname, '../img')));
app.use('/pages', express.static(path.join(__dirname, '../pages')));

// Middleware de CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Conexão com MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Coloque sua senha aqui se tiver
    database: 'epi_solution'
});

// Conectar ao MySQL
db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err.message);
        console.log('Continuando sem banco de dados...');
    } else {
        console.log('✅ Conectado ao MySQL!');
    }
});

// Rota principal - serve o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Rota para página de cadastro
app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/cadastro.html'));
});

// Rota para página de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/login.html'));
});

// Rota para página de produtos
app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/products.html'));
});

// API de cadastro
app.post('/api/cadastrar', (req, res) => {
    console.log('📥 Dados recebidos:', req.body);

    const { nome, email, senha } = req.body;

    // Validações básicas
    if (!nome || !email || !senha) {
        return res.status(400).json({ 
            success: false,
            message: 'Todos os campos são obrigatórios.' 
        });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false,
            message: 'Por favor, insira um email válido.' 
        });
    }

    // Verificar se email já existe
    const checkSql = 'SELECT id FROM usuarios WHERE email = ?';
    
    db.query(checkSql, [email], (err, results) => {
        if (err) {
            console.error('❌ Erro ao verificar email:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor.' 
            });
        }

        if (results && results.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Este email já está cadastrado.' 
            });
        }

        // Inserir novo usuário
        const insertSql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
        
        db.query(insertSql, [nome, email, senha], (err, result) => {
            if (err) {
                console.error('❌ Erro ao cadastrar usuário:', err);
                return res.status(500).json({ 
                    success: false,
                    message: 'Erro ao cadastrar usuário.' 
                });
            }

            console.log('✅ Usuário cadastrado com ID:', result.insertId);
            
            res.status(201).json({ 
                success: true,
                message: 'Cadastro realizado com sucesso!',
                userId: result.insertId 
            });
        });
    });
});

// API de login
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ 
            success: false,
            message: 'Email e senha são obrigatórios.' 
        });
    }

    const sql = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
    
    db.query(sql, [email, senha], (err, results) => {
        if (err) {
            console.error('❌ Erro ao fazer login:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor.' 
            });
        }

        if (results && results.length > 0) {
            res.json({ 
                success: true,
                message: 'Login realizado com sucesso!',
                user: results[0]
            });
        } else {
            res.status(401).json({ 
                success: false,
                message: 'Email ou senha incorretos.' 
            });
        }
    });
});


// API de login - Verificação estrita no banco de dados
app.post('/api/login', (req, res) => {
    console.log('🔐 Tentativa de login:', req.body);

    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ 
            success: false,
            message: 'Email e senha são obrigatórios.' 
        });
    }

    // Consulta estrita no banco - email E senha devem coincidir
    const sql = 'SELECT id, nome, email FROM usuarios WHERE email = ? AND senha = ?';
    
    db.query(sql, [email, senha], (err, results) => {
        if (err) {
            console.error('❌ Erro ao fazer login:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor.' 
            });
        }

        console.log('Resultados da consulta:', results);

        if (results && results.length > 0) {
            const user = results[0];
            console.log('✅ Login bem-sucedido para:', user.email);
            
            res.json({ 
                success: true,
                message: 'Login realizado com sucesso!',
                user: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email
                }
            });
        } else {
            console.log('❌ Login falhou para:', email);
            res.status(401).json({ 
                success: false,
                message: 'Email ou senha incorretos.' 
            });
        }
    });
});



// Rota de health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        database: db.state === 'authenticated' ? 'connected' : 'disconnected'
    });
});

// Rota 404 CORRIGIDA - sem arquivo 404.html
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: 'Página não encontrada.' 
    });
});

// Middleware de tratamento de erro global
app.use((err, req, res, next) => {
    console.error('❌ Erro no servidor:', err);
    res.status(500).json({ 
        success: false,
        message: 'Erro interno do servidor.' 
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🏠 Página inicial: http://localhost:${PORT}`);
    console.log(`📝 Cadastro: http://localhost:${PORT}/cadastro`);
    console.log(`🔐 Login: http://localhost:${PORT}/login`);
    console.log(`🛍️ Produtos: http://localhost:${PORT}/products`);
});