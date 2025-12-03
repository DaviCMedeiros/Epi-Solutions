const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');

router.post('/alugar', produtoController.alugar);

module.exports = router;