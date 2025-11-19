const form = document.getElementById('cadastro-form');
const passwordError = document.getElementById('password-error');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validação de senha
    if (senha !== confirmPassword) {
        passwordError.style.display = 'inline';
        return;
    } else {
        passwordError.style.display = 'none';
    }

    try {
        // Salva a resposta do fetch em uma variável
        const response = await fetch('http://localhost:3000/api/cadastrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha })
});

        // Converte a resposta para JSON
        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            form.reset(); // Limpa o formulário após sucesso
        } else {
            alert(data.message || 'Erro ao cadastrar.');
        }
    } catch (err) {
        console.error('Erro ao enviar o formulário:', err);
        alert('Não foi possível conectar ao servidor.');
    }
});
