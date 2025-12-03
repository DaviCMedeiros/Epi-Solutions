const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res) => res.sendFile(path.join(__dirname, '../../public/index.html')));
router.get('/cadastro', (req, res) => res.sendFile(path.join(__dirname, '../../public/pages/cadastro.html')));
router.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../../public/pages/login.html')));
router.get('/products', (req, res) => res.sendFile(path.join(__dirname, '../../public/pages/products.html')));

// Teste
router.get('/api/test', (req, res) => res.json({ message: 'API MVC funcionando!' }));

module.exports = router;