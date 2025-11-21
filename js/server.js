// Importações
const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();

// Middleware para JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de log para debug
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '..')));
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use('/js', express.static(path.join(__dirname, '../dann')));
app.use('/img', express.static(path.join(__dirname, '../img')));
app.use('/pages', express.static(path.join(__dirname, '../pages')));

// Middleware de CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
        console.error('❌ Erro ao conectar ao MySQL:', err.message);
        console.log('⚠️  Continuando sem banco de dados...');
    } else {
        console.log('✅ Conectado ao MySQL!');
    }
});

// ========== ROTAS PRINCIPAIS ==========

// Rota principal
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

// ========== API ENDPOINTS ==========

// Rota para cadastro
app.post('/api/cadastrar', (req, res) => {
    console.log('📝 Recebido cadastro:', req.body);

    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ 
            success: false,
            message: 'Todos os campos são obrigatórios.' 
        });
    }

    // SIMULAÇÃO - sempre retorna sucesso
    console.log('✅ Cadastro simulado com sucesso para:', email);
    res.status(201).json({ 
        success: true,
        message: 'Cadastro realizado com sucesso!',
        userId: Math.floor(Math.random() * 1000) // ID simulado
    });
});

// Rota para login
app.post('/api/login', (req, res) => {
    console.log('🔐 Tentativa de login:', req.body);

    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ 
            success: false,
            message: 'Email e senha são obrigatórios.' 
        });
    }

    // SIMULAÇÃO - sempre retorna sucesso
    console.log('✅ Login simulado com sucesso para:', email);
    res.json({ 
        success: true,
        message: 'Login realizado com sucesso!',
        user: {
            id: 1,
            nome: 'Usuário Teste',
            email: email
        }
    });
});

// Rota para alugar produto - VERSÃO CORRIGIDA
app.post('/api/alugar', (req, res) => {
    console.log('=== 📦 REQUISIÇÃO DE ALUGUEL RECEBIDA ===');
    console.log('Body recebido:', req.body);
    
    const { id_produto, id_usuario, quantidade } = req.body;
    
    // Validações
    if (!id_produto || !id_usuario || !quantidade) {
        return res.status(400).json({ 
            success: false, 
            message: 'Dados incompletos para aluguel.' 
        });
    }
    
    if (quantidade < 1) {
        return res.status(400).json({ 
            success: false, 
            message: 'Quantidade deve ser maior que zero.' 
        });
    }

    // Verificar estoque no banco de dados
    const checkEstoqueSql = 'SELECT estoque, nome_produto FROM produtos WHERE id_produto = ?';
    
    db.query(checkEstoqueSql, [id_produto], (err, results) => {
        if (err) {
            console.error('❌ Erro ao verificar estoque:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor.' 
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Produto não encontrado.' 
            });
        }
        
        const estoqueAtual = results[0].estoque;
        const nomeProduto = results[0].nome_produto;
        
        if (estoqueAtual < quantidade) {
            return res.status(400).json({ 
                success: false, 
                message: `Estoque insuficiente. Disponível: ${estoqueAtual}` 
            });
        }
        
        // Atualizar estoque no banco
        const updateEstoqueSql = 'UPDATE produtos SET estoque = estoque - ? WHERE id_produto = ?';
        db.query(updateEstoqueSql, [quantidade, id_produto], (err, result) => {
            if (err) {
                console.error('❌ Erro ao atualizar estoque:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao atualizar estoque.' 
                });
            }
            
            console.log('🎉 Aluguel processado com sucesso!');
            
            res.json({ 
                success: true, 
                message: `"${nomeProduto}" alugado com sucesso!`,
                novo_estoque: estoqueAtual - quantidade
            });
        });
    });
});
// ========== ROTAS DE DEBUG ==========

// Rota para testar se o servidor está respondendo
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Servidor funcionando!',
        timestamp: new Date().toISOString(),
        status: 'OK'
    });
});

// Rota para listar todas as rotas disponíveis
app.get('/api/routes', (req, res) => {
    const routes = [
        'GET  /',
        'GET  /cadastro',
        'GET  /login', 
        'GET  /products',
        'POST /api/cadastrar',
        'POST /api/login',
        'POST /api/alugar',
        'GET  /api/test',
        'GET  /api/routes'
    ];
    res.json({ 
        success: true,
        routes: routes 
    });
});

// ========== ROTAS 404 CORRIGIDAS ==========

// Rota 404 para API - CORRIGIDA (sem *)
app.use('/api', (req, res) => {
    res.status(404).json({ 
        success: false,
        message: 'Rota da API não encontrada.' 
    });
});

// Rota 404 geral - CORRIGIDA
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: 'Página não encontrada.' 
    });
});

// Middleware de tratamento de erro
app.use((error, req, res, next) => {
    console.error('❌ Erro não tratado:', error);
    res.status(500).json({ 
        success: false,
        message: 'Erro interno do servidor.' 
    });
});

// ========== INICIAR SERVIDOR ==========

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 SERVIDOR INICIADO COM SUCESSO!');
    console.log('='.repeat(50));
    console.log(`📡 Porta: ${PORT}`);
    console.log(`🏠 Página inicial: http://localhost:${PORT}`);
    console.log(`📝 Cadastro: http://localhost:${PORT}/cadastro`);
    console.log(`🔐 Login: http://localhost:${PORT}/login`);
    console.log(`🛍️  Produtos: http://localhost:${PORT}/products`);
    console.log(`🧪 Teste API: http://localhost:${PORT}/api/test`);
    console.log(`📋 Rotas API: http://localhost:${PORT}/api/routes`);
    console.log('='.repeat(50));
    console.log('✨ Pronto para receber requisições!');
});