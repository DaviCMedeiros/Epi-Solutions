const db = require("../config/database");
const bcrypt = require("bcrypt");

const cadastrar = async (req, res) => {
  const { nome, email, senha } = req.body;

  // Validação
  if (!nome || !email || !senha) {
    return res.status(400).json({
      success: false,
      message: "Nome, email e senha são obrigatórios.",
    });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    const [resultado] = await db.execute(
      "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
      [nome, email, senhaHash]
    );

    console.log(`Usuário cadastrado com sucesso! ID: ${resultado.insertId}`);

    return res.status(201).json({
      success: true,
      message: "Cadastro realizado com sucesso!",
      userId: resultado.insertId,
    });
  } catch (error) {
    console.error("Erro no cadastro:", error);

    // Email duplicado
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Este email já está cadastrado.",
      });
    }

    // Erro de servidor
    return res.status(500).json({
      success: false,
      message: "Erro interno no servidor. Tente novamente mais tarde.",
    });
  }
};

// Login
const login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res
      .status(400)
      .json({ success: false, message: "Email e senha são obrigatórios." });
  }

  try {
    const [rows] = await db.execute("SELECT * FROM usuarios WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Email ou senha incorretos." });
    }

    const usuario = rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res
        .status(401)
        .json({ success: false, message: "Email ou senha incorretos." });
    }

    return res.json({
      success: true,
      message: "Login realizado com sucesso!",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erro interno no servidor." });
  }
};

module.exports = { cadastrar, login };
