const db = require('../config/database');

const alugar = (req, res) => {
    const { id_produto, id_usuario, quantidade } = req.body;

    if (!id_produto || !id_usuario || !quantidade || quantidade < 1) {
        return res.status(400).json({
            success: false,
            message: 'Dados inválidos para aluguel.'
        });
    }

    const sql = 'SELECT estoque, nome_produto FROM produtos WHERE id_produto = ?';
    db.query(sql, [id_produto], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ success: false, message: 'Produto não encontrado' });
        }

        const { estoque, nome_produto } = results[0];

        if (estoque < quantidade) {
            return res.status(400).json({
                success: false,
                message: `Estoque insuficiente. Disponível: ${estoque}`
            });
        }

        db.query(
            'UPDATE produtos SET estoque = estoque - ? WHERE id_produto = ?',
            [quantidade, id_produto],
            (err) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Erro ao alugar' });
                }

                res.json({
                    success: true,
                    message: `${nome_produto} alugado com sucesso!`,
                    novo_estoque: estoque - quantidade
                });
            }
        );
    });
};

module.exports = { alugar };