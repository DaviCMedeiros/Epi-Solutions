const express = require('express');
const path = require('path');
const pageRoutes = require('./src/routes/pageRoutes');
const authRoutes = require('./src/routes/authRoutes');
const produtoRoutes = require('./src/routes/produtoRoutes');
const logger = require('./src/middleware/logger');
const corsMiddleware = require('./src/middleware/cors');

const app = express();

// Middlewares
app.use(logger);
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rotas de páginas (HTML)
app.use('/', pageRoutes);

// Rotas da API
app.use('/api', authRoutes);
app.use('/api', produtoRoutes);

// 404 para API
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

// 404 geral
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public'));
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro:', err);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
});

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
    console.log('='.repeat(50));
    console.log('✨ Pronto para receber requisições!');
});