const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'epi_solution',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log('Pool de conexão MySQL criado com sucesso!');

module.exports = db;